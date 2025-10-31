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
    console.log('🚀 [WhatsApp Service] Iniciando envio de mensagem...')

    // Obtém configurações do .env
    const apiUrl = import.meta.env.VITE_EVOLUTION_API_URL
    const apiToken = import.meta.env.VITE_EVOLUTION_API_TOKEN
    const instanceName = import.meta.env.VITE_EVOLUTION_INSTANCE_NAME

    console.log('🔧 [WhatsApp Service] Variáveis de ambiente:', {
      apiUrl: apiUrl ? '✅ Configurada' : '❌ Não configurada',
      apiToken: apiToken ? '✅ Configurada' : '❌ Não configurada',
      instanceName: instanceName ? '✅ Configurada' : '❌ Não configurada'
    })

    // Valida se as variáveis de ambiente estão configuradas
    if (!apiUrl || !apiToken || !instanceName) {
      console.error('❌ [WhatsApp Service] Variáveis de ambiente da Evolution API não configuradas')
      return {
        success: false,
        error: 'Configuração da API de WhatsApp incompleta'
      }
    }

    // Formata o número de telefone
    const formattedPhone = formatPhoneNumber(phoneNumber)
    console.log('📱 [WhatsApp Service] Número formatado:', {
      original: phoneNumber,
      formatado: formattedPhone
    })

    // Monta o endpoint da API
    const endpoint = `${apiUrl}/message/sendText/${instanceName}`

    // Corpo da requisição
    const requestBody = {
      number: formattedPhone,
      text: message
    }

    console.log('📤 [WhatsApp Service] Enviando requisição:', {
      endpoint,
      phone: formattedPhone,
      messageLength: message.length,
      messagePreview: message.substring(0, 100) + '...'
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

    console.log('📊 [WhatsApp Service] Resposta recebida:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })

    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [WhatsApp Service] Erro ao enviar mensagem:', {
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

    console.log('✅ [WhatsApp Service] Mensagem enviada com sucesso!')
    console.log('📋 [WhatsApp Service] Dados da resposta:', data)

    return {
      success: true,
      data
    }

  } catch (error) {
    console.error('❌ [WhatsApp Service] Erro ao enviar mensagem:', error)

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
  console.log('📝 [WhatsApp Service] Gerando mensagem de confirmação:', {
    nome,
    numeroParticipante,
    categoria
  })

  const primeiroNome = nome.split(' ')[0]

  // Formata a categoria para exibição
  const categoriaFormatada = categoria === '3km' ? '3 km (caminhada)'
    : categoria === '5km' ? '5 km (corrida)'
    : categoria === '10km' ? '10 km (corrida)'
    : categoria.toLowerCase()

  const mensagem = `🏃‍♂️ *II Corrida FARMACE - 2025* 🏃‍♀️

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

  console.log('✅ [WhatsApp Service] Mensagem gerada com sucesso!')
  console.log('📏 [WhatsApp Service] Tamanho:', mensagem.length, 'caracteres')

  return mensagem
}

/**
 * Gera a mensagem de confirmação para quem optou por NÃO participar dos eventos
 * e apenas retirar a cesta natalina presencialmente na Farmace
 *
 * @param nome - Nome do colaborador
 * @param numeroParticipante - Número de registro do colaborador
 * @returns Mensagem formatada para envio
 */
export function gerarMensagemRetirarCesta(
  nome: string,
  numeroParticipante: string
): string {
  console.log('📝 [WhatsApp Service] Gerando mensagem de retirada de cesta:', {
    nome,
    numeroParticipante
  })

  const primeiroNome = nome.split(' ')[0]

  const mensagem = `🎄 *Cesta Natalina FARMACE - 2025* 🎁

Olá, *${primeiroNome}*! 👋

Aqui é a Lis da FARMACE 💙

Sua solicitação foi recebida ✅

*Registro:*
• Nº de registro: *#${numeroParticipante}*
• Opção escolhida: *Retirar cesta natalina presencialmente*
• Status: *confirmado*

📍 *Informações importantes:*

Você optou por NÃO participar:
• ❌ Da II Corrida FARMACE
• ❌ Do evento de comemoração de Natal

✅ Sua cesta natalina estará disponível para retirada presencialmente na FARMACE nos dias:
• *22 de dezembro de 2025*
• *23 de dezembro de 2025*

🕐 *Horário de retirada:*
Das 8h às 17h

📱 Fique de olho neste WhatsApp! Vou te avisar quando sua cesta estiver pronta para retirada e enviar mais detalhes sobre o local exato.

Qualquer dúvida, é só chamar por aqui! 😊

*Lis – FARMACE* 💙`

  console.log('✅ [WhatsApp Service] Mensagem de retirada de cesta gerada com sucesso!')
  console.log('📏 [WhatsApp Service] Tamanho:', mensagem.length, 'caracteres')

  return mensagem
}

