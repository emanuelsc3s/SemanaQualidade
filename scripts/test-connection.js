/**
 * Script para testar a conexão com a Evolution API
 * Verifica o status da instância e tenta enviar uma mensagem de teste
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Lê o arquivo .env
const envPath = join(__dirname, '..', '.env')
const envContent = readFileSync(envPath, 'utf-8')

// Parse do .env
const env = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/)
  if (match) {
    const key = match[1].trim()
    const value = match[2].trim()
    env[key] = value
  }
})

const config = {
  apiUrl: env.VITE_EVOLUTION_API_URL,
  apiToken: env.VITE_EVOLUTION_API_TOKEN,
  instanceName: env.VITE_EVOLUTION_INSTANCE_NAME,
  sender: env.VITE_EVOLUTION_SENDER
}

console.log('🔍 Testando conexão com Evolution API...\n')
console.log('📋 Configuração:')
console.log(`   API URL: ${config.apiUrl}`)
console.log(`   Instance: ${config.instanceName}`)
console.log(`   Token: ${config.apiToken?.substring(0, 15)}...`)
console.log(`   Sender: ${config.sender}\n`)

/**
 * Verifica o status da instância
 */
async function checkInstanceStatus() {
  console.log('1️⃣ Verificando status da instância...')
  console.log('─'.repeat(60))
  
  try {
    const endpoint = `${config.apiUrl}/instance/connectionState/${config.instanceName}`
    
    console.log(`📡 GET ${endpoint}`)
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': config.apiToken
      }
    })
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro ao verificar status:')
      console.error(errorText)
      return false
    }
    
    const data = await response.json()
    console.log('✅ Status da instância:')
    console.log(JSON.stringify(data, null, 2))
    
    return data.instance?.state === 'open'
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
    return false
  }
}

/**
 * Testa envio de mensagem simples
 */
async function testSendMessage() {
  console.log('\n2️⃣ Testando envio de mensagem...')
  console.log('─'.repeat(60))
  
  const endpoint = `${config.apiUrl}/message/sendText/${config.instanceName}`
  
  const requestBody = {
    number: config.sender,
    text: `🧪 Teste de conexão\n\n${new Date().toLocaleString('pt-BR')}\n\nSe você recebeu esta mensagem, a API está funcionando! ✅`
  }
  
  console.log(`📡 POST ${endpoint}`)
  console.log(`📱 Número: ${config.sender}`)
  console.log(`📝 Mensagem: ${requestBody.text.substring(0, 50)}...`)
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.apiToken
      },
      body: JSON.stringify(requestBody)
    })
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro ao enviar mensagem:')
      console.error(errorText)
      return false
    }
    
    const data = await response.json()
    console.log('✅ Mensagem enviada com sucesso!')
    console.log(JSON.stringify(data, null, 2))
    
    return true
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
    return false
  }
}

/**
 * Executa todos os testes
 */
async function main() {
  console.log('🧪 TESTE DE CONEXÃO EVOLUTION API')
  console.log('='.repeat(60))
  console.log('')
  
  // Teste 1: Verificar status da instância
  const statusOk = await checkInstanceStatus()
  
  if (!statusOk) {
    console.log('\n⚠️  A instância não está conectada!')
    console.log('   Verifique se o QR Code foi escaneado e o WhatsApp está ativo.')
    console.log('   Acesse o painel da Evolution API para reconectar.')
    return
  }
  
  // Aguarda 2 segundos
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Teste 2: Enviar mensagem
  const messageOk = await testSendMessage()
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 RESULTADO:')
  console.log(`   Status da instância: ${statusOk ? '✅ Conectada' : '❌ Desconectada'}`)
  console.log(`   Envio de mensagem: ${messageOk ? '✅ Sucesso' : '❌ Falhou'}`)
  console.log('')
  
  if (statusOk && messageOk) {
    console.log('🎉 Tudo funcionando corretamente!')
  } else {
    console.log('⚠️  Há problemas na conexão. Verifique os logs acima.')
  }
}

// Executar
main().catch(console.error)

