/**
 * =====================================================
 * SCRIPT DE MIGRAÇÃO: Firebird → Supabase PostgreSQL
 * =====================================================
 *
 * Migra dados de funcionários do arquivo JSON (exportado do Firebird)
 * para a tabela tbfuncionario no Supabase PostgreSQL 15+
 *
 * Autor: Emanuel
 * Data: 2025-11-08
 * Projeto: FARMACE - Sistema de Gestão de Funcionários
 *
 * REQUISITOS:
 * - Node.js 18+
 * - @supabase/supabase-js
 * - Variáveis de ambiente: SUPABASE_URL, SUPABASE_SERVICE_KEY
 *
 * EXECUÇÃO:
 * npx tsx database/migrations/migrate-funcionarios-firebird-to-supabase.ts
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// =====================================================
// CONFIGURAÇÃO
// =====================================================

// Obter __dirname em módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

// Tamanho do lote para inserções (batch insert)
const BATCH_SIZE = 50;

// Caminho do arquivo JSON
const JSON_FILE_PATH = path.join(__dirname, '../firebird/funcionarios.json');

// =====================================================
// TIPOS E INTERFACES
// =====================================================

interface FuncionarioFirebird {
  EMP_CODIGO: string;
  MATRICULA: string;
  NOME: string;
  NOMESOCIAL: string | null;
  CPF: string;
  PIS: string;
  DTNASCIMENTO: string;
  SEXO: string;
  ESTADOCIVIL: string | null;
  ESTADOCIVIL_DESC: string;
  MAE: string | null;
  PAI: string | null;
  EMAIL: string | null;
  DDD: string | null;
  FONE: string | null;
  CELULAR: string | null;
  ENDERECO: string | null;
  NUMERO: string | null;
  COMPLEMENTO: string | null;
  BAIRRO: string | null;
  CEP: string | null;
  UF: string | null;
  CIDADE_CODIGO: string | null;
  CIDADE: string | null;
  CTPS_NUMERO: string | null;
  CTPS_SERIE: string | null;
  CTPS_DV: string | null;
  CTPS_UF: string | null;
  CTPS_DTEXPEDICAO: string | null;
  IDENTIDADENUMERO: string | null;
  IDENTIDADEORGAOEXPEDIDOR: string | null;
  IDENTIDADEDTEXPEDICAO: string | null;
  TITULO: string | null;
  ZONA: string | null;
  SECAO: string | null;
  ADMISSAODATA: string;
  ADMISSAOTIPO: string;
  ADMISSAOTIPO_DESC: string;
  ADMISSAOTIPOESOCIAL: string;
  ADMISSAOTIPOESOCIAL_DESC: string;
  ADMISSAOVINCULO: string;
  ADMISSAOVINCULO_DESC: string;
  DEMISSAO_DATA: string | null;
  TEMDEFICIENCIA: number;
  PREENCHECOTADEFICIENCIA: number;
  DEFICIENCIAFISICA: number;
  DEFICIENCIAVISUAL: number;
  DEFICIENCIAAUDITIVA: number;
  DEFICIENCIAMENTAL: number;
  DEFICIENCIAINTELECTUAL: number;
  ESCOLARIDADE_CODIGO: string;
  GRAUINSTRUCAO_DESC: string;
  CARGO_CODIGO: string | null;
  CARGO: string | null;
  FUNCAO_CODIGO: string | null;
  FUNCAO: string | null;
  LOTACAO_CODIGO: string | null;
  LOTACAO: string | null;
}

interface FuncionarioSupabase {
  emp_codigo: string;
  matricula: string;
  nome: string;
  nome_social: string | null;
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

interface MigrationErrorEntry {
  record: { cpf: string; nome: string; matricula: string };
  error: string;
  details?: string;
}

interface MigrationStats {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  errors: MigrationErrorEntry[];
}

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

/**
 * Converte data do formato Firebird (DD.MM.YYYY HH:MM) para ISO (YYYY-MM-DD)
 */
