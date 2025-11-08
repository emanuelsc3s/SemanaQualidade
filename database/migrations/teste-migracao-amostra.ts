/**
 * =====================================================
 * TESTE DE MIGRAÇÃO COM AMOSTRA
 * =====================================================
 * 
 * Script para testar a migração com apenas alguns registros
 * antes de executar a migração completa
 * 
 * Autor: Emanuel
 * Data: 2025-11-08
 * 
 * EXECUÇÃO:
 * npx tsx database/migrations/teste-migracao-amostra.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// =====================================================
// CONFIGURAÇÃO
// =====================================================

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dojavjvqvobnumebaouc.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

// Número de registros para testar (padrão: 5)
const SAMPLE_SIZE = parseInt(process.env.SAMPLE_SIZE || '5', 10);

const JSON_FILE_PATH = path.join(__dirname, '../firebird/funcionarios.json');

// =====================================================
// FUNÇÃO PRINCIPAL
// =====================================================

async function testMigration() {
  console.log('🧪 TESTE DE MIGRAÇÃO - AMOSTRA\n');
  console.log(`📊 Testando com ${SAMPLE_SIZE} registros\n`);
  
  // Validar variáveis de ambiente
  if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ ERRO: SUPABASE_SERVICE_KEY não configurada!');
    process.exit(1);
  }
  
  // Inicializar cliente Supabase
  console.log('🔌 Conectando ao Supabase...');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  console.log('✅ Conectado\n');
  
  // Ler arquivo JSON
  console.log(`📂 Lendo arquivo: ${JSON_FILE_PATH}`);
  
  if (!fs.existsSync(JSON_FILE_PATH)) {
    console.error(`❌ ERRO: Arquivo não encontrado: ${JSON_FILE_PATH}`);
    process.exit(1);
  }
  
  const fileContent = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
  const jsonData = JSON.parse(fileContent);
  const allFuncionarios = jsonData.RecordSet || [];
  
  console.log(`✅ Total de registros no arquivo: ${allFuncionarios.length}\n`);
  
  // Selecionar amostra
  const sample = allFuncionarios.slice(0, SAMPLE_SIZE);
  
  console.log('📋 AMOSTRA SELECIONADA:\n');
  sample.forEach((func, index) => {
    console.log(`${index + 1}. ${func.NOME} (CPF: ${func.CPF}, Matrícula: ${func.MATRICULA})`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('ANÁLISE DA AMOSTRA');
  console.log('='.repeat(60) + '\n');
  
  // Analisar cada registro
  for (let i = 0; i < sample.length; i++) {
    const func = sample[i];
    console.log(`\n📌 Registro ${i + 1}/${sample.length}: ${func.NOME}`);
    console.log('─'.repeat(60));
    
    // Campos obrigatórios
    console.log('\n✅ Campos Obrigatórios:');
    console.log(`   emp_codigo: ${func.EMP_CODIGO || '❌ FALTANDO'}`);
    console.log(`   matricula:  ${func.MATRICULA || '❌ FALTANDO'}`);
    console.log(`   nome:       ${func.NOME || '❌ FALTANDO'}`);
    console.log(`   cpf:        ${func.CPF || '❌ FALTANDO'}`);
    
    // Validar CPF
    if (func.CPF === '00000000000') {
      console.log('   ⚠️  CPF INVÁLIDO (zeros)');
    }
    
    // Dados pessoais
    console.log('\n📋 Dados Pessoais:');
    console.log(`   Data Nascimento: ${func.DTNASCIMENTO || 'N/A'}`);
    console.log(`   Sexo:            ${func.SEXO || 'N/A'}`);
    console.log(`   Estado Civil:    ${func.ESTADOCIVIL_DESC || 'N/A'} (${func.ESTADOCIVIL || 'N/A'})`);
    console.log(`   Mãe:             ${func.MAE || 'N/A'}`);
    console.log(`   Pai:             ${func.PAI || 'N/A'}`);
    
    // Contato
    console.log('\n📞 Contato:');
    console.log(`   Email:   ${func.EMAIL || 'N/A'}`);
    console.log(`   Celular: ${func.CELULAR || 'N/A'}`);
    console.log(`   Telefone: ${func.FONE || 'N/A'}`);
    
    // Endereço
    console.log('\n🏠 Endereço:');
    console.log(`   Logradouro: ${func.ENDERECO || 'N/A'}, ${func.NUMERO || 'S/N'}`);
    console.log(`   Bairro:     ${func.BAIRRO || 'N/A'}`);
    console.log(`   Cidade:     ${func.CIDADE || 'N/A'} - ${func.UF || 'N/A'}`);
    console.log(`   CEP:        ${func.CEP || 'N/A'}`);
    
    // Admissão
    console.log('\n💼 Admissão:');
    console.log(`   Data:        ${func.ADMISSAODATA || 'N/A'}`);
    console.log(`   Tipo:        ${func.ADMISSAOTIPO_DESC || 'N/A'} (${func.ADMISSAOTIPO || 'N/A'})`);
    console.log(`   Tipo eSocial: ${func.ADMISSAOTIPOESOCIAL_DESC || 'N/A'} (${func.ADMISSAOTIPOESOCIAL || 'N/A'})`);
    console.log(`   Vínculo:     ${func.ADMISSAOVINCULO || 'N/A'}`);
    
    // Demissão
    if (func.DEMISSAO_DATA) {
      console.log('\n🚪 Demissão:');
      console.log(`   Data: ${func.DEMISSAO_DATA}`);
      console.log(`   Status: INATIVO`);
    } else {
      console.log('\n✅ Status: ATIVO');
    }
    
    // PCD
    if (func.TEMDEFICIENCIA === 1) {
      console.log('\n♿ Pessoa com Deficiência:');
      console.log(`   Física:       ${func.DEFICIENCIAFISICA === 1 ? 'Sim' : 'Não'}`);
      console.log(`   Visual:       ${func.DEFICIENCIAVISUAL === 1 ? 'Sim' : 'Não'}`);
      console.log(`   Auditiva:     ${func.DEFICIENCIAAUDITIVA === 1 ? 'Sim' : 'Não'}`);
      console.log(`   Mental:       ${func.DEFICIENCIAMENTAL === 1 ? 'Sim' : 'Não'}`);
      console.log(`   Intelectual:  ${func.DEFICIENCIAINTELECTUAL === 1 ? 'Sim' : 'Não'}`);
      console.log(`   Preenche cota: ${func.PREENCHECOTADEFICIENCIA === 1 ? 'Sim' : 'Não'}`);
    }
    
    // Escolaridade
    console.log('\n🎓 Escolaridade:');
    console.log(`   ${func.GRAUINSTRUCAO_DESC || 'N/A'} (${func.ESCOLARIDADE_CODIGO || 'N/A'})`);
    
    // Verificar se empresa existe
    console.log('\n🔍 Verificando dependências...');
    
    const { data: empresa, error: empresaError } = await supabase
      .from('tbempresa')
      .select('codigo, razao_social')
      .eq('codigo', func.EMP_CODIGO)
      .single();
    
    if (empresaError || !empresa) {
      console.log(`   ❌ Empresa ${func.EMP_CODIGO} NÃO ENCONTRADA no Supabase`);
      console.log(`      Será necessário inserir a empresa antes da migração`);
    } else {
      console.log(`   ✅ Empresa encontrada: ${empresa.razao_social}`);
    }
    
    // Verificar se cidade existe
    if (func.UF && func.CIDADE) {
      const { data: cidade, error: cidadeError } = await supabase
        .from('tbcidade')
        .select('cidade_id, nome')
        .eq('uf', func.UF)
        .ilike('nome', func.CIDADE)
        .limit(1)
        .single();
      
      if (cidadeError || !cidade) {
        console.log(`   ⚠️  Cidade ${func.CIDADE}-${func.UF} NÃO ENCONTRADA`);
        console.log(`      cidade_id será NULL`);
      } else {
        console.log(`   ✅ Cidade encontrada: ${cidade.nome} (ID: ${cidade.cidade_id})`);
      }
    }
    
    // Verificar se CPF já existe
    const { data: existingFunc, error: cpfError } = await supabase
      .from('tbfuncionario')
      .select('cpf, nome')
      .eq('cpf', formatCPF(func.CPF))
      .single();
    
    if (!cpfError && existingFunc) {
      console.log(`   ⚠️  CPF JÁ EXISTE no banco: ${existingFunc.nome}`);
      console.log(`      Este registro será IGNORADO na migração`);
    } else {
      console.log(`   ✅ CPF disponível para inserção`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('RESUMO DO TESTE');
  console.log('='.repeat(60) + '\n');
  
  const validRecords = sample.filter(f => 
    f.EMP_CODIGO && f.MATRICULA && f.NOME && f.CPF && f.CPF !== '00000000000'
  );
  
  console.log(`✅ Registros válidos:   ${validRecords.length}/${sample.length}`);
  console.log(`❌ Registros inválidos: ${sample.length - validRecords.length}/${sample.length}`);
  
  console.log('\n📝 PRÓXIMOS PASSOS:\n');
  console.log('1. Revisar os dados acima');
  console.log('2. Corrigir problemas identificados (empresas faltantes, etc)');
  console.log('3. Se tudo estiver OK, executar migração completa:');
  console.log('   npx tsx database/migrations/migrate-funcionarios-firebird-to-supabase.ts\n');
  
  console.log('🎉 Teste concluído!');
}

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

function formatCPF(cpf: string): string {
  if (!cpf) return '';
  const cleaned = cpf.replace(/\D/g, '').padStart(11, '0');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// =====================================================
// EXECUÇÃO
// =====================================================

testMigration().catch((error) => {
  console.error('\n❌ ERRO FATAL:', error);
  process.exit(1);
});

