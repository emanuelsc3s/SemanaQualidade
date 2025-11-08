import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  buscarDadosDepartamentos,
  buscarDadosTipoParticipacao,
  buscarDadosInscritosPorDepartamento,
  type DadosDepartamento,
  type DadosTipoParticipacao,
  type DadosInscritosPorDepartamento
} from '@/services/inscricaoCorridaSupabaseService'
import {
  gerarRelatorioDepartamentosPDFBase64,
  gerarRelatorioInscritosPDFBase64
} from '@/utils/pdfGenerator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Download,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  Loader2,
  AlertCircle,
  Users,
  TrendingUp,
  ClipboardList,
  BarChart3
} from 'lucide-react'

/**
 * Tipo para controlar ordenação - Tab 1 (Modalidade por Corrida)
 */
type OrdenacaoColunaModalidade = 'departamento' | 'modalidade_10KM' | 'modalidade_5KM' | 'modalidade_3KM' | 'total'

/**
 * Tipo para controlar ordenação - Tab 2 (Tipo de Participação)
 */
type OrdenacaoColunaTipo = 'lotacao' | 'corrida_natal' | 'apenas_natal' | 'retirar_cesta' | 'total'

/**
 * Tipo para controlar ordenação - Tab 3 (Inscritos por Departamento)
 */
type OrdenacaoColunaInscritos = 'lotacao' | 'total_funcionarios' | 'total_inscritos' | 'sem_inscricao' | 'percentual_adesao'

type DirecaoOrdenacao = 'asc' | 'desc'

/**
 * Página: Dashboard de Participação por Departamento
 *
 * Features:
 * - Tabela interativa com dados de departamentos
 * - Ordenação por colunas (clicável)
 * - Filtro de busca por departamento
 * - Filtro por modalidade
 * - Paginação com seletor de itens por página
 * - Exportação para PDF com preview
 */