function parseFirebirdDate(dateStr: string | null): string | null {
  if (!dateStr || dateStr.trim() === '') return null;

  try {
    // Formato: "05.10.1983 00:00"
    const parts = dateStr.split(' ')[0].split('.');
    if (parts.length !== 3) return null;

    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  } catch (error) {
    console.warn(`⚠️  Erro ao converter data: ${dateStr}`, error);
    return null;
  }
}

/**
 * Converte número (0 ou 1) para boolean
 */
function numberToBoolean(value: number): boolean {
  return value === 1;
}

/**
 * Formata CPF removendo zeros à esquerda e adicionando pontuação
 */
function formatCPF(cpf: string): string {
  if (!cpf) return '';

  // Remove zeros à esquerda e formata
  const cleaned = cpf.replace(/\D/g, '').padStart(11, '0');

  // Formato: XXX.XXX.XXX-XX
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata CEP
 */
function formatCEP(cep: string | null): string | null {
  if (!cep) return null;

  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length !== 8) return cep;

  // Formato: XXXXX-XXX
  return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
}

/**
 * Mapeia código de estado civil para ID
 */
function mapEstadoCivilId(codigo: string | null): number | null {
  if (!codigo) return null;

  const mapping: Record<string, number> = {
    '01': 1, // Solteiro
    '02': 2, // Casado
    '03': 3, // Divorciado
    '04': 4, // Separado
    '05': 5, // Viúvo
  };

  return mapping[codigo] || null;
}

/**
 * Normaliza código de escolaridade (remove zeros à esquerda)
 */
function normalizeEscolaridadeCodigo(codigo: string): string | null {
  if (!codigo) return null;

  // Remove zeros à esquerda e garante 2 dígitos
  const normalized = parseInt(codigo, 10).toString().padStart(2, '0');

  // Valida se está entre 01 e 12
  const num = parseInt(normalized, 10);
  if (num >= 1 && num <= 12) {
    return normalized;
  }

  return null;
}

/**
 * Transforma registro do Firebird para formato Supabase
 */
function transformRecord(firebird: FuncionarioFirebird): FuncionarioSupabase {
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
    cidade_id: null, // Será resolvido via lookup na tabela tbcidade
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
    cargo_id: null, // Será resolvido via lookup na tabela tbcargo
    cargo: firebird.CARGO || null,
    cargo_codigo: firebird.CARGO_CODIGO || null,
    funcao_id: null, // Será resolvido via lookup na tabela tbfuncao
    funcao: firebird.FUNCAO || null,
    funcao_codigo: firebird.FUNCAO_CODIGO || null,
    lotacao_id: null, // Será resolvido via lookup na tabela tblotacao
    lotacao: firebird.LOTACAO || null,
    lotacao_codigo: firebird.LOTACAO_CODIGO || null,
    ativo: !firebird.DEMISSAO_DATA, // Ativo se não tem data de demissão
  };
}

/**
 * Valida se um registro possui os campos obrigatórios
 */
function validateRecord(record: FuncionarioSupabase): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!record.emp_codigo) errors.push('emp_codigo é obrigatório');
  if (!record.matricula) errors.push('matricula é obrigatória');
  if (!record.nome) errors.push('nome é obrigatório');
  if (!record.cpf) errors.push('cpf é obrigatório');

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Busca cidade_id baseado em UF e nome da cidade
 */
