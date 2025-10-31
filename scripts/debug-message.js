/**
 * Script para debugar a mensagem de confirmação do WhatsApp
 * Testa a geração da mensagem e mostra informações detalhadas
 */

// Simula a função gerarMensagemConfirmacao
function gerarMensagemConfirmacao(nome, numeroParticipante, categoria) {
  const primeiroNome = nome.split(' ')[0]
  
  // Formata a categoria para exibição
  const categoriaFormatada = categoria === '3km' ? '3 km (caminhada)' 
    : categoria === '5km' ? '5 km (corrida)' 
    : categoria === '10km' ? '10 km (corrida)'
    : categoria.toLowerCase()
  
  return `🏃‍♂️ *II Corrida FARMACE - 2025* 🏃‍♀️

Olá, *${primeiroNome}*! 👋

Aqui é a Lis da FARMACE 💙

Sua solicitação foi recebida ✅

*Inscrição:*
• Nº do participante: *#${numeroParticipante}*
• Categoria: *${categoriaFormatada}*
• Status: *em análise*
• Local da Largada: Farmace às 6h30

Assim que confirmarmos, te aviso por aqui com:
• Retirada do kit
• orientações para o dia

Fica de olho neste WhatsApp, vou falar tudo por aqui.

*Lis – FARMACE* 💙`
}

// Dados de teste
const testData = {
  nome: 'João Silva Santos',
  numeroParticipante: '0009',
  categoria: '5km'
}

console.log('🧪 TESTE DE GERAÇÃO DE MENSAGEM WHATSAPP')
console.log('=' .repeat(60))
console.log('')

console.log('📋 Dados de entrada:')
console.log(`   Nome: ${testData.nome}`)
console.log(`   Número: ${testData.numeroParticipante}`)
console.log(`   Categoria: ${testData.categoria}`)
console.log('')

const mensagem = gerarMensagemConfirmacao(
  testData.nome,
  testData.numeroParticipante,
  testData.categoria
)

console.log('📱 Mensagem gerada:')
console.log('─'.repeat(60))
console.log(mensagem)
console.log('─'.repeat(60))
console.log('')

console.log('📊 Informações da mensagem:')
console.log(`   Tamanho: ${mensagem.length} caracteres`)
console.log(`   Linhas: ${mensagem.split('\n').length}`)
console.log('')

// Verifica caracteres especiais
const emojis = mensagem.match(/[\u{1F000}-\u{1F9FF}]/gu) || []
console.log(`   Emojis encontrados: ${emojis.length}`)
console.log(`   Emojis: ${emojis.join(', ')}`)
console.log('')

// Verifica asteriscos (formatação negrito)
const asteriscos = (mensagem.match(/\*/g) || []).length
console.log(`   Asteriscos (*): ${asteriscos} (${asteriscos / 2} pares para negrito)`)
console.log('')

// Verifica bullets
const bullets = (mensagem.match(/•/g) || []).length
console.log(`   Bullets (•): ${bullets}`)
console.log('')

console.log('✅ Teste concluído!')
console.log('')
console.log('💡 Dica: Se a mensagem não está sendo enviada, verifique:')
console.log('   1. Variáveis de ambiente (.env)')
console.log('   2. Console do navegador (F12)')
console.log('   3. Logs da Evolution API')
console.log('   4. Conexão da instância WhatsApp')

