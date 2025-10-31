/**
 * Script para testar o envio real de mensagem via Evolution API
 * Usa as mesmas configurações do .env
 */

// Carrega variáveis de ambiente do .env
import { readFileSync } from 'fs'
import { join } from 'path'

// Lê o arquivo .env
const envPath = join(process.cwd(), '.env')
const envContent = readFileSync(envPath, 'utf-8')

// Parse das variáveis
const config = {}
envContent.split('\n').forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, value] = line.split('=')
    if (key && value) {
      config[key.trim().replace('VITE_', '')] = value.trim()
    }
  }
})

console.log('🔧 Configuração carregada do .env:')
console.log(`   API URL: ${config.EVOLUTION_API_URL}`)
console.log(`   Instance: ${config.EVOLUTION_INSTANCE_NAME}`)
console.log(`   Token: ${config.EVOLUTION_API_TOKEN?.substring(0, 10)}...`)
console.log('')

// Mensagem de teste (versão nova)
const mensagemNova = `🏃‍♂️ *II Corrida FARMACE - 2025* 🏃‍♀️

Olá, *João*! 👋

Aqui é a Lis da FARMACE 💙

Sua solicitação foi recebida ✅

*Inscrição:*
• Nº do participante: *#0009*
• Categoria: *5 km (corrida)*
• Status: *em análise*
• Local da Largada: Farmace às 6h30

Assim que confirmarmos, te aviso por aqui com:
• Retirada do kit
• orientações para o dia

Fica de olho neste WhatsApp, vou falar tudo por aqui.

*Lis – FARMACE* 💙`

// Mensagem de teste (versão antiga que funcionava)
const mensagemAntiga = `🏃‍♂️ *II Corrida FARMACE 2025.2* 🏃‍♀️

Olá, *João*! 👋

✅ *Inscrição Recebida com Sucesso!*

Recebemos seus dados de inscrição para a II Corrida e Caminhada da Qualidade FARMACE.

📋 *Dados da Inscrição:*
• Número do Participante: *#0009*
• Categoria: *5KM (Corrida)*

⏳ *Status:* Aguardando Revisão

Sua inscrição está em análise pela nossa equipe. Em breve você receberá a confirmação final e mais informações sobre:
• Retirada do kit (camiseta + número de peito)
• Detalhes do local e percurso
• Orientações para o dia do evento

📱 *Fique atento ao WhatsApp!*
Todas as comunicações oficiais serão enviadas por este canal.

Qualquer dúvida, estamos à disposição!

---
*FARMACE - Semana da Qualidade 2025*
_Promovendo saúde, bem-estar e qualidade de vida_ 💙`

// Número de teste (do .env)
const testPhone = config.EVOLUTION_SENDER || '5588996420521'

async function testarEnvio(mensagem, titulo) {
  console.log(`\n📤 Testando envio: ${titulo}`)
  console.log('─'.repeat(60))
  
  const endpoint = `${config.EVOLUTION_API_URL}/message/sendText/${config.EVOLUTION_INSTANCE_NAME}`
  
  const requestBody = {
    number: testPhone,
    text: mensagem
  }
  
  console.log(`📡 Endpoint: ${endpoint}`)
  console.log(`📱 Número: ${testPhone}`)
  console.log(`📝 Tamanho da mensagem: ${mensagem.length} caracteres`)
  console.log('')
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.EVOLUTION_API_TOKEN
      },
      body: JSON.stringify(requestBody)
    })
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na resposta:')
      console.error(errorText)
      return false
    }
    
    const data = await response.json()
    console.log('✅ Resposta da API:')
    console.log(JSON.stringify(data, null, 2))
    return true
    
  } catch (error) {
    console.error('❌ Erro ao enviar:', error.message)
    return false
  }
}

// Executa os testes
async function main() {
  console.log('\n🧪 TESTE DE ENVIO DE MENSAGENS WHATSAPP')
  console.log('='.repeat(60))
  
  // Teste 1: Mensagem antiga (que funcionava)
  const teste1 = await testarEnvio(mensagemAntiga, 'Mensagem ANTIGA (funcionava)')
  
  // Aguarda 2 segundos
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Teste 2: Mensagem nova (atual)
  const teste2 = await testarEnvio(mensagemNova, 'Mensagem NOVA (atual)')
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 RESULTADO DOS TESTES:')
  console.log(`   Mensagem antiga: ${teste1 ? '✅ Sucesso' : '❌ Falhou'}`)
  console.log(`   Mensagem nova: ${teste2 ? '✅ Sucesso' : '❌ Falhou'}`)
  console.log('')
  
  if (!teste2 && teste1) {
    console.log('⚠️  A mensagem nova está falhando, mas a antiga funciona!')
    console.log('💡 Possíveis causas:')
    console.log('   - Caracteres especiais incompatíveis')
    console.log('   - Emojis problemáticos (🏃‍♂️ é um emoji composto)')
    console.log('   - Formatação de texto específica')
  }
}

main().catch(console.error)

