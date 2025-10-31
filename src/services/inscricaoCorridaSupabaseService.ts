/**
 * Serviço de Inscrição - Supabase
 * 
 * Este serviço gerencia as inscrições na tabela tbcorrida do Supabase.
 * Responsável por salvar, validar e processar inscrições da II Corrida FARMACE.
 */

import { supabase, TbCorridaInsert, TipoParticipacao, StatusInscricao } from './supabase'

/**
 * Interface: Dados do formulário de inscrição
 */
export interface FormularioInscricao {
  // Etapa 1 - Tipo de Participação
  tipoParticipacao: string
  modalidadeCorrida: string
  // Etapa 2 - Dados Pessoais
  nome: string
  email: string
  telefone: string
  cpf: string
  dataNascimento: string
  cep: string
  endereco: string
  cidade: string
  estado: string
  // Etapa 3 - Informações da Corrida
  tamanho: string
  foto: string
  // Dados do colaborador logado
  matricula?: string
  status?: string
}

/**
 * Interface: Resposta do serviço de inscrição
 */
export interface InscricaoResponse {
  success: boolean
  data?: {
    corrida_id: number
    numeroParticipante?: string
  }
  error?: string
  details?: string
}

/**
 * Valida se o tipo de participação é válido
 */
function validarTipoParticipacao(tipo: string): tipo is TipoParticipacao {
  const tiposValidos: TipoParticipacao[] = ['corrida-natal', 'apenas-natal', 'retirar-cesta']
  return tiposValidos.includes(tipo as TipoParticipacao)
}

/**
 * Valida se o status é válido (conforme enum no banco)
 */
function validarStatus(status: string): status is StatusInscricao {
  const statusValidos: StatusInscricao[] = ['Pendente', 'Confirmada', 'Cancelada', 'Retirou Kit']
  return statusValidos.includes(status as StatusInscricao)
}

/**
 * Formata a data de nascimento para o formato aceito pelo PostgreSQL
 * @param dataNascimento - Data no formato YYYY-MM-DD
 * @returns Data formatada para DATE (YYYY-MM-DD)
 */
function formatarDataNascimento(dataNascimento: string): string {
  // O campo nascimento é do tipo DATE no banco
  // Retorna no formato YYYY-MM-DD (já vem neste formato do input type="date")
  return dataNascimento
}

/**
 * Formata a matrícula para sempre ter 6 dígitos com zeros à esquerda
 * @param matricula - Matrícula do colaborador (ex: "1234" ou "001234")
 * @returns Matrícula formatada com 6 dígitos (ex: "001234")
 */
function formatarMatricula(matricula: string | null | undefined): string | null {
  if (!matricula) return null

  // Remove espaços em branco
  const matriculaLimpa = matricula.trim()

  // Se estiver vazia após trim, retorna null
  if (matriculaLimpa === '') return null

  // Preenche com zeros à esquerda até ter 6 dígitos
  const matriculaFormatada = matriculaLimpa.padStart(6, '0')

  console.log(`📋 [Inscrição Supabase] Matrícula formatada: "${matricula}" → "${matriculaFormatada}"`)

  return matriculaFormatada
}

/**
 * Salva uma nova inscrição na tabela tbcorrida do Supabase
 * 
 * @param formData - Dados do formulário de inscrição
 * @returns Promise com resultado da operação
 */