async function resolveCidadeId(
  supabase: SupabaseClient,
  uf: string | null,
  cidadeNome: string | null
): Promise<number | null> {
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

/**
 * Busca cargo_id baseado no código do cargo
 */
async function resolveCargoId(
  supabase: SupabaseClient,
  cargoCodigo: string | null
): Promise<number | null> {
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

/**
 * Busca funcao_id baseado no código da função
 */
async function resolveFuncaoId(
  supabase: SupabaseClient,
  funcaoCodigo: string | null
): Promise<number | null> {
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

/**
 * Busca lotacao_id baseado no código da lotação
 */
async function resolveLotacaoId(
  supabase: SupabaseClient,
  lotacaoCodigo: string | null
): Promise<number | null> {
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

/**
 * Insere um lote de registros no Supabase
 */
async function insertBatch(
  supabase: SupabaseClient,
  records: FuncionarioSupabase[]
): Promise<{ success: number; failed: number; errors: MigrationErrorEntry[] }> {
  const errors: MigrationErrorEntry[] = [];
  let success = 0;
  let failed = 0;

  // Resolve IDs de relacionamentos para todos os registros do lote
  for (const record of records) {
    // Resolve cidade_id
    if (record.cidade_uf && record.cidade_nome) {
      record.cidade_id = await resolveCidadeId(supabase, record.cidade_uf, record.cidade_nome);
    }

    // Resolve cargo_id
    if (record.cargo_codigo) {
      record.cargo_id = await resolveCargoId(supabase, record.cargo_codigo);
    }

    // Resolve funcao_id
    if (record.funcao_codigo) {
      record.funcao_id = await resolveFuncaoId(supabase, record.funcao_codigo);
    }

    // Resolve lotacao_id
    if (record.lotacao_codigo) {
      record.lotacao_id = await resolveLotacaoId(supabase, record.lotacao_codigo);
    }
  }

  // Tenta inserir o lote completo
  const { error } = await supabase
    .from('tbfuncionario')
    .insert(records)
    .select();

  if (error) {
    // Se falhar, tenta inserir um por um para identificar problemas
    console.warn(`\n⚠️  Erro ao inserir lote completo: ${error.message}`);
    console.warn(`   Detalhes: ${JSON.stringify(error.details || error.hint || 'N/A')}`);
    console.warn(`   Tentando individualmente...\n`);

    for (const record of records) {
      const { error: individualError } = await supabase
        .from('tbfuncionario')
        .insert([record]);

      if (individualError) {
        failed++;
        errors.push({
          record: { cpf: record.cpf, nome: record.nome, matricula: record.matricula },
          error: individualError.message,
          details: individualError.details || individualError.hint,
        });
      } else {
        success++;
      }
    }
  } else {
    success = records.length;
  }

  return { success, failed, errors };
}

/**
 * Exibe barra de progresso no console
 */
function printProgress(current: number, total: number, stats: MigrationStats) {
  const percentage = ((current / total) * 100).toFixed(1);
  const barLength = 40;
  const filledLength = Math.round((current / total) * barLength);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);

  process.stdout.write(
    `\r[${bar}] ${percentage}% | ` +
    `✅ ${stats.success} | ❌ ${stats.failed} | ⏭️  ${stats.skipped} | Total: ${current}/${total}`
  );
}

// =====================================================
// FUNÇÃO PRINCIPAL DE MIGRAÇÃO
// =====================================================

async function migrate() {
  console.log('🚀 Iniciando migração de funcionários Firebird → Supabase\n');

  // Validar variáveis de ambiente
  if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ ERRO: SUPABASE_SERVICE_KEY não configurada!');
    console.error('   Configure a variável de ambiente antes de executar o script.');
    process.exit(1);
  }

  // Inicializar cliente Supabase
  console.log('🔌 Conectando ao Supabase...');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  console.log('✅ Conectado ao Supabase\n');

  // Verificar se a tabela existe e está acessível
  console.log('🔍 Verificando tabela tbfuncionario...');
  const { error: testError } = await supabase
    .from('tbfuncionario')
    .select('*')
    .limit(1);

  if (testError) {
    console.error('❌ ERRO ao acessar tabela tbfuncionario:');
    console.error(`   Mensagem: ${testError.message}`);
    console.error(`   Código: ${testError.code}`);
    console.error(`   Detalhes: ${JSON.stringify(testError.details || testError.hint || 'N/A')}`);
    console.error('\n💡 Verifique se:');
    console.error('   1. A tabela tbfuncionario existe no banco de dados');
    console.error('   2. A service_role key tem permissões corretas');
    console.error('   3. As políticas RLS estão configuradas corretamente\n');
    process.exit(1);
  }

  console.log('✅ Tabela tbfuncionario acessível\n');

  // Ler arquivo JSON
  console.log(`📂 Lendo arquivo: ${JSON_FILE_PATH}`);

  if (!fs.existsSync(JSON_FILE_PATH)) {
    console.error(`❌ ERRO: Arquivo não encontrado: ${JSON_FILE_PATH}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
  const jsonData = JSON.parse(fileContent);
  const allFuncionarios: FuncionarioFirebird[] = jsonData.RecordSet || [];

  console.log(`✅ Arquivo lido com sucesso: ${allFuncionarios.length} registros encontrados\n`);

  // Filtrar apenas registros com EMP_CODIGO = "0002"
  const funcionarios = allFuncionarios.filter(f => f.EMP_CODIGO === '0002');
  console.log(`🔍 Filtrando apenas EMP_CODIGO = "0002": ${funcionarios.length} registros\n`);

  // Estatísticas
  const stats: MigrationStats = {
    total: funcionarios.length,
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  // Processar em lotes
  console.log(`⚙️  Processando em lotes de ${BATCH_SIZE} registros...\n`);

  const batches: FuncionarioSupabase[][] = [];
  let currentBatch: FuncionarioSupabase[] = [];

  for (let i = 0; i < funcionarios.length; i++) {
    const firebird = funcionarios[i];
    const supabase = transformRecord(firebird);

    // Validar registro
    const validation = validateRecord(supabase);

    if (!validation.valid) {
      stats.skipped++;
      stats.errors.push({
        record: { cpf: firebird.CPF, nome: firebird.NOME, matricula: firebird.MATRICULA },
        error: `Validação falhou: ${validation.errors.join(', ')}`,
      });
      continue;
    }

    currentBatch.push(supabase);

    if (currentBatch.length === BATCH_SIZE) {
      batches.push(currentBatch);
      currentBatch = [];
    }
  }

  // Adicionar último lote se não estiver vazio
  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  console.log(`📦 Total de lotes: ${batches.length}\n`);
  console.log('🔄 Iniciando inserção...\n');

  // Processar cada lote
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const result = await insertBatch(supabase, batch);

    stats.success += result.success;
    stats.failed += result.failed;
    stats.errors.push(...result.errors);

    printProgress(stats.success + stats.failed + stats.skipped, stats.total, stats);
  }

  console.log('\n\n✅ Migração concluída!\n');

  // Exibir resumo
  console.log('═══════════════════════════════════════════════════════');
  console.log('                    RESUMO DA MIGRAÇÃO                 ');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📊 Total de registros:        ${stats.total}`);
  console.log(`✅ Inseridos com sucesso:     ${stats.success}`);
  console.log(`❌ Falharam:                  ${stats.failed}`);
  console.log(`⏭️  Ignorados (validação):     ${stats.skipped}`);
  console.log('═══════════════════════════════════════════════════════\n');

  // Exibir erros se houver
  if (stats.errors.length > 0) {
    console.log('⚠️  ERROS ENCONTRADOS:\n');

    stats.errors.slice(0, 10).forEach((err, index) => {
      console.log(`${index + 1}. CPF: ${err.record.cpf} | Nome: ${err.record.nome}`);
      console.log(`   Erro: ${err.error}\n`);
    });

    if (stats.errors.length > 10) {
      console.log(`... e mais ${stats.errors.length - 10} erros.\n`);
    }

    // Salvar log de erros
    const errorLogPath = path.join(__dirname, 'migration-errors.json');
    fs.writeFileSync(errorLogPath, JSON.stringify(stats.errors, null, 2));
    console.log(`📝 Log completo de erros salvo em: ${errorLogPath}\n`);
  }

  console.log('🎉 Processo finalizado!');
}

// =====================================================
// EXECUÇÃO
// =====================================================

migrate().catch((error) => {
  console.error('\n❌ ERRO FATAL:', error);
  process.exit(1);
});

