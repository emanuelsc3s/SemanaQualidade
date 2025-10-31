/**
 * Serviço de integração com Evolution API para envio de mensagens WhatsApp
 */

interface SendMessageParams {
  phoneNumber: string
  message: string
}

interface SendMessageResponse {
  success: boolean
  error?: string
  data?: any
}

/**
 * Formata o número de telefone para o padrão internacional
 * Remove caracteres especiais e adiciona código do país se necessário
 * 
 * @param phone - Número de telefone formatado (ex: "(88) 99642-0521")
 * @returns Número no formato internacional (ex: "5588996420521")
 */
function formatPhoneNumber(phone: string): string {
  // Remove todos os caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '')
  
  // Se já tem código do país (55), retorna como está
  if (cleanPhone.startsWith('55')) {
    return cleanPhone
  }
  
  // Adiciona código do país Brasil (55)
  return `55${cleanPhone}`
}

/**
 * Envia mensagem de confirmação de inscrição via WhatsApp
 * 
 * @param params - Parâmetros contendo número de telefone e mensagem
 * @returns Promise com resultado do envio
 */
export async function sendWhatsAppMessage({ 
  phoneNumber, 
  message 
}: SendMessageParams): Promise<SendMessageResponse> {
  try {
    // Obtém configurações do .env
    const apiUrl = import.meta.env.VITE_EVOLUTION_API_URL
    const apiToken = import.meta.env.VITE_EVOLUTION_API_TOKEN
    const instanceName = import.meta.env.VITE_EVOLUTION_INSTANCE_NAME
    
    // Valida se as variáveis de ambiente estão configuradas
    if (!apiUrl || !apiToken || !instanceName) {
      console.error('Variáveis de ambiente da Evolution API não configuradas')
      return {
        success: false,
        error: 'Configuração da API de WhatsApp incompleta'
      }
    }
    
    // Formata o número de telefone
    const formattedPhone = formatPhoneNumber(phoneNumber)
    
    // Monta o endpoint da API
    const endpoint = `${apiUrl}/message/sendText/${instanceName}`
    
    // Corpo da requisição
    const requestBody = {
      number: formattedPhone,
      text: message
    }
    
    console.log('Enviando mensagem WhatsApp:', {
      endpoint,
      phone: formattedPhone,
      messageLength: message.length
    })
    
    // Faz a requisição para a Evolution API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiToken
      },
      body: JSON.stringify(requestBody)
    })
    
    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro ao enviar mensagem WhatsApp:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      
      return {
        success: false,
        error: `Erro ao enviar mensagem: ${response.statusText}`
      }
    }
    
    // Processa a resposta
    const data = await response.json()
    
    console.log('Mensagem WhatsApp enviada com sucesso:', data)
    
    return {
      success: true,
      data
    }
    
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao enviar mensagem'
    }
  }
}

/**
 * Gera a mensagem de confirmação de inscrição personalizada
 *
 * @param nome - Nome do participante
 * @param numeroParticipante - Número de inscrição do participante
 * @param categoria - Categoria escolhida (3km, 5km, 10km)
 * @returns Mensagem formatada para envio
 */
export function gerarMensagemConfirmacao(
  nome: string,
  numeroParticipante: string,
  categoria: string
): string {
  const primeiroNome = nome.split(' ')[0]

  // Formata a categoria para exibição
  const categoriaFormatada = categoria === '3km' ? '3 km (caminhada)'
    : categoria === '5km' ? '5 km (corrida)'
    : categoria === '10km' ? '10 km (corrida)'
    : categoria.toLowerCase()

  return `🏃‍♂️ II Corrida FARMACE - 2025 🏃‍♀️

Olá, ${primeiroNome}! 👋

Aqui é a Lis da FARMACE 💙

Sua solicitação foi recebida ✅

Inscrição:
• Nº do participante: #${numeroParticipante}
• Categoria: ${categoriaFormatada}
• Status: em análise
• Local da Largada: Farmace às 6h30

Assim que confirmarmos, te aviso por aqui com:
• Retirada do kit
• orientações para o dia

Fica de olho neste WhatsApp, vou falar tudo por aqui.

Lis – FARMACE 💙`
}