export async function salvarInscricaoSupabase(
  formData: FormularioInscricao
): Promise<InscricaoResponse> {
  try {
    console.log('🚀 [Inscrição Supabase] Iniciando salvamento de inscrição...')
    console.log('📋 [Inscrição Supabase] Dados recebidos:', {
      nome: formData.nome,
      email: formData.email,
      tipoParticipacao: formData.tipoParticipacao,
      modalidade: formData.modalidadeCorrida || 'N/A'
    })

    // Validação: Tipo de participação
    if (!validarTipoParticipacao(formData.tipoParticipacao)) {
      console.error('❌ [Inscrição Supabase] Tipo de participação inválido:', formData.tipoParticipacao)
      return {
        success: false,
        error: 'Tipo de participação inválido',
        details: `Valor recebido: ${formData.tipoParticipacao}. Valores aceitos: corrida-natal, apenas-natal, retirar-cesta`
      }
    }

    // Validação: Modalidade obrigatória se tipo = 'corrida-natal'
    if (formData.tipoParticipacao === 'corrida-natal' && !formData.modalidadeCorrida) {
      console.error('❌ [Inscrição Supabase] Modalidade obrigatória para corrida-natal')
      return {
        success: false,
        error: 'Modalidade é obrigatória para participantes da corrida',
        details: 'Selecione uma modalidade: 3km, 5km ou 10km'
      }
    }

    // Validação: Campos obrigatórios
    const camposObrigatorios = ['nome', 'email', 'telefone', 'cpf', 'dataNascimento']
    for (const campo of camposObrigatorios) {
      if (!formData[campo as keyof FormularioInscricao]) {
        console.error(`❌ [Inscrição Supabase] Campo obrigatório ausente: ${campo}`)
        return {
          success: false,
          error: `Campo obrigatório ausente: ${campo}`,
          details: 'Preencha todos os campos obrigatórios do formulário'
        }
      }
    }

    console.log('✅ [Inscrição Supabase] Validações iniciais concluídas')

    // Monta o objeto para inserção no banco
    const inscricaoData: TbCorridaInsert = {
      // Dados pessoais
      nome: formData.nome.trim(),
      email: formData.email.trim().toLowerCase(),
      whatsapp: formData.telefone.trim(),
      cpf: formData.cpf.trim(),
      nascimento: formatarDataNascimento(formData.dataNascimento),

      // Tipo de participação
      tipo_participacao: formData.tipoParticipacao as TipoParticipacao,

      // Modalidade (apenas se participar da corrida)
      modalidade: formData.tipoParticipacao === 'corrida-natal'
        ? formData.modalidadeCorrida
        : null,

      // Tamanho da camiseta (apenas se participar da corrida ou apenas-natal)
      tamanho_camiseta: formData.tipoParticipacao === 'corrida-natal' || formData.tipoParticipacao === 'apenas-natal'
        ? formData.tamanho
        : null,

      // Regulamento (aceite implícito ao submeter o formulário)
      aceitou_regulamento: true,

      // Status da inscrição (sempre "Confirmada")
      status: (formData.status || 'Confirmada') as StatusInscricao,

      // Matrícula do colaborador logado (formatada com 6 dígitos)
      matricula: formatarMatricula(formData.matricula)
    }

    console.log('📤 [Inscrição Supabase] Dados preparados para inserção:', {
      nome: inscricaoData.nome,
      email: inscricaoData.email,
      matricula: inscricaoData.matricula,
      tipo_participacao: inscricaoData.tipo_participacao,
      modalidade: inscricaoData.modalidade,
      tamanho_camiseta: inscricaoData.tamanho_camiseta,
      status: inscricaoData.status,
      aceitou_regulamento: inscricaoData.aceitou_regulamento
    })

    // Insere no Supabase
    console.log('💾 [Inscrição Supabase] Enviando para o banco de dados...')
    
    const { data, error } = await supabase
      .from('tbcorrida')
      .insert([inscricaoData])
      .select('corrida_id')
      .single()

    // Verifica se houve erro
    if (error) {
      console.error('❌ [Inscrição Supabase] Erro ao inserir no banco:', error)
      console.error('📋 [Inscrição Supabase] Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })

      return {
        success: false,
        error: 'Erro ao salvar inscrição no banco de dados',
        details: error.message || 'Erro desconhecido ao inserir dados'
      }
    }

    // Sucesso!
    console.log('✅ [Inscrição Supabase] Inscrição salva com sucesso!')
    console.log('📊 [Inscrição Supabase] ID gerado:', data.corrida_id)

    // Gera número do participante (formato: 0001, 0002, etc)
    const numeroParticipante = data.corrida_id.toString().padStart(4, '0')
    console.log('🎫 [Inscrição Supabase] Número do participante:', numeroParticipante)

    return {
      success: true,
      data: {
        corrida_id: data.corrida_id,
        numeroParticipante
      }
    }

  } catch (error) {
    console.error('❌ [Inscrição Supabase] Erro inesperado:', error)
    
    return {
      success: false,
      error: 'Erro inesperado ao processar inscrição',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

/**
 * Busca uma inscrição pelo CPF
 * Útil para verificar se o colaborador já está inscrito
 * 
 * @param cpf - CPF do colaborador (formato: XXX.XXX.XXX-XX)
 * @returns Promise com os dados da inscrição ou null
 */
export async function buscarInscricaoPorCPF(cpf: string) {
  try {
    console.log('🔍 [Inscrição Supabase] Buscando inscrição por CPF:', cpf)

    const { data, error } = await supabase
      .from('tbcorrida')
      .select('*')
      .eq('cpf', cpf.trim())
      .is('deleted_at', null) // Apenas inscrições ativas
      .single()

    if (error) {
      // Se não encontrou, retorna null (não é erro)
      if (error.code === 'PGRST116') {
        console.log('ℹ️ [Inscrição Supabase] Nenhuma inscrição encontrada para este CPF')
        return null
      }

      console.error('❌ [Inscrição Supabase] Erro ao buscar inscrição:', error)
      throw error
    }

    console.log('✅ [Inscrição Supabase] Inscrição encontrada:', data.corrida_id)
    return data

  } catch (error) {
    console.error('❌ [Inscrição Supabase] Erro ao buscar inscrição:', error)
    throw error
  }
}

/**
 * Verifica se um email já está cadastrado
 * 
 * @param email - Email a ser verificado
 * @returns Promise<boolean> - true se já existe, false caso contrário
 */
export async function verificarEmailExistente(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('tbcorrida')
      .select('corrida_id')
      .eq('email', email.trim().toLowerCase())
      .is('deleted_at', null)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('❌ [Inscrição Supabase] Erro ao verificar email:', error)
      return false
    }

    return data !== null

  } catch (error) {
    console.error('❌ [Inscrição Supabase] Erro ao verificar email:', error)
    return false
  }
}

