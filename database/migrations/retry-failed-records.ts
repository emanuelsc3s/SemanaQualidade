/**
 * =====================================================
 * SCRIPT DE RE-MIGRAÇÃO: Registros que Falharam
 * =====================================================
 *
 * Re-executa a migração apenas para os registros que falharam
 * na primeira execução, usando o arquivo migration-errors.json
 *
 * Autor: Emanuel
 * Data: 2025-11-08
 *
 * EXECUÇÃO:
 * npx tsx database/migrations/retry-failed-records.ts
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// =====================================================
// CONFIGURAÇÃO
// =====================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

const ERRORS_FILE = path.join(__dirname, 'migration-errors.json');
const JSON_FILE_PATH = path.join(__dirname, '../firebird/funcionarios.json');

// =====================================================
// INTERFACES
// =====================================================

interface ErrorRecord {
  record: {
    cpf: string;
    nome: string;
    matricula: string;
  };
  error: string;
  details?: string;
}

interface FuncionarioFirebird {
  EMP_CODIGO: string;
  MATRICULA: string;
  NOME: string;
  CPF: string;
  [key: string]: unknown;
}

interface FuncionarioSupabaseRecord {
  emp_codigo: string;
  matricula: string;
  nome: string;
  nome_social?: string | null;
  cpf: string;
  pis: string | null;
  dtnascimento: string | null;
  sexo: string | null;
  estadocivil_id: number | null;
  estadocivil_descricao: string | null;
  mae_nome: string | null;
  pai_nome: string | null;
  email: string | null;
  ddd: string | null;
  fone: string | null;
  celular: string | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cep: string | null;
  cidade_id: number | null;
  cidade_nome: string | null;
  cidade_uf: string | null;
  ctps_numero: string | null;
  ctps_serie: string | null;
  ctps_dv: string | null;
  uf_ctps: string | null;
  ctps_dtexpedicao: string | null;
  identidade_numero: string | null;
  identidade_orgao_expedidor: string | null;
  identidade_dtexpedicao: string | null;
  titulo: string | null;
  zona: string | null;
  secao: string | null;
  admissao_data: string | null;
  admissao_tipo: string | null;
  admissao_tipo_esocial: string | null;
  admissao_vinculo: string | null;
  dt_rescisao: string | null;
  tem_deficiencia: boolean;
  preenche_cota_deficiencia: boolean;
  deficiencia_fisica: boolean;
  deficiencia_visual: boolean;
  deficiencia_auditiva: boolean;
  deficiencia_mental: boolean;
  deficiencia_intelectual: boolean;
  grau_instrucao: string | null;
  grauinstrucao_desc: string | null;
  cargo_id: number | null;
  cargo: string | null;
  cargo_codigo: string | null;
  funcao_id: number | null;
  funcao: string | null;
  funcao_codigo: string | null;
  lotacao_id: number | null;
  lotacao: string | null;
  lotacao_codigo: string | null;
  ativo: boolean;
}

// =====================================================
// FUNÇÕES AUXILIARES (importadas do script original)
// =====================================================

function parseFirebirdDate(dateStr: string | null): string | null {
  if (!dateStr || dateStr.trim() === '') return null;

  try {
    const parts = dateStr.split(' ')[0].split('.');
    if (parts.length !== 3) return null;

    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  } catch {
    return null;
  }
}

function numberToBoolean(value: number): boolean {
  return value === 1;
}

function formatCPF(cpf: string): string {
  if (!cpf) return '';
  const cleaned = cpf.replace(/\D/g, '').padStart(11, '0');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatCEP(cep: string | null): string | null {
  if (!cep) return null;
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length !== 8) return cep;
  return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
}

function mapEstadoCivilId(codigo: string | null): number | null {
  if (!codigo) return null;
  const mapping: Record<string, number> = {
    '01': 1, '02': 2, '03': 3, '04': 4, '05': 5,
  };
  return mapping[codigo] || null;
}

function normalizeEscolaridadeCodigo(codigo: string): string | null {
  if (!codigo) return null;
  const normalized = parseInt(codigo, 10).toString().padStart(2, '0');
  const num = parseInt(normalized, 10);
  if (num >= 1 && num <= 12) {
    return normalized;
  }
  return null;
}

function transformRecord(firebird: FuncionarioFirebird): FuncionarioSupabaseRecord {
  return {
    emp_codigo: firebird.EMP_CODIGO,
    matricula: firebird.MATRICULA,
    nome: firebird.NOME,
    nome_social: firebird.NOMESOCIAL,
    cpf: formatCPF(firebird.CPF),
    pis: firebird.PIS || null,
    dtnascimento: parseFirebirdDate(firebird.DTNASCIMENTO),
    sexo: firebird.SEXO || null,
    estadocivil_id: mapEstadoCivilId(firebird.ESTADOCIVIL),
    estadocivil_descricao: firebird.ESTADOCIVIL_DESC || null,
    mae_nome: firebird.MAE || null,
    pai_nome: firebird.PAI || null,
    email: firebird.EMAIL || null,
    ddd: firebird.DDD || null,
    fone: firebird.FONE || null,
    celular: firebird.CELULAR || null,
    endereco: firebird.ENDERECO || null,
    numero: firebird.NUMERO || null,
    complemento: firebird.COMPLEMENTO || null,
    bairro: firebird.BAIRRO || null,
    cep: formatCEP(firebird.CEP),
    cidade_id: null,
    cidade_nome: firebird.CIDADE || null,
    cidade_uf: firebird.UF || null,
    ctps_numero: firebird.CTPS_NUMERO || null,
    ctps_serie: firebird.CTPS_SERIE || null,
    ctps_dv: firebird.CTPS_DV || null,
    uf_ctps: firebird.CTPS_UF || null,
    ctps_dtexpedicao: parseFirebirdDate(firebird.CTPS_DTEXPEDICAO),
    identidade_numero: firebird.IDENTIDADENUMERO || null,
    identidade_orgao_expedidor: firebird.IDENTIDADEORGAOEXPEDIDOR || null,
    identidade_dtexpedicao: parseFirebirdDate(firebird.IDENTIDADEDTEXPEDICAO),
    titulo: firebird.TITULO || null,
    zona: firebird.ZONA || null,
    secao: firebird.SECAO || null,
    admissao_data: parseFirebirdDate(firebird.ADMISSAODATA),
    admissao_tipo: firebird.ADMISSAOTIPO || null,
    admissao_tipo_esocial: firebird.ADMISSAOTIPOESOCIAL?.padStart(2, '0') || null,
    admissao_vinculo: firebird.ADMISSAOVINCULO || null,
    dt_rescisao: parseFirebirdDate(firebird.DEMISSAO_DATA),
    tem_deficiencia: numberToBoolean(firebird.TEMDEFICIENCIA),
    preenche_cota_deficiencia: numberToBoolean(firebird.PREENCHECOTADEFICIENCIA),
    deficiencia_fisica: numberToBoolean(firebird.DEFICIENCIAFISICA),
    deficiencia_visual: numberToBoolean(firebird.DEFICIENCIAVISUAL),
    deficiencia_auditiva: numberToBoolean(firebird.DEFICIENCIAAUDITIVA),
    deficiencia_mental: numberToBoolean(firebird.DEFICIENCIAMENTAL),
    deficiencia_intelectual: numberToBoolean(firebird.DEFICIENCIAINTELECTUAL),
    grau_instrucao: normalizeEscolaridadeCodigo(firebird.ESCOLARIDADE_CODIGO),
    grauinstrucao_desc: firebird.GRAUINSTRUCAO_DESC || null,
    cargo_id: null,
    cargo: firebird.CARGO || null,
    cargo_codigo: firebird.CARGO_CODIGO || null,
    funcao_id: null,
    funcao: firebird.FUNCAO || null,
    funcao_codigo: firebird.FUNCAO_CODIGO || null,
    lotacao_id: null,
    lotacao: firebird.LOTACAO || null,
    lotacao_codigo: firebird.LOTACAO_CODIGO || null,
    ativo: !firebird.DEMISSAO_DATA,
  };
}

async function resolveCidadeId(supabase: SupabaseClient, uf: string | null, cidadeNome: string | null): Promise<number | null> {
  if (!uf || !cidadeNome) return null;
  try {
    const { data, error } = await supabase
      .from('tbcidade')
      .select('cidade_id')
      .eq('uf', uf)
      .ilike('nome', cidadeNome)
      .limit(1)
      .single();
    if (error || !data) return null;
    return data.cidade_id;
  } catch {
    return null;
  }
}

async function resolveCargoId(supabase: SupabaseClient, cargoCodigo: string | null): Promise<number | null> {
  if (!cargoCodigo) return null;
  try {
    const { data, error } = await supabase
      .from('tbcargo')
      .select('cargo_id')
      .eq('codigo', cargoCodigo)
      .limit(1)
      .single();
    if (error || !data) return null;
    return data.cargo_id;
  } catch {
    return null;
  }
}

async function resolveFuncaoId(supabase: SupabaseClient, funcaoCodigo: string | null): Promise<number | null> {
  if (!funcaoCodigo) return null;
  try {
    const { data, error } = await supabase
      .from('tbfuncao')
      .select('funcao_id')
      .eq('codigo', funcaoCodigo)
      .limit(1)
      .single();
    if (error || !data) return null;
    return data.funcao_id;
  } catch {
    return null;
  }
}

async function resolveLotacaoId(supabase: SupabaseClient, lotacaoCodigo: string | null): Promise<number | null> {
  if (!lotacaoCodigo) return null;
  try {
    const { data, error } = await supabase
      .from('tblotacao')
      .select('lotacao_id')
      .eq('codigo', lotacaoCodigo)
      .limit(1)
      .single();
    if (error || !data) return null;
    return data.lotacao_id;
  } catch {
    return null;
  }
}

// =====================================================
// FUNÇÃO PRINCIPAL
// =====================================================

async function retryFailedRecords() {
  console.log('🔄 Iniciando re-migração de registros que falharam\n');

  // Validar variáveis de ambiente
  if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ ERRO: SUPABASE_SERVICE_KEY não configurada!');
    process.exit(1);
  }

  // Conectar ao Supabase
  console.log('🔌 Conectando ao Supabase...');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  console.log('✅ Conectado ao Supabase\n');

  // Ler arquivo de erros
  console.log(`📂 Lendo arquivo de erros: ${ERRORS_FILE}`);
  if (!fs.existsSync(ERRORS_FILE)) {
    console.error(`❌ ERRO: Arquivo não encontrado: ${ERRORS_FILE}`);
    process.exit(1);
  }

  const errorsContent = fs.readFileSync(ERRORS_FILE, 'utf-8');
  const errors: ErrorRecord[] = JSON.parse(errorsContent);
  console.log(`✅ ${errors.length} registros com erro encontrados\n`);

  // Extrair CPFs dos registros com erro (sem formatação)
  const failedCPFs = errors.map(e => e.record.cpf.replace(/\D/g, ''));
  console.log(`🔍 CPFs a serem re-processados: ${failedCPFs.length}\n`);

  // Ler arquivo JSON completo
  console.log(`📂 Lendo arquivo: ${JSON_FILE_PATH}`);
  if (!fs.existsSync(JSON_FILE_PATH)) {
    console.error(`❌ ERRO: Arquivo não encontrado: ${JSON_FILE_PATH}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
  const jsonData = JSON.parse(fileContent);
  const allFuncionarios: FuncionarioFirebird[] = jsonData.RecordSet || [];

  // Filtrar apenas os registros que falharam
  const funcionariosToRetry = allFuncionarios.filter(f => {
    if (!f.CPF) return false;
    const cpfClean = f.CPF.replace(/\D/g, '').padStart(11, '0');
    return failedCPFs.includes(cpfClean);
  });

  console.log(`✅ ${funcionariosToRetry.length} registros encontrados para re-migração\n`);

  // Processar registros
  let success = 0;
  let failed = 0;
  const newErrors: ErrorRecord[] = [];

  console.log('🔄 Iniciando inserção...\n');

  for (let i = 0; i < funcionariosToRetry.length; i++) {
    const firebird = funcionariosToRetry[i];
    const record = transformRecord(firebird);

    // Resolver IDs de relacionamentos
    if (record.cidade_uf && record.cidade_nome) {
      record.cidade_id = await resolveCidadeId(supabase, record.cidade_uf, record.cidade_nome);
    }
    if (record.cargo_codigo) {
      record.cargo_id = await resolveCargoId(supabase, record.cargo_codigo);
    }
    if (record.funcao_codigo) {
      record.funcao_id = await resolveFuncaoId(supabase, record.funcao_codigo);
    }
    if (record.lotacao_codigo) {
      record.lotacao_id = await resolveLotacaoId(supabase, record.lotacao_codigo);
    }

    // Tentar inserir
    const { error } = await supabase
      .from('tbfuncionario')
      .insert([record]);

    if (error) {
      failed++;
      newErrors.push({
        record: { cpf: record.cpf, nome: record.nome, matricula: record.matricula },
        error: error.message,
        details: error.details || error.hint,
      });
      console.log(`❌ [${i + 1}/${funcionariosToRetry.length}] ${record.nome} - FALHOU`);
      console.log(`   Erro: ${error.message}\n`);
    } else {
      success++;
      console.log(`✅ [${i + 1}/${funcionariosToRetry.length}] ${record.nome} - SUCESSO`);
    }
  }

  console.log('\n✅ Re-migração concluída!\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('                RESUMO DA RE-MIGRAÇÃO                  ');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📊 Total de registros:        ${funcionariosToRetry.length}`);
  console.log(`✅ Inseridos com sucesso:     ${success}`);
  console.log(`❌ Falharam novamente:        ${failed}`);
  console.log('═══════════════════════════════════════════════════════\n');

  if (newErrors.length > 0) {
    console.log('⚠️  ERROS PERSISTENTES:\n');
    newErrors.forEach((err, index) => {
      console.log(`${index + 1}. CPF: ${err.record.cpf} | Nome: ${err.record.nome}`);
      console.log(`   Erro: ${err.error}\n`);
    });

    const newErrorsPath = path.join(__dirname, 'migration-errors-retry.json');
    fs.writeFileSync(newErrorsPath, JSON.stringify(newErrors, null, 2));
    console.log(`📝 Novos erros salvos em: ${newErrorsPath}\n`);
  }

  console.log('🎉 Processo finalizado!');
}

// =====================================================
// EXECUÇÃO
// =====================================================

retryFailedRecords().catch((error) => {
  console.error('\n❌ ERRO FATAL:', error);
  process.exit(1);
});

