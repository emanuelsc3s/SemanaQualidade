/**
 * Tipos TypeScript para a tabela tbwhatsapp_send do Supabase
 * 
 * Estrutura da tabela de fila de mensagens WhatsApp
 */

/**
 * Status possíveis de uma mensagem WhatsApp
 */
export type WhatsAppStatus = 'pendente' | 'enviando' | 'enviado' | 'falhou' | 'cancelado'

/**
 * Interface: Registro da tabela tbwhatsapp_send (banco de dados)
 */
export interface TbWhatsAppSend {
  id: string                              // UUID
  numero: string                          // Número de telefone (formato internacional)
  message: string                         // Texto da mensagem
  status: WhatsAppStatus                  // Status do envio
  priority: number                        // Prioridade (0=normal, 1=alta, 2=urgente)
  agendado: string | null                 // Data/hora agendada (TIMESTAMP WITH TIME ZONE)
  attempts: number                        // Número de tentativas realizadas
  max_attempts: number                    // Máximo de tentativas permitidas
  last_error: string | null               // Última mensagem de erro
  created_at: string                      // Data de criação (TIMESTAMP WITH TIME ZONE)
  processed_at: string | null             // Data de processamento (TIMESTAMP WITH TIME ZONE)
  sent_at: string | null                  // Data de envio bem-sucedido (TIMESTAMP WITH TIME ZONE)
  matricula: string | null                // Matrícula do colaborador (opcional)
}

/**
 * Interface: Dados para inserção na tabela tbwhatsapp_send
 */
export interface TbWhatsAppSendInsert {
  numero: string
  message: string
  status?: WhatsAppStatus
  priority?: number
  agendado?: string | null
  max_attempts?: number
  matricula?: string | null
}

/**
 * Interface: Dados para atualização na tabela tbwhatsapp_send
 */
export interface TbWhatsAppSendUpdate {
  status?: WhatsAppStatus
  attempts?: number
  last_error?: string | null
  processed_at?: string | null
  sent_at?: string | null
}

/**
 * Interface: Resposta da API de envio
 */
export interface WhatsAppSendResponse {
  success: boolean
  messagesSent?: number
  messagesFailed?: number
  errors?: Array<{
    id: string
    numero: string
    error: string
  }>
}

