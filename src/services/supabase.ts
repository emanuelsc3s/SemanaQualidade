/**
 * Cliente Supabase - Configuração
 * 
 * Este arquivo configura e exporta o cliente Supabase para uso em toda a aplicação.
 * Utiliza as variáveis de ambiente definidas no arquivo .env
 */

import { createClient } from '@supabase/supabase-js'

// Obtém as variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validação das variáveis de ambiente
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [Supabase] Variáveis de ambiente não configuradas!')
  console.error('Certifique-se de que VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas no arquivo .env')
  throw new Error('Configuração do Supabase incompleta. Verifique o arquivo .env')
}

console.log('✅ [Supabase] Variáveis de ambiente carregadas com sucesso')
console.log('🔧 [Supabase] URL:', supabaseUrl)

// Cria e exporta o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  }
})

console.log('✅ [Supabase] Cliente inicializado com sucesso')

// Tipos TypeScript para o banco de dados

/**
 * Enum: Tipo de Participação
 */
export type TipoParticipacao = 'corrida-natal' | 'apenas-natal' | 'retirar-cesta'

/**
 * Enum: Status da Inscrição (conforme banco de dados)
 */
export type StatusInscricao = 'Pendente' | 'Confirmada' | 'Cancelada' | 'Retirou Kit'

/**
 * Interface: Tabela tbcorrida
 */
export interface TbCorrida {
  corrida_id: number
  data_inscricao?: string
  matricula?: string | null
  email?: string | null
  whatsapp?: string | null
  tipo_participacao: TipoParticipacao
  modalidade?: string | null
  tamanho_camiseta?: string | null
  aceitou_regulamento: boolean
  data_aceite_regulamento?: string | null
  status?: StatusInscricao | null
  kit_retirado: boolean
  data_retirada_kit?: string | null
  created_at?: string | null
  updated_at?: string | null
  deleted_at?: string | null
  nome?: string | null
  cpf?: string | null
  nascimento?: string | null // DATE (YYYY-MM-DD)
}

/**
 * Interface: Dados para inserção na tabela tbcorrida
 */
export interface TbCorridaInsert {
  matricula?: string | null
  email: string
  whatsapp: string
  tipo_participacao: TipoParticipacao
  modalidade?: string | null
  tamanho_camiseta?: string | null
  aceitou_regulamento: boolean
  status?: StatusInscricao
  nome: string
  cpf: string
  nascimento: string
}

/**
 * Interface: Resposta da API Supabase
 */
export interface SupabaseResponse<T> {
  data: T | null
  error: {
    message: string
    details?: string
    hint?: string
    code?: string
  } | null
}

