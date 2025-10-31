/**
 * Script de teste para validar a integração com Evolution API
 * 
 * Uso:
 * node scripts/test-whatsapp.js
 */

// Configurações (mesmas do .env)
const config = {
  apiUrl: 'https://evolution-evolution-api.r9ho4z.easypanel.host',
  apiToken: '1E3A692AF33D-4E43-95C6-289E9B48FBD6',
  instanceName: 'Emanuel',
  sender: '5588996420521'
}

// Número de teste (substitua pelo seu número)
const testPhone = '5588996420521'

// Mensagem de teste
const testMessage = `🧪 *TESTE - Evolution API*

Esta é uma mensagem de teste da integração WhatsApp.

Se você recebeu esta mensagem, a integração está funcionando corretamente! ✅

---
_Enviado via Evolution API_
_${new Date().toLocaleString('pt-BR')}_`

async function testWhatsAppIntegration() {
  console.log('🚀 Iniciando teste de integração WhatsApp...\n')
  
  console.log('📋 Configurações:')
  console.log(`   API URL: ${config.apiUrl}`)
  console.log(`   Instância: ${config.instanceName}`)
  console.log(`   Número de teste: ${testPhone}`)
  console.log('')
  
  try {
    const endpoint = `${config.apiUrl}/message/sendText/${config.instanceName}`
    
    console.log(`📡 Enviando requisição para: ${endpoint}`)
    console.log('')
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.apiToken
      },
      body: JSON.stringify({
        number: testPhone,
        text: testMessage
      })
    })
    
    console.log(`📊 Status da resposta: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na requisição:')
      console.error(errorText)
      process.exit(1)
    }
    
    const data = await response.json()
    
    console.log('\n✅ Mensagem enviada com sucesso!')
    console.log('\n📦 Resposta da API:')
    console.log(JSON.stringify(data, null, 2))
    
    console.log('\n✨ Teste concluído com sucesso!')
    console.log('📱 Verifique seu WhatsApp para confirmar o recebimento.')
    
  } catch (error) {
    console.error('\n❌ Erro ao executar teste:')
    console.error(error.message)
    process.exit(1)
  }
}

// Executar teste
testWhatsAppIntegration()

