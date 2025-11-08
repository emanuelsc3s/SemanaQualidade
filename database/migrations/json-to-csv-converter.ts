/**
 * =====================================================
 * CONVERSOR: JSON → CSV
 * =====================================================
 * 
 * Converte o arquivo funcionarios.json para CSV
 * para uso com o script SQL alternativo
 * 
 * Autor: Emanuel
 * Data: 2025-11-08
 * 
 * EXECUÇÃO:
 * npx tsx database/migrations/json-to-csv-converter.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// =====================================================
// CONFIGURAÇÃO
// =====================================================

const JSON_FILE_PATH = path.join(__dirname, '../firebird/funcionarios.json');
const CSV_FILE_PATH = path.join(__dirname, '../firebird/funcionarios.csv');

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

/**
 * Escapa valores para CSV (adiciona aspas se necessário)
 */
function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const str = String(value);
  
  // Se contém vírgula, aspas ou quebra de linha, envolve em aspas
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    // Duplica aspas internas
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

/**
 * Converte array de objetos para CSV
 */
function jsonToCsv(data: Array<Record<string, unknown>>): string {
  if (data.length === 0) {
    return '';
  }
  
  // Cabeçalho (nomes das colunas)
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  // Linhas de dados
  const csvRows = data.map(row => {
    return headers.map(header => escapeCsvValue(row[header])).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

// =====================================================
// FUNÇÃO PRINCIPAL
// =====================================================

async function convertJsonToCsv() {
  console.log('🔄 Iniciando conversão JSON → CSV\n');
  
  // Verificar se arquivo JSON existe
  if (!fs.existsSync(JSON_FILE_PATH)) {
    console.error(`❌ ERRO: Arquivo não encontrado: ${JSON_FILE_PATH}`);
    process.exit(1);
  }
  
  console.log(`📂 Lendo arquivo JSON: ${JSON_FILE_PATH}`);
  
  // Ler arquivo JSON
  const fileContent = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
  const jsonData = JSON.parse(fileContent);
  const funcionarios = jsonData.RecordSet || [];
  
  console.log(`✅ ${funcionarios.length} registros encontrados\n`);
  
  // Converter para CSV
  console.log('⚙️  Convertendo para CSV...');
  const csvContent = jsonToCsv(funcionarios);
  
  // Salvar arquivo CSV
  console.log(`💾 Salvando arquivo CSV: ${CSV_FILE_PATH}`);
  fs.writeFileSync(CSV_FILE_PATH, csvContent, 'utf-8');
  
  console.log('✅ Conversão concluída!\n');
  
  // Estatísticas
  const csvSize = (fs.statSync(CSV_FILE_PATH).size / 1024).toFixed(2);
  console.log('═══════════════════════════════════════════════════════');
  console.log('                    RESUMO                             ');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📊 Total de registros:     ${funcionarios.length}`);
  console.log(`📁 Arquivo CSV gerado:     ${CSV_FILE_PATH}`);
  console.log(`📏 Tamanho do arquivo:     ${csvSize} KB`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('🎉 Processo finalizado!');
  console.log('\n📝 Próximos passos:');
  console.log('   1. Abra o Supabase SQL Editor');
  console.log('   2. Execute o script: migrate-funcionarios-sql-alternative.sql');
  console.log('   3. Faça upload do arquivo CSV quando solicitado\n');
}

// =====================================================
// EXECUÇÃO
// =====================================================

convertJsonToCsv().catch((error) => {
  console.error('\n❌ ERRO FATAL:', error);
  process.exit(1);
});