const DepartamentoDashboardCorrida: React.FC = () => {
  // Estado da tab ativa
  const [abaAtiva, setAbaAtiva] = useState<string>('modalidade')

  // Estados de dados - Tab 1: Modalidade por Corrida
  const [departamentos, setDepartamentos] = useState<DadosDepartamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estados de dados - Tab 2: Tipo de Participação
  const [dadosTipoParticipacao, setDadosTipoParticipacao] = useState<DadosTipoParticipacao[]>([])
  const [loadingTipo, setLoadingTipo] = useState(false)
  const [errorTipo, setErrorTipo] = useState<string | null>(null)

  // Estados de dados - Tab 3: Inscritos por Departamento
  const [dadosInscritos, setDadosInscritos] = useState<DadosInscritosPorDepartamento[]>([])
  const [loadingInscritos, setLoadingInscritos] = useState(false)
  const [errorInscritos, setErrorInscritos] = useState<string | null>(null)

  // Estados de filtros - Tab 1
  const [busca, setBusca] = useState('')
  const [filtroModalidade, setFiltroModalidade] = useState<'Todas' | '10KM' | '5KM' | '3KM'>('Todas')

  // Estados de filtros - Tab 2
  const [buscaTipo, setBuscaTipo] = useState('')

  // Estados de filtros - Tab 3
  const [buscaInscritos, setBuscaInscritos] = useState('')

  // Estados de ordenação - Tab 1: Modalidade
  const [colunaOrdenacao, setColunaOrdenacao] = useState<OrdenacaoColunaModalidade>('total')
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState<DirecaoOrdenacao>('desc')

  // Estados de ordenação - Tab 2: Tipo de Participação
  const [colunaOrdenacaoTipo, setColunaOrdenacaoTipo] = useState<OrdenacaoColunaTipo>('total')
  const [direcaoOrdenacaoTipo, setDirecaoOrdenacaoTipo] = useState<DirecaoOrdenacao>('desc')

  // Estados de ordenação - Tab 3: Inscritos
  const [colunaOrdenacaoInscritos, setColunaOrdenacaoInscritos] = useState<OrdenacaoColunaInscritos>('total_funcionarios')
  const [direcaoOrdenacaoInscritos, setDirecaoOrdenacaoInscritos] = useState<DirecaoOrdenacao>('desc')

  // Estados de paginação
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [itensPorPagina, setItensPorPagina] = useState(10)

  // Estados do modal PDF
  const [modalPDFAberto, setModalPDFAberto] = useState(false)
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null)
  const [gerandoPDF, setGerandoPDF] = useState(false)

  /**
   * Busca dados de Modalidade por Corrida (Tab 1)
   */
  const carregarDadosModalidade = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const dados = await buscarDadosDepartamentos()
      setDepartamentos(dados)
    } catch (err) {
      console.error('Erro ao carregar dados de modalidade:', err)
      setError('Erro ao carregar dados. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Busca dados de Tipo de Participação (Tab 2)
   */
  const carregarDadosTipoParticipacao = useCallback(async () => {
    try {
      setLoadingTipo(true)
      setErrorTipo(null)
      const dados = await buscarDadosTipoParticipacao()
      setDadosTipoParticipacao(dados)
    } catch (err) {
      console.error('Erro ao carregar dados de tipo de participação:', err)
      setErrorTipo('Erro ao carregar dados. Tente novamente.')
    } finally {
      setLoadingTipo(false)
    }
  }, [])

  /**
   * Busca dados de Inscritos por Departamento (Tab 3)
   */
  const carregarDadosInscritos = useCallback(async () => {
    try {
      setLoadingInscritos(true)
      setErrorInscritos(null)
      const dados = await buscarDadosInscritosPorDepartamento()
      setDadosInscritos(dados)
    } catch (err) {
      console.error('Erro ao carregar dados de inscritos:', err)
      setErrorInscritos('Erro ao carregar dados. Tente novamente.')
    } finally {
      setLoadingInscritos(false)
    }
  }, [])

  /**
   * Carrega dados ao montar componente (Tab 1)
   */
  useEffect(() => {
    carregarDadosModalidade()
  }, [carregarDadosModalidade])

  /**
   * Carrega dados quando troca de aba
   */
  useEffect(() => {
    if (abaAtiva === 'tipo' && dadosTipoParticipacao.length === 0) {
      carregarDadosTipoParticipacao()
    } else if (abaAtiva === 'inscritos' && dadosInscritos.length === 0) {
      carregarDadosInscritos()
    }
  }, [abaAtiva, dadosTipoParticipacao.length, dadosInscritos.length, carregarDadosTipoParticipacao, carregarDadosInscritos])







  /**
   * Função legacy - mantida para compatibilidade
   */
  const carregarDados = carregarDadosModalidade

  /**
   * Dados filtrados por busca e modalidade
   */
  const dadosFiltrados = useMemo(() => {
    let resultado = [...departamentos]

    // Filtro de busca por departamento
    if (busca.trim()) {
      const buscaLower = busca.toLowerCase()
      resultado = resultado.filter(d =>
        d.departamento.toLowerCase().includes(buscaLower)
      )
    }

    // Filtro por modalidade
    if (filtroModalidade !== 'Todas') {
      resultado = resultado.filter(d => {
        if (filtroModalidade === '10KM') return d.modalidade_10KM > 0
        if (filtroModalidade === '5KM') return d.modalidade_5KM > 0
        if (filtroModalidade === '3KM') return d.modalidade_3KM > 0
        return true
      })
    }

    return resultado
  }, [departamentos, busca, filtroModalidade])

  /**
   * Dados ordenados
   */
  const dadosOrdenados = useMemo(() => {
    const resultado = [...dadosFiltrados]

    resultado.sort((a, b) => {
      const valorA = a[colunaOrdenacao]
      const valorB = b[colunaOrdenacao]

      // Ordenação de strings (departamento)
      if (typeof valorA === 'string' && typeof valorB === 'string') {
        return direcaoOrdenacao === 'asc'
          ? valorA.localeCompare(valorB)
          : valorB.localeCompare(valorA)
      }

      // Ordenação de números
      if (typeof valorA === 'number' && typeof valorB === 'number') {
        return direcaoOrdenacao === 'asc'
          ? valorA - valorB
          : valorB - valorA
      }

      return 0
    })

    return resultado
  }, [dadosFiltrados, colunaOrdenacao, direcaoOrdenacao])

  /**
   * Dados paginados
   */
  const dadosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina
    const fim = inicio + itensPorPagina
    return dadosOrdenados.slice(inicio, fim)
  }, [dadosOrdenados, paginaAtual, itensPorPagina])

  /**
   * Total de páginas - Tab 1
   */
  const totalPaginas = Math.ceil(dadosOrdenados.length / itensPorPagina)

  // ============================================================================
  // TAB 2: TIPO DE PARTICIPAÇÃO - FILTROS E ORDENAÇÃO
  // ============================================================================

  /**
   * Dados filtrados - Tab 2
   */
  const dadosFiltradosTipo = useMemo(() => {
    let resultado = [...dadosTipoParticipacao]

    if (buscaTipo.trim()) {
      const buscaLower = buscaTipo.toLowerCase()
      resultado = resultado.filter(d =>
        d.lotacao.toLowerCase().includes(buscaLower)
      )
    }

    return resultado
  }, [dadosTipoParticipacao, buscaTipo])

  /**
   * Dados ordenados - Tab 2
   */
  const dadosOrdenadosTipo = useMemo(() => {
    const resultado = [...dadosFiltradosTipo]

    resultado.sort((a, b) => {
      const valorA = a[colunaOrdenacaoTipo]
      const valorB = b[colunaOrdenacaoTipo]

      if (typeof valorA === 'string' && typeof valorB === 'string') {
        return direcaoOrdenacaoTipo === 'asc'
          ? valorA.localeCompare(valorB)
          : valorB.localeCompare(valorA)
      }

      if (typeof valorA === 'number' && typeof valorB === 'number') {
        return direcaoOrdenacaoTipo === 'asc'
          ? valorA - valorB
          : valorB - valorA
      }

      return 0
    })

    return resultado
  }, [dadosFiltradosTipo, colunaOrdenacaoTipo, direcaoOrdenacaoTipo])

  /**
   * Dados paginados - Tab 2
   */
  const dadosPaginadosTipo = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina
    const fim = inicio + itensPorPagina
    return dadosOrdenadosTipo.slice(inicio, fim)
  }, [dadosOrdenadosTipo, paginaAtual, itensPorPagina])

  /**
   * Total de páginas - Tab 2
   */
  const totalPaginasTipo = Math.ceil(dadosOrdenadosTipo.length / itensPorPagina)

  // ============================================================================
  // TAB 3: INSCRITOS POR DEPARTAMENTO - FILTROS E ORDENAÇÃO
  // ============================================================================

  /**
   * Dados filtrados - Tab 3
   */
  const dadosFiltradosInscritos = useMemo(() => {
    let resultado = [...dadosInscritos]

    if (buscaInscritos.trim()) {
      const buscaLower = buscaInscritos.toLowerCase()
      resultado = resultado.filter(d =>
        d.lotacao.toLowerCase().includes(buscaLower)
      )
    }

    return resultado
  }, [dadosInscritos, buscaInscritos])

  /**
   * Dados ordenados - Tab 3
   */
  const dadosOrdenadosInscritos = useMemo(() => {
    const resultado = [...dadosFiltradosInscritos]

    resultado.sort((a, b) => {
      const valorA = a[colunaOrdenacaoInscritos]
      const valorB = b[colunaOrdenacaoInscritos]

      if (typeof valorA === 'string' && typeof valorB === 'string') {
        return direcaoOrdenacaoInscritos === 'asc'
          ? valorA.localeCompare(valorB)
          : valorB.localeCompare(valorA)
      }

      if (typeof valorA === 'number' && typeof valorB === 'number') {
        return direcaoOrdenacaoInscritos === 'asc'
          ? valorA - valorB
          : valorB - valorA
      }

      return 0
    })

    return resultado
  }, [dadosFiltradosInscritos, colunaOrdenacaoInscritos, direcaoOrdenacaoInscritos])

  /**
   * Dados paginados - Tab 3
   */
  const dadosPaginadosInscritos = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina
    const fim = inicio + itensPorPagina
    return dadosOrdenadosInscritos.slice(inicio, fim)
  }, [dadosOrdenadosInscritos, paginaAtual, itensPorPagina])

  /**
   * Total de páginas - Tab 3
   */
  const totalPaginasInscritos = Math.ceil(dadosOrdenadosInscritos.length / itensPorPagina)

  // ============================================================================
  // FUNÇÕES DE ORDENAÇÃO
  // ============================================================================

  /**
   * Alterna ordenação de coluna - Tab 1
   */
  const alternarOrdenacao = (coluna: OrdenacaoColunaModalidade) => {
    if (colunaOrdenacao === coluna) {
      // Se já está ordenando por essa coluna, inverte a direção
      setDirecaoOrdenacao(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      // Se é uma nova coluna, define como decrescente por padrão (exceto para departamento)
      setColunaOrdenacao(coluna)
      setDirecaoOrdenacao(coluna === 'departamento' ? 'asc' : 'desc')
    }
  }

  /**
   * Alterna ordenação de coluna - Tab 2
   */
  const alternarOrdenacaoTipo = (coluna: OrdenacaoColunaTipo) => {
    if (colunaOrdenacaoTipo === coluna) {
      setDirecaoOrdenacaoTipo(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setColunaOrdenacaoTipo(coluna)
      setDirecaoOrdenacaoTipo(coluna === 'lotacao' ? 'asc' : 'desc')
    }
  }

  /**
   * Alterna ordenação de coluna - Tab 3
   */
  const alternarOrdenacaoInscritos = (coluna: OrdenacaoColunaInscritos) => {
    if (colunaOrdenacaoInscritos === coluna) {
      setDirecaoOrdenacaoInscritos(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setColunaOrdenacaoInscritos(coluna)
      setDirecaoOrdenacaoInscritos(coluna === 'lotacao' ? 'asc' : 'desc')
    }
  }

  /**
   * Ícone de ordenação - Tab 1
   */
  const IconeOrdenacao: React.FC<{ coluna: OrdenacaoColunaModalidade }> = ({ coluna }) => {
    if (colunaOrdenacao !== coluna) {
      return <ArrowUpDown className="w-3 h-3 opacity-30" />
    }
    return direcaoOrdenacao === 'asc'
      ? <ArrowUp className="w-3 h-3" />
      : <ArrowDown className="w-3 h-3" />
  }

  /**
   * Ícone de ordenação - Tab 2
   */
  const IconeOrdenacaoTipo: React.FC<{ coluna: OrdenacaoColunaTipo }> = ({ coluna }) => {
    if (colunaOrdenacaoTipo !== coluna) {
      return <ArrowUpDown className="w-3 h-3 opacity-30" />
    }
    return direcaoOrdenacaoTipo === 'asc'
      ? <ArrowUp className="w-3 h-3" />
      : <ArrowDown className="w-3 h-3" />
  }

  /**
   * Ícone de ordenação - Tab 3
   */
  const IconeOrdenacaoInscritos: React.FC<{ coluna: OrdenacaoColunaInscritos }> = ({ coluna }) => {
    if (colunaOrdenacaoInscritos !== coluna) {
      return <ArrowUpDown className="w-3 h-3 opacity-30" />
    }
    return direcaoOrdenacaoInscritos === 'asc'
      ? <ArrowUp className="w-3 h-3" />
      : <ArrowDown className="w-3 h-3" />
  }

  /**
   * Gera PDF e abre modal de preview
   * Gera o PDF de acordo com a aba atualmente selecionada
   */
  const handleExportarPDF = async () => {
    try {
      setGerandoPDF(true)

      let pdfBase64: string

      // Verifica qual aba está ativa e gera o PDF apropriado
      switch (abaAtiva) {
        case 'modalidade':
          // Tab 1: Modalidade por Corrida
          pdfBase64 = await gerarRelatorioDepartamentosPDFBase64(dadosOrdenados)
          break

        case 'tipo':
          // Tab 2: Tipo de Participação
          // TODO: Implementar geração de PDF para Tipo de Participação
          console.warn('PDF de Tipo de Participação ainda não implementado')
          alert('Relatório PDF para "Tipo de Participação" ainda não está disponível.')
          return

        case 'inscritos':
          // Tab 3: Inscritos por Departamento
          pdfBase64 = await gerarRelatorioInscritosPDFBase64(dadosOrdenadosInscritos)
          break

        default:
          console.error('Aba desconhecida:', abaAtiva)
          alert('Erro: aba desconhecida.')
          return
      }

      setPdfDataUrl(pdfBase64)
      setModalPDFAberto(true)
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
      alert('Erro ao gerar PDF. Tente novamente.')
    } finally {
      setGerandoPDF(false)
    }
  }

  /**
   * Faz download do PDF
   * Nome do arquivo varia de acordo com a aba ativa
   */
  const handleDownloadPDF = () => {
    if (!pdfDataUrl) return

    // Converte Base64 para Blob
    const byteCharacters = atob(pdfDataUrl.split(',')[1] || pdfDataUrl)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'application/pdf' })

    // Define nome do arquivo baseado na aba ativa
    const dataAtual = new Date().toISOString().split('T')[0]
    let nomeArquivo: string

    switch (abaAtiva) {
      case 'modalidade':
        nomeArquivo = `Relatorio_Modalidades_${dataAtual}.pdf`
        break
      case 'tipo':
        nomeArquivo = `Relatorio_Tipo_Participacao_${dataAtual}.pdf`
        break
      case 'inscritos':
        nomeArquivo = `Relatorio_Inscritos_Departamento_${dataAtual}.pdf`
        break
      default:
        nomeArquivo = `Relatorio_Departamentos_${dataAtual}.pdf`
    }

    // Cria URL e faz download
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = nomeArquivo
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Calcula totais gerais
   */
  const totaisGerais = useMemo(() => {
    return dadosOrdenados.reduce(
      (acc, d) => ({
        modalidade_10KM: acc.modalidade_10KM + d.modalidade_10KM,
        modalidade_5KM: acc.modalidade_5KM + d.modalidade_5KM,
        modalidade_3KM: acc.modalidade_3KM + d.modalidade_3KM,
        total: acc.total + d.total
      }),
      { modalidade_10KM: 0, modalidade_5KM: 0, modalidade_3KM: 0, total: 0 }
    )
  }, [dadosOrdenados])

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-sky-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-['Montserrat'] flex items-center gap-2">
                <Users className="w-6 h-6 md:w-8 md:h-8" />
                Dashboard de Departamentos
              </h1>
              <p className="text-sky-100 text-sm md:text-base mt-1">
                II Corrida da Qualidade FARMACE - 2025
              </p>
            </div>
            <Button
              onClick={handleExportarPDF}
              disabled={gerandoPDF || departamentos.length === 0}
              className="bg-white text-sky-600 hover:bg-sky-50 font-semibold shadow-md"
              size="lg"
            >
              {gerandoPDF ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Exportar PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Tabs de Navegação */}
        <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 h-auto">
            <TabsTrigger
              value="modalidade"
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-3 text-xs sm:text-sm data-[state=active]:bg-sky-500 data-[state=active]:text-white"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-center">Modalidade por Corrida</span>
            </TabsTrigger>
            <TabsTrigger
              value="tipo"
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-3 text-xs sm:text-sm data-[state=active]:bg-sky-500 data-[state=active]:text-white"
            >
              <ClipboardList className="w-4 h-4" />
              <span className="text-center">Tipo de Participação</span>
            </TabsTrigger>
            <TabsTrigger
              value="inscritos"
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-3 text-xs sm:text-sm data-[state=active]:bg-sky-500 data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-center">Inscritos por Depto</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: MODALIDADE POR CORRIDA */}
          <TabsContent value="modalidade" className="mt-0">
            {/* Cards de Resumo */}
            {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-sky-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Departamentos</p>
                  <p className="text-2xl font-bold text-slate-900">{departamentos.length}</p>
                </div>
                <Users className="w-8 h-8 text-sky-500 opacity-70" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">10 KM</p>
                  <p className="text-2xl font-bold text-slate-900">{totaisGerais.modalidade_10KM}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500 opacity-70" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-cyan-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">5 KM</p>
                  <p className="text-2xl font-bold text-slate-900">{totaisGerais.modalidade_5KM}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-cyan-500 opacity-70" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-teal-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">3 KM</p>
                  <p className="text-2xl font-bold text-slate-900">{totaisGerais.modalidade_3KM}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-teal-500 opacity-70" />
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Busca */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Buscar Departamento
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Digite o nome do departamento..."
                    value={busca}
                    onChange={(e) => {
                      setBusca(e.target.value)
                      setPaginaAtual(1) // Volta para primeira página ao filtrar
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filtro Modalidade */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Filtrar por Modalidade
                </label>
                <select
                  value={filtroModalidade}
                  onChange={(e) => {
                    setFiltroModalidade(e.target.value as typeof filtroModalidade)
                    setPaginaAtual(1)
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Todas">Todas as Modalidades</option>
                  <option value="10KM">10 KM</option>
                  <option value="5KM">5 KM</option>
                  <option value="3KM">3 KM</option>
                </select>
              </div>
            </div>

            {/* Info de resultados */}
            <div className="mt-4 text-sm text-slate-600">
              Exibindo <span className="font-semibold">{dadosOrdenados.length}</span> de{' '}
              <span className="font-semibold">{departamentos.length}</span> departamentos
              {' • '}
              Total de inscritos: <span className="font-semibold text-sky-600">{totaisGerais.total}</span>
            </div>
          </div>
        )}

        {/* Estados: Loading / Error / Empty / Table */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Loader2 className="w-12 h-12 text-sky-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Carregando dados...</p>
          </div>
        )}

        {error && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-slate-900 font-semibold mb-2">Erro ao carregar dados</p>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={carregarDados} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        )}

        {!loading && !error && dadosOrdenados.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">
              {busca || filtroModalidade !== 'Todas'
                ? 'Nenhum departamento encontrado com os filtros aplicados.'
                : 'Nenhum dado de participação encontrado.'}
            </p>
          </div>
        )}

        {!loading && !error && dadosOrdenados.length > 0 && (
          <>
            {/* Tabela - Desktop */}
            <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-sky-500 to-sky-600 text-white">
                    <tr>
                      <th
                        className="px-6 py-4 text-left cursor-pointer hover:bg-sky-600 transition-colors"
                        onClick={() => alternarOrdenacao('departamento')}
                      >
                        <div className="flex items-center gap-2 font-semibold">
                          Departamento
                          <IconeOrdenacao coluna="departamento" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-center cursor-pointer hover:bg-sky-600 transition-colors"
                        onClick={() => alternarOrdenacao('modalidade_10KM')}
                      >
                        <div className="flex items-center justify-center gap-2 font-semibold">
                          10 KM
                          <IconeOrdenacao coluna="modalidade_10KM" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-center cursor-pointer hover:bg-sky-600 transition-colors"
                        onClick={() => alternarOrdenacao('modalidade_5KM')}
                      >
                        <div className="flex items-center justify-center gap-2 font-semibold">
                          5 KM
                          <IconeOrdenacao coluna="modalidade_5KM" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-center cursor-pointer hover:bg-sky-600 transition-colors"
                        onClick={() => alternarOrdenacao('modalidade_3KM')}
                      >
                        <div className="flex items-center justify-center gap-2 font-semibold">
                          3 KM
                          <IconeOrdenacao coluna="modalidade_3KM" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-center cursor-pointer hover:bg-sky-600 transition-colors"
                        onClick={() => alternarOrdenacao('total')}
                      >
                        <div className="flex items-center justify-center gap-2 font-semibold">
                          Total
                          <IconeOrdenacao coluna="total" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dadosPaginados.map((dept, index) => (
                      <tr
                        key={index}
                        className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                        }`}
                      >
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {dept.departamento}
                        </td>
                        <td className="px-6 py-4 text-center text-blue-600 font-semibold">
                          {dept.modalidade_10KM}
                        </td>
                        <td className="px-6 py-4 text-center text-cyan-600 font-semibold">
                          {dept.modalidade_5KM}
                        </td>
                        <td className="px-6 py-4 text-center text-teal-600 font-semibold">
                          {dept.modalidade_3KM}
                        </td>
                        <td className="px-6 py-4 text-center text-sky-600 font-bold text-lg">
                          {dept.total}
                        </td>
                      </tr>
                    ))}
                    {/* Linha de totais */}
                    <tr className="bg-gradient-to-r from-slate-700 to-slate-800 text-white font-bold">
                      <td className="px-6 py-4">TOTAL GERAL</td>
                      <td className="px-6 py-4 text-center">{totaisGerais.modalidade_10KM}</td>
                      <td className="px-6 py-4 text-center">{totaisGerais.modalidade_5KM}</td>
                      <td className="px-6 py-4 text-center">{totaisGerais.modalidade_3KM}</td>
                      <td className="px-6 py-4 text-center text-xl">{totaisGerais.total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabela - Mobile (Cards) */}
            <div className="md:hidden space-y-4">
              {dadosPaginados.map((dept, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-sky-500">
                  <h3 className="font-bold text-slate-900 text-lg mb-3">{dept.departamento}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded p-2">
                      <p className="text-xs text-slate-600">10 KM</p>
                      <p className="text-xl font-bold text-blue-600">{dept.modalidade_10KM}</p>
                    </div>
                    <div className="bg-cyan-50 rounded p-2">
                      <p className="text-xs text-slate-600">5 KM</p>
                      <p className="text-xl font-bold text-cyan-600">{dept.modalidade_5KM}</p>
                    </div>
                    <div className="bg-teal-50 rounded p-2">
                      <p className="text-xs text-slate-600">3 KM</p>
                      <p className="text-xl font-bold text-teal-600">{dept.modalidade_3KM}</p>
                    </div>
                    <div className="bg-sky-50 rounded p-2">
                      <p className="text-xs text-slate-600">Total</p>
                      <p className="text-2xl font-bold text-sky-600">{dept.total}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="mt-6 bg-white rounded-lg shadow-md p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Itens por página */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-600">Itens por página:</label>
                    <select
                      value={itensPorPagina}
                      onChange={(e) => {
                        setItensPorPagina(Number(e.target.value))
                        setPaginaAtual(1)
                      }}
                      className="px-3 py-1 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  {/* Navegação de páginas */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaginaAtual(prev => Math.max(1, prev - 1))}
                      disabled={paginaAtual === 1}
                    >
                      Anterior
                    </Button>

                    <span className="text-sm text-slate-600 px-4">
                      Página <span className="font-semibold">{paginaAtual}</span> de{' '}
                      <span className="font-semibold">{totalPaginas}</span>
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaginaAtual(prev => Math.min(totalPaginas, prev + 1))}
                      disabled={paginaAtual === totalPaginas}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        </TabsContent>

        {/* TAB 2: TIPO DE PARTICIPAÇÃO */}
        <TabsContent value="tipo" className="mt-0">
            {/* Estados: Loading / Error / Empty / Table */}
            {loadingTipo && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Loader2 className="w-12 h-12 text-sky-500 animate-spin mx-auto mb-4" />
                <p className="text-slate-600">Carregando dados...</p>
              </div>
            )}

            {errorTipo && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-slate-900 font-semibold mb-2">Erro ao carregar dados</p>
                <p className="text-slate-600 mb-4">{errorTipo}</p>
                <Button onClick={carregarDadosTipoParticipacao} variant="outline">
                  Tentar Novamente
                </Button>
              </div>
            )}

            {!loadingTipo && !errorTipo && dadosOrdenadosTipo.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">Nenhum dado de participação encontrado.</p>
              </div>
            )}

            {!loadingTipo && !errorTipo && dadosOrdenadosTipo.length > 0 && (
              <>
                {/* Filtro de Busca */}
                <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Buscar Departamento
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Digite o nome do departamento..."
                      value={buscaTipo}
                      onChange={(e) => {
                        setBuscaTipo(e.target.value)
                        setPaginaAtual(1)
                      }}
                      className="pl-10"
                    />
                  </div>
                  <div className="mt-4 text-sm text-slate-600">
                    Exibindo <span className="font-semibold">{dadosOrdenadosTipo.length}</span> de{' '}
                    <span className="font-semibold">{dadosTipoParticipacao.length}</span> departamentos
                  </div>
                </div>

                {/* Tabela - Desktop */}
                <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-sky-500 to-sky-600 text-white">
                        <tr>
                          <th
                            className="px-6 py-4 text-left cursor-pointer hover:bg-sky-600 transition-colors"
                            onClick={() => alternarOrdenacaoTipo('lotacao')}
                          >
                            <div className="flex items-center gap-2 font-semibold">
                              Departamento
                              <IconeOrdenacaoTipo coluna="lotacao" />
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-center cursor-pointer hover:bg-sky-600 transition-colors"
                            onClick={() => alternarOrdenacaoTipo('corrida_natal')}
                          >
                            <div className="flex items-center justify-center gap-2 font-semibold">
                              Corrida + Natal
                              <IconeOrdenacaoTipo coluna="corrida_natal" />
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-center cursor-pointer hover:bg-sky-600 transition-colors"
                            onClick={() => alternarOrdenacaoTipo('apenas_natal')}
                          >
                            <div className="flex items-center justify-center gap-2 font-semibold">
                              Apenas Natal
                              <IconeOrdenacaoTipo coluna="apenas_natal" />
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-center cursor-pointer hover:bg-sky-600 transition-colors"
                            onClick={() => alternarOrdenacaoTipo('retirar_cesta')}
                          >
                            <div className="flex items-center justify-center gap-2 font-semibold">
                              Retirar Cesta
                              <IconeOrdenacaoTipo coluna="retirar_cesta" />
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-center cursor-pointer hover:bg-sky-600 transition-colors"
                            onClick={() => alternarOrdenacaoTipo('total')}
                          >
                            <div className="flex items-center justify-center gap-2 font-semibold">
                              Total
                              <IconeOrdenacaoTipo coluna="total" />
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {dadosPaginadosTipo.map((dept, index) => (
                          <tr
                            key={index}
                            className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                              index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                            }`}
                          >
                            <td className="px-6 py-4 font-semibold text-slate-900">
                              {dept.lotacao}
                            </td>
                            <td className="px-6 py-4 text-center text-sky-600 font-semibold">
                              {dept.corrida_natal}
                            </td>
                            <td className="px-6 py-4 text-center text-amber-600 font-semibold">
                              {dept.apenas_natal}
                            </td>
                            <td className="px-6 py-4 text-center text-green-600 font-semibold">
                              {dept.retirar_cesta}
                            </td>
                            <td className="px-6 py-4 text-center text-sky-600 font-bold text-lg">
                              {dept.total}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tabela - Mobile (Cards) */}
                <div className="md:hidden space-y-4">
                  {dadosPaginadosTipo.map((dept, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-sky-500">
                      <h3 className="font-bold text-slate-900 text-lg mb-3">{dept.lotacao}</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-sky-50 rounded p-2">
                          <p className="text-xs text-slate-600">Corrida + Natal</p>
                          <p className="text-xl font-bold text-sky-600">{dept.corrida_natal}</p>
                        </div>
                        <div className="bg-amber-50 rounded p-2">
                          <p className="text-xs text-slate-600">Apenas Natal</p>
                          <p className="text-xl font-bold text-amber-600">{dept.apenas_natal}</p>
                        </div>
                        <div className="bg-green-50 rounded p-2">
                          <p className="text-xs text-slate-600">Retirar Cesta</p>
                          <p className="text-xl font-bold text-green-600">{dept.retirar_cesta}</p>
                        </div>
                        <div className="bg-sky-50 rounded p-2">
                          <p className="text-xs text-slate-600">Total</p>
                          <p className="text-2xl font-bold text-sky-600">{dept.total}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginação */}
                {totalPaginasTipo > 1 && (
                  <div className="mt-6 bg-white rounded-lg shadow-md p-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-600">Itens por página:</label>
                        <select
                          value={itensPorPagina}
                          onChange={(e) => {
                            setItensPorPagina(Number(e.target.value))
                            setPaginaAtual(1)
                          }}
                          className="px-3 py-1 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPaginaAtual(prev => Math.max(1, prev - 1))}
                          disabled={paginaAtual === 1}
                        >
                          Anterior
                        </Button>

                        <span className="text-sm text-slate-600 px-4">
                          Página <span className="font-semibold">{paginaAtual}</span> de{' '}
                          <span className="font-semibold">{totalPaginasTipo}</span>
                        </span>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPaginaAtual(prev => Math.min(totalPaginasTipo, prev + 1))}
                          disabled={paginaAtual === totalPaginasTipo}
                        >
                          Próxima
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* TAB 3: INSCRITOS POR DEPARTAMENTO */}
          <TabsContent value="inscritos" className="mt-0">
            {/* Estados: Loading / Error / Empty / Table */}
            {loadingInscritos && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Loader2 className="w-12 h-12 text-sky-500 animate-spin mx-auto mb-4" />
                <p className="text-slate-600">Carregando dados...</p>
              </div>
            )}

            {errorInscritos && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-slate-900 font-semibold mb-2">Erro ao carregar dados</p>
                <p className="text-slate-600 mb-4">{errorInscritos}</p>
                <Button onClick={carregarDadosInscritos} variant="outline">
                  Tentar Novamente
                </Button>
              </div>
            )}

            {!loadingInscritos && !errorInscritos && dadosOrdenadosInscritos.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">Nenhum dado de participação encontrado.</p>
              </div>
            )}

            {!loadingInscritos && !errorInscritos && dadosOrdenadosInscritos.length > 0 && (
              <>
                {/* Filtro de Busca */}
                <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Buscar Departamento
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Digite o nome do departamento..."
                      value={buscaInscritos}
                      onChange={(e) => {
                        setBuscaInscritos(e.target.value)
                        setPaginaAtual(1)
                      }}
                      className="pl-10"
                    />
                  </div>
                  <div className="mt-4 text-sm text-slate-600">
                    Exibindo <span className="font-semibold">{dadosOrdenadosInscritos.length}</span> de{' '}
                    <span className="font-semibold">{dadosInscritos.length}</span> departamentos
                  </div>
                </div>

                {/* Tabela - Desktop */}
                <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-sky-500 to-sky-600 text-white">
                        <tr>
                          <th
                            className="px-6 py-4 text-left cursor-pointer hover:bg-sky-600 transition-colors"
                            onClick={() => alternarOrdenacaoInscritos('lotacao')}
                          >
                            <div className="flex items-center gap-2 font-semibold">
                              Departamento
                              <IconeOrdenacaoInscritos coluna="lotacao" />
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-center cursor-pointer hover:bg-sky-600 transition-colors"
                            onClick={() => alternarOrdenacaoInscritos('total_funcionarios')}
                          >
                            <div className="flex items-center justify-center gap-2 font-semibold">
                              Total Funcionários
                              <IconeOrdenacaoInscritos coluna="total_funcionarios" />
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-center cursor-pointer hover:bg-sky-600 transition-colors"
                            onClick={() => alternarOrdenacaoInscritos('total_inscritos')}
                          >
                            <div className="flex items-center justify-center gap-2 font-semibold">
                              Com Inscrição
                              <IconeOrdenacaoInscritos coluna="total_inscritos" />
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-center cursor-pointer hover:bg-sky-600 transition-colors"
                            onClick={() => alternarOrdenacaoInscritos('sem_inscricao')}
                          >
                            <div className="flex items-center justify-center gap-2 font-semibold">
                              Sem Inscrição
                              <IconeOrdenacaoInscritos coluna="sem_inscricao" />
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-center cursor-pointer hover:bg-sky-600 transition-colors"
                            onClick={() => alternarOrdenacaoInscritos('percentual_adesao')}
                          >
                            <div className="flex items-center justify-center gap-2 font-semibold">
                              % Adesão
                              <IconeOrdenacaoInscritos coluna="percentual_adesao" />
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {dadosPaginadosInscritos.map((dept, index) => (
                          <tr
                            key={index}
                            className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                              index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                            }`}
                          >
                            <td className="px-6 py-4 font-semibold text-slate-900">
                              {dept.lotacao}
                            </td>
                            <td className="px-6 py-4 text-center text-slate-600 font-semibold">
                              {dept.total_funcionarios}
                            </td>
                            <td className="px-6 py-4 text-center text-green-600 font-semibold">
                              {dept.total_inscritos}
                            </td>
                            <td className="px-6 py-4 text-center text-red-600 font-semibold">
                              {dept.sem_inscricao}
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-lg">
                              <span className={
                                dept.percentual_adesao >= 50 ? 'text-green-600' :
                                dept.percentual_adesao >= 25 ? 'text-amber-600' :
                                'text-red-600'
                              }>
                                {dept.percentual_adesao.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tabela - Mobile (Cards) */}
                <div className="md:hidden space-y-4">
                  {dadosPaginadosInscritos.map((dept, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-sky-500">
                      <h3 className="font-bold text-slate-900 text-lg mb-3">{dept.lotacao}</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded p-2">
                          <p className="text-xs text-slate-600">Total Funcionários</p>
                          <p className="text-xl font-bold text-slate-600">{dept.total_funcionarios}</p>
                        </div>
                        <div className="bg-green-50 rounded p-2">
                          <p className="text-xs text-slate-600">Com Inscrição</p>
                          <p className="text-xl font-bold text-green-600">{dept.total_inscritos}</p>
                        </div>
                        <div className="bg-red-50 rounded p-2">
                          <p className="text-xs text-slate-600">Sem Inscrição</p>
                          <p className="text-xl font-bold text-red-600">{dept.sem_inscricao}</p>
                        </div>
                        <div className="bg-gradient-to-r from-sky-50 to-sky-100 rounded p-2">
                          <p className="text-xs text-slate-600 mb-1">% Adesão</p>
                          <p className={`text-2xl font-bold ${
                            dept.percentual_adesao >= 50 ? 'text-green-600' :
                            dept.percentual_adesao >= 25 ? 'text-amber-600' :
                            'text-red-600'
                          }`}>
                            {dept.percentual_adesao.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginação */}
                {totalPaginasInscritos > 1 && (
                  <div className="mt-6 bg-white rounded-lg shadow-md p-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-600">Itens por página:</label>
                        <select
                          value={itensPorPagina}
                          onChange={(e) => {
                            setItensPorPagina(Number(e.target.value))
                            setPaginaAtual(1)
                          }}
                          className="px-3 py-1 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPaginaAtual(prev => Math.max(1, prev - 1))}
                          disabled={paginaAtual === 1}
                        >
                          Anterior
                        </Button>

                        <span className="text-sm text-slate-600 px-4">
                          Página <span className="font-semibold">{paginaAtual}</span> de{' '}
                          <span className="font-semibold">{totalPaginasInscritos}</span>
                        </span>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPaginaAtual(prev => Math.min(totalPaginasInscritos, prev + 1))}
                          disabled={paginaAtual === totalPaginasInscritos}
                        >
                          Próxima
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal de Preview PDF */}
      <Dialog open={modalPDFAberto} onOpenChange={setModalPDFAberto}>
        <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Preview do Relatório
            </DialogTitle>
            <DialogDescription>
              Visualize o relatório antes de fazer o download
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {pdfDataUrl && (
              <iframe
                src={pdfDataUrl}
                className="w-full h-full border rounded"
                title="Preview PDF"
              />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setModalPDFAberto(false)}>
              Fechar
            </Button>
            <Button onClick={handleDownloadPDF} className="bg-sky-500 hover:bg-sky-600">
              <Download className="w-4 h-4 mr-2" />
              Baixar PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DepartamentoDashboardCorrida
