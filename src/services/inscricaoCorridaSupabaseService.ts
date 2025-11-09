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

/**
 * Interface: Dados brutos retornados pela query SQL (agrupados por departamento e modalidade)
 */
export interface DadosDepartamentoSQL {
  lotacao: string
  modalidade: string
  quantidade: number
}

/**
 * Interface: Dados transformados para exibição na tabela (uma linha por departamento)
 */
export interface DadosDepartamento {
  departamento: string
  modalidade_10KM: number
  modalidade_5KM: number
  modalidade_3KM: number
  total: number
}

/**
 * Interface: Dados de tipo de participação por departamento
 */
export interface DadosTipoParticipacao {
  lotacao: string
  corrida_natal: number
  apenas_natal: number
  retirar_cesta: number
  total: number
}

// Tipos auxiliares para resultados de queries Supabase
type FuncionarioBasico = { matricula: string | null; lotacao: string | null; ativo?: boolean | null };


type InscricaoComModalidadeRow = { matricula: string | null; modalidade: string | null };

/**
 * Busca dados de tipo de participação por departamento
 * Mostra quantos de cada tipo de participação cada departamento possui
 *
 * @returns Promise com array de dados por departamento e tipo de participação
 */
export async function buscarDadosTipoParticipacao(): Promise<DadosTipoParticipacao[]> {
  try {
    console.log('🔍 [Dashboard Tipo Participação] Buscando dados...')

    // Query: Busca todas as inscrições confirmadas
    const { data: inscricoes, error: errorInscricoes } = await supabase
      .from('tbcorrida')
      .select('matricula, tipo_participacao')
      .is('deleted_at', null)
      .eq('status', 'Confirmada')

    if (errorInscricoes) {
      console.error('❌ [Dashboard Tipo Participação] Erro ao buscar inscrições:', errorInscricoes)
      throw new Error(`Erro ao buscar inscrições: ${errorInscricoes.message}`)
    }

    if (!inscricoes || inscricoes.length === 0) {
      console.log('ℹ️ [Dashboard Tipo Participação] Nenhuma inscrição encontrada')
      return []
    }

    console.log(`✅ [Dashboard Tipo Participação] ${inscricoes.length} inscrições encontradas`)

    // Busca funcionários para fazer o join
    const { data: funcionarios, error: errorFuncionarios } = await supabase
      .from('tbfuncionario')
      .select('matricula, lotacao')
      .not('matricula', 'is', null)
      .limit(10000)

    if (errorFuncionarios) {
      console.error('❌ [Dashboard Tipo Participação] Erro ao buscar funcionários:', errorFuncionarios)
      throw new Error(`Erro ao buscar funcionários: ${errorFuncionarios.message}`)
    }

    console.log(`✅ [Dashboard Tipo Participação] ${funcionarios?.length || 0} funcionários encontrados`)

    // Cria map de matrícula → lotação
    const matriculaParaLotacao = new Map<string, string>()
    funcionarios?.forEach((f: FuncionarioBasico) => {
      if (f.matricula) {
        matriculaParaLotacao.set(f.matricula.trim(), f.lotacao || 'Não informado')
      }
    })

    // Agrupa e conta por departamento e tipo de participação
    const agrupamento: Record<string, Record<string, number>> = {}

    inscricoes.forEach((inscricao) => {
      const matriculaTrim = inscricao.matricula?.trim() || ''
      const lotacao = matriculaParaLotacao.get(matriculaTrim) || 'Não informado'
      const tipoParticipacao = inscricao.tipo_participacao

      if (!agrupamento[lotacao]) {
        agrupamento[lotacao] = {
          'corrida-natal': 0,
          'apenas-natal': 0,
          'retirar-cesta': 0
        }
      }

      if (tipoParticipacao) {
        agrupamento[lotacao][tipoParticipacao] = (agrupamento[lotacao][tipoParticipacao] || 0) + 1
      }
    })

    console.log(`✅ [Dashboard Tipo Participação] ${Object.keys(agrupamento).length} departamentos processados`)

    // Transforma em array de objetos
    const dadosTransformados: DadosTipoParticipacao[] = Object.entries(agrupamento).map(
      ([lotacao, tipos]) => {
        const corrida_natal = tipos['corrida-natal'] || 0
        const apenas_natal = tipos['apenas-natal'] || 0
        const retirar_cesta = tipos['retirar-cesta'] || 0
        const total = corrida_natal + apenas_natal + retirar_cesta

        return {
          lotacao,
          corrida_natal,
          apenas_natal,
          retirar_cesta,
          total
        }
      }
    )

    // Ordena por total decrescente
    dadosTransformados.sort((a, b) => b.total - a.total)

    console.log('📈 [Dashboard Tipo Participação] Top 3 departamentos:',
      dadosTransformados.slice(0, 3).map(d => `${d.lotacao}: ${d.total}`)
    )

    return dadosTransformados

  } catch (error) {
    console.error('❌ [Dashboard Tipo Participação] Erro inesperado:', error)
    throw error
  }
}

/**
 * Interface: Dados de inscritos vs total de funcionários por departamento
 */
export interface DadosInscritosPorDepartamento {
  lotacao: string
  total_funcionarios: number
  total_inscritos: number
  sem_inscricao: number
  percentual_adesao: number
}

/**
 * Busca dados de inscritos vs total de funcionários por departamento
 * Compara quantos funcionários cada departamento tem vs quantos se inscreveram
 *
 * IMPLEMENTAÇÃO: Usa RPC (Remote Procedure Call) para executar função PostgreSQL
 * A função SQL realiza LEFT JOIN nativo e agregação no banco de dados
 *
 * @returns Promise com array de dados comparativos por departamento
 */
export async function buscarDadosInscritosPorDepartamento(): Promise<DadosInscritosPorDepartamento[]> {
  try {
    console.log('🔍 [Dashboard Inscritos/Departamento] Buscando dados via RPC...')

    const { data, error } = await supabase
      .rpc('fn_inscritos_por_departamento')

    if (error) {
      console.error('❌ [Dashboard Inscritos/Departamento] Erro ao buscar dados:', error)
      throw new Error(`Erro ao buscar dados: ${error.message}`)
    }

    console.log(`✅ [Dashboard Inscritos/Departamento] ${data?.length || 0} departamentos retornados`)

    if (data && data.length > 0) {
      console.log('📈 [Dashboard Inscritos/Departamento] Top 3 departamentos:',
        (data as DadosInscritosPorDepartamento[]).slice(0, 3).map((d: DadosInscritosPorDepartamento) => `${d.lotacao}: ${d.total_funcionarios} funcionários, ${d.total_inscritos} inscritos, ${d.percentual_adesao}% adesão`)
      )
    }

    return data || []

  } catch (error) {
    console.error('❌ [Dashboard Inscritos/Departamento] Erro inesperado:', error)
    throw error
  }
}

/**
 * Busca dados de participação por departamento
 * Executa duas queries separadas e faz o JOIN manualmente
 * Retorna dados agrupados e transformados para exibição em tabela
 *
 * @returns Promise com array de dados por departamento, ordenado por total decrescente
 */
export async function buscarDadosDepartamentos(): Promise<DadosDepartamento[]> {
  try {
    console.log('🔍 [Dashboard Departamentos] Buscando dados de participação...')

    // Query 1: Busca inscrições confirmadas da corrida
    const { data: inscricoes, error: errorInscricoes } = await supabase
      .from('tbcorrida')
      .select('matricula, modalidade')
      .is('deleted_at', null)
      .eq('status', 'Confirmada')
      .eq('tipo_participacao', 'corrida-natal')

    if (errorInscricoes) {
      console.error('❌ [Dashboard Departamentos] Erro ao buscar inscrições:', errorInscricoes)
      throw new Error(`Erro ao buscar inscrições: ${errorInscricoes.message}`)
    }

    if (!inscricoes || inscricoes.length === 0) {
      console.log('ℹ️ [Dashboard Departamentos] Nenhuma inscrição encontrada')
      return []
    }

    console.log(`✅ [Dashboard Departamentos] ${inscricoes.length} inscrições encontradas`)
    // Debug: mostra as primeiras 3 inscrições
    console.log(`📝 [Dashboard Departamentos] Primeiras 3 inscrições:`,
      inscricoes.slice(0, 3).map(i => ({ matricula: i.matricula, modalidade: i.modalidade }))
    )

    // Query 2: Busca TODOS os funcionários (ativos e inativos) com matrícula e lotação
    // Importante: Não filtra por ativo porque podem haver inscritos que são ex-funcionários
    const { data: funcionarios, error: errorFuncionarios } = await supabase
      .from('tbfuncionario')
      .select('matricula, lotacao, ativo')
      .not('matricula', 'is', null) // Apenas com matrícula
      .limit(10000) // Aumenta o limite para garantir que pegue todos

    if (errorFuncionarios) {
      console.error('❌ [Dashboard Departamentos] Erro ao buscar funcionários:', errorFuncionarios)
      throw new Error(`Erro ao buscar funcionários: ${errorFuncionarios.message}`)
    }

    const funcionariosAtivos = funcionarios?.filter((f: FuncionarioBasico) => f.ativo === true).length || 0
    const funcionariosInativos = funcionarios?.filter((f: FuncionarioBasico) => f.ativo === false).length || 0

    console.log(`✅ [Dashboard Departamentos] ${funcionarios?.length || 0} funcionários encontrados`)
    console.log(`   └─ Ativos: ${funcionariosAtivos}, Inativos: ${funcionariosInativos}`)

    // Cria map de matrícula → lotação para lookup rápido
    const matriculaParaLotacao = new Map<string, string>()

    funcionarios?.forEach((f: FuncionarioBasico) => {
      if (f.matricula) {
        const lotacao = f.lotacao || 'Não informado'
        matriculaParaLotacao.set(f.matricula.trim(), lotacao)
      }
    })

    console.log(`📋 [Dashboard Departamentos] Map criado com ${matriculaParaLotacao.size} matrículas`)

    // Debug: mostra as primeiras 5 matrículas mapeadas e as primeiras 5 inscrições
    if (funcionarios && funcionarios.length > 0) {
      console.log(`📝 [Dashboard Departamentos] Amostra de funcionários:`)
      funcionarios.slice(0, 5).forEach((f: FuncionarioBasico, i: number) => {
        console.log(`   [${i}] Matrícula: "${f.matricula}" (length: ${f.matricula?.length || 0}), Lotação: "${f.lotacao}"`)
      })
    }

    // Debug: verifica se as matrículas das inscrições batem com as dos funcionários
    const inscricoesComMatch = inscricoes.filter(i =>
      matriculaParaLotacao.has(i.matricula?.trim() || '')
    )
    const inscricoesSemMatch = inscricoes.filter(i =>
      !matriculaParaLotacao.has(i.matricula?.trim() || '')
    )
    console.log(`🔍 [Dashboard Departamentos] Inscrições COM match: ${inscricoesComMatch.length}/${inscricoes.length}`)
    console.log(`⚠️ [Dashboard Departamentos] Inscrições SEM match: ${inscricoesSemMatch.length}/${inscricoes.length}`)

    if (inscricoesSemMatch.length > 0) {
      console.log(`📝 [Dashboard Departamentos] Primeiras 5 inscrições SEM match:`)
      inscricoesSemMatch.slice(0, 5).forEach((i: InscricaoComModalidadeRow, idx: number) => {
        const matriculaTrim = i.matricula?.trim() || ''
        console.log(`   [${idx}] Matrícula: "${i.matricula}" (trimmed: "${matriculaTrim}", length: ${matriculaTrim.length}), Modalidade: "${i.modalidade}"`)

        // Verifica se existe no map
        const temNoMap = matriculaParaLotacao.has(matriculaTrim)
        console.log(`        Existe no Map? ${temNoMap}`)

        // Se não existe, tenta encontrar matrículas similares
        if (!temNoMap) {
          const similares = Array.from(matriculaParaLotacao.keys()).filter(m =>
            m.includes(matriculaTrim) || matriculaTrim.includes(m)
          ).slice(0, 2)
          if (similares.length > 0) {
            console.log(`        Matrículas similares no Map:`, similares)
          }
        }
      })
    }

    // Agrupa e conta por departamento e modalidade
    const agrupamento: Record<string, Record<string, number>> = {}

    console.log('🔄 [Dashboard Departamentos] Iniciando agrupamento...')

    let countAgrupados = 0
    inscricoes.forEach((inscricao, index) => {
      const matriculaTrim = inscricao.matricula?.trim() || ''
      const lotacao = matriculaParaLotacao.get(matriculaTrim) || 'Não informado'
      const modalidadeOriginal = inscricao.modalidade || 'Não informado'

      // Normaliza modalidade para MAIÚSCULO para garantir match
      const modalidade = modalidadeOriginal.toUpperCase()

      // Debug: log das primeiras 3 inscrições durante agrupamento
      if (index < 3) {
        console.log(`   [${index}] Matrícula: "${matriculaTrim}", Lotação: "${lotacao}", Modalidade: "${modalidade}" (original: "${modalidadeOriginal}")`)
      }

      if (!agrupamento[lotacao]) {
        agrupamento[lotacao] = {
          '10KM': 0,
          '5KM': 0,
          '3KM': 0
        }
      }

      if (modalidade === '10KM' || modalidade === '5KM' || modalidade === '3KM') {
        agrupamento[lotacao][modalidade] = (agrupamento[lotacao][modalidade] || 0) + 1
        countAgrupados++
      } else {
        // Log modalidades que não são reconhecidas
        if (index < 10) {
          console.log(`   ⚠️ Modalidade não reconhecida: "${modalidade}" (original: "${modalidadeOriginal}")`)
        }
      }
    })

    console.log(`✅ [Dashboard Departamentos] ${countAgrupados} inscrições agrupadas`)
    console.log(`📊 [Dashboard Departamentos] ${Object.keys(agrupamento).length} departamentos únicos no agrupamento`)

    // Transforma em array de objetos com estrutura da tabela
    const dadosTransformados: DadosDepartamento[] = Object.entries(agrupamento).map(
      ([departamento, modalidades]) => {
        const modalidade_10KM = modalidades['10KM'] || 0
        const modalidade_5KM = modalidades['5KM'] || 0
        const modalidade_3KM = modalidades['3KM'] || 0
        const total = modalidade_10KM + modalidade_5KM + modalidade_3KM

        return {
          departamento,
          modalidade_10KM,
          modalidade_5KM,
          modalidade_3KM,
          total
        }
      }
    )

    // Ordena por total decrescente (departamentos com mais inscritos primeiro)
    dadosTransformados.sort((a, b) => b.total - a.total)

    console.log(`📊 [Dashboard Departamentos] ${dadosTransformados.length} departamentos processados`)
    console.log('📈 [Dashboard Departamentos] Top 3 departamentos:',
      dadosTransformados.slice(0, 3).map(d => `${d.departamento}: ${d.total}`)
    )

    return dadosTransformados

  } catch (error) {
    console.error('❌ [Dashboard Departamentos] Erro inesperado:', error)
    throw error
  }
}

