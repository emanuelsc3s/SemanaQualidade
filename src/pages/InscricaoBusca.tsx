/**
 * Página: Busca de Inscrições
 * 
 * Lista e exibe todas as inscrições da tabela tbcorrida do Supabase
 * em um grid responsivo e interativo com filtros e busca.
 * 
 * Abordagem: Mobile-First (375px base → 768px tablet → 1024px desktop)
 */

import { useState, useEffect, useMemo } from 'react'
import { supabase, TbCorrida, TipoParticipacao, StatusInscricao } from '../services/supabase'
import { Card, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Button } from '../components/ui/button'
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  ArrowUpDown,
  Loader2
} from 'lucide-react'

/**
 * Interface: Estado de filtros
 */
interface Filtros {
  busca: string
  modalidade: string
  status: string
  kitRetirado: string
}

/**
 * Tipo: Ordenação
 */
type OrdenacaoCampo = 'data_inscricao' | 'nome' | 'modalidade' | 'status'
type OrdenacaoDirecao = 'asc' | 'desc'

/**
 * Componente: InscricaoBusca
 */
export default function InscricaoBusca() {
  // Estados
  const [inscricoes, setInscricoes] = useState<TbCorrida[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  
  // Filtros
  const [filtros, setFiltros] = useState<Filtros>({
    busca: '',
    modalidade: '',
    status: '',
    kitRetirado: ''
  })

  // Ordenação
  const [ordenacao, setOrdenacao] = useState<{
    campo: OrdenacaoCampo
    direcao: OrdenacaoDirecao
  }>({
    campo: 'data_inscricao',
    direcao: 'desc'
  })

  /**
   * Busca inscrições no Supabase
   */
  useEffect(() => {
    buscarInscricoes()
  }, [])

  async function buscarInscricoes() {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 [Busca Inscrições] Buscando dados no Supabase...')

      const { data, error: supabaseError } = await supabase
        .from('tbcorrida')
        .select('*')
        .is('deleted_at', null) // Apenas registros não deletados
        .order('data_inscricao', { ascending: false })

      if (supabaseError) {
        console.error('❌ [Busca Inscrições] Erro ao buscar:', supabaseError)
        throw new Error(supabaseError.message)
      }

      console.log('✅ [Busca Inscrições] Dados carregados:', data?.length || 0, 'inscrições')
      setInscricoes(data || [])

    } catch (err) {
      console.error('❌ [Busca Inscrições] Erro inesperado:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar inscrições')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Filtra e ordena inscrições
   */
  const inscricoesFiltradas = useMemo(() => {
    let resultado = [...inscricoes]

    // Filtro de busca (nome, matrícula, CPF)
    if (filtros.busca) {
      const buscaLower = filtros.busca.toLowerCase()
      resultado = resultado.filter(inscricao => 
        inscricao.nome?.toLowerCase().includes(buscaLower) ||
        inscricao.matricula?.toLowerCase().includes(buscaLower) ||
        inscricao.cpf?.replace(/\D/g, '').includes(buscaLower.replace(/\D/g, ''))
      )
    }

    // Filtro de modalidade
    if (filtros.modalidade) {
      resultado = resultado.filter(inscricao => 
        inscricao.modalidade === filtros.modalidade
      )
    }

    // Filtro de status
    if (filtros.status) {
      resultado = resultado.filter(inscricao => 
        inscricao.status === filtros.status
      )
    }

    // Filtro de kit retirado
    if (filtros.kitRetirado) {
      const kitRetirado = filtros.kitRetirado === 'true'
      resultado = resultado.filter(inscricao => 
        inscricao.kit_retirado === kitRetirado
      )
    }

    // Ordenação
    resultado.sort((a, b) => {
      let valorA: any
      let valorB: any

      switch (ordenacao.campo) {
        case 'data_inscricao':
          valorA = new Date(a.data_inscricao || 0).getTime()
          valorB = new Date(b.data_inscricao || 0).getTime()
          break
        case 'nome':
          valorA = a.nome?.toLowerCase() || ''
          valorB = b.nome?.toLowerCase() || ''
          break
        case 'modalidade':
          valorA = a.modalidade?.toLowerCase() || ''
          valorB = b.modalidade?.toLowerCase() || ''
          break
        case 'status':
          valorA = a.status?.toLowerCase() || ''
          valorB = b.status?.toLowerCase() || ''
          break
        default:
          return 0
      }

      if (valorA < valorB) return ordenacao.direcao === 'asc' ? -1 : 1
      if (valorA > valorB) return ordenacao.direcao === 'asc' ? 1 : -1
      return 0
    })

    return resultado
  }, [inscricoes, filtros, ordenacao])

  /**
   * Alterna ordenação
   */
  function alternarOrdenacao(campo: OrdenacaoCampo) {
    setOrdenacao(prev => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc'
    }))
  }

  /**
   * Limpa filtros
   */
  function limparFiltros() {
    setFiltros({
      busca: '',
      modalidade: '',
      status: '',
      kitRetirado: ''
    })
  }

  /**
   * Formata data para padrão brasileiro
   */
  function formatarData(data: string | null | undefined): string {
    if (!data) return 'N/A'
    
    try {
      const date = new Date(data)
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    } catch {
      return 'Data inválida'
    }
  }

  /**
   * Formata CPF
   */
  function formatarCPF(cpf: string | null | undefined): string {
    if (!cpf) return 'N/A'
    
    const apenasNumeros = cpf.replace(/\D/g, '')
    if (apenasNumeros.length !== 11) return cpf
    
    return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  /**
   * Formata telefone
   */
  function formatarTelefone(telefone: string | null | undefined): string {
    if (!telefone) return 'N/A'
    
    const apenasNumeros = telefone.replace(/\D/g, '')
    if (apenasNumeros.length === 11) {
      return apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    if (apenasNumeros.length === 10) {
      return apenasNumeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return telefone
  }

  /**
   * Retorna ícone e cor do status
   */
  function getStatusInfo(status: StatusInscricao | null | undefined) {
    switch (status) {
      case 'Confirmada':
        return { icon: CheckCircle2, cor: 'text-green-600', bg: 'bg-green-50' }
      case 'Pendente':
        return { icon: Clock, cor: 'text-yellow-600', bg: 'bg-yellow-50' }
      case 'Cancelada':
        return { icon: XCircle, cor: 'text-red-600', bg: 'bg-red-50' }
      case 'Retirou Kit':
        return { icon: Package, cor: 'text-blue-600', bg: 'bg-blue-50' }
      default:
        return { icon: Clock, cor: 'text-slate-400', bg: 'bg-slate-50' }
    }
  }

  /**
   * Conta filtros ativos
   */
  const filtrosAtivos = useMemo(() => {
    let count = 0
    if (filtros.busca) count++
    if (filtros.modalidade) count++
    if (filtros.status) count++
    if (filtros.kitRetirado) count++
    return count
  }, [filtros])

  // Renderização
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
            📋 Inscrições da Corrida
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">
            {inscricoesFiltradas.length} {inscricoesFiltradas.length === 1 ? 'inscrição encontrada' : 'inscrições encontradas'}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8 lg:py-12">
        {/* Barra de Busca e Filtros */}
        <div className="mb-6 md:mb-8 space-y-4">
          {/* Campo de Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por nome, matrícula ou CPF..."
              value={filtros.busca}
              onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex-1 sm:flex-none h-12"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {filtrosAtivos > 0 && (
                <span className="ml-2 bg-primary-500 text-white rounded-full px-2 py-0.5 text-xs">
                  {filtrosAtivos}
                </span>
              )}
            </Button>

            {filtrosAtivos > 0 && (
              <Button
                variant="ghost"
                onClick={limparFiltros}
                className="flex-1 sm:flex-none h-12"
              >
                Limpar Filtros
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => buscarInscricoes()}
              className="flex-1 sm:flex-none h-12"
            >
              Atualizar
            </Button>
          </div>

          {/* Painel de Filtros */}
          {mostrarFiltros && (
            <Card className="border-2 border-primary-200">
              <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Filtro: Modalidade */}
                  <div>
                    <Label htmlFor="filtro-modalidade" className="text-sm font-medium mb-2 block">
                      Modalidade
                    </Label>
                    <select
                      id="filtro-modalidade"
                      value={filtros.modalidade}
                      onChange={(e) => setFiltros(prev => ({ ...prev, modalidade: e.target.value }))}
                      className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Todas</option>
                      <option value="5K">5K</option>
                      <option value="10K">10K</option>
                      <option value="Caminhada">Caminhada</option>
                    </select>
                  </div>

                  {/* Filtro: Status */}
                  <div>
                    <Label htmlFor="filtro-status" className="text-sm font-medium mb-2 block">
                      Status
                    </Label>
                    <select
                      id="filtro-status"
                      value={filtros.status}
                      onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Todos</option>
                      <option value="Pendente">Pendente</option>
                      <option value="Confirmada">Confirmada</option>
                      <option value="Cancelada">Cancelada</option>
                      <option value="Retirou Kit">Retirou Kit</option>
                    </select>
                  </div>

                  {/* Filtro: Kit Retirado */}
                  <div>
                    <Label htmlFor="filtro-kit" className="text-sm font-medium mb-2 block">
                      Kit Retirado
                    </Label>
                    <select
                      id="filtro-kit"
                      value={filtros.kitRetirado}
                      onChange={(e) => setFiltros(prev => ({ ...prev, kitRetirado: e.target.value }))}
                      className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Todos</option>
                      <option value="true">Sim</option>
                      <option value="false">Não</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botões de Ordenação */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={ordenacao.campo === 'data_inscricao' ? 'default' : 'outline'}
              size="sm"
              onClick={() => alternarOrdenacao('data_inscricao')}
              className="text-xs md:text-sm"
            >
              <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              Data
              <ArrowUpDown className="h-3 w-3 ml-1" />
            </Button>

            <Button
              variant={ordenacao.campo === 'nome' ? 'default' : 'outline'}
              size="sm"
              onClick={() => alternarOrdenacao('nome')}
              className="text-xs md:text-sm"
            >
              <User className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              Nome
              <ArrowUpDown className="h-3 w-3 ml-1" />
            </Button>

            <Button
              variant={ordenacao.campo === 'modalidade' ? 'default' : 'outline'}
              size="sm"
              onClick={() => alternarOrdenacao('modalidade')}
              className="text-xs md:text-sm"
            >
              <Award className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              Modalidade
              <ArrowUpDown className="h-3 w-3 ml-1" />
            </Button>

            <Button
              variant={ordenacao.campo === 'status' ? 'default' : 'outline'}
              size="sm"
              onClick={() => alternarOrdenacao('status')}
              className="text-xs md:text-sm"
            >
              Status
              <ArrowUpDown className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 md:py-20">
            <Loader2 className="h-12 w-12 md:h-16 md:w-16 text-primary-500 animate-spin mb-4" />
            <p className="text-slate-600 text-sm md:text-base">Carregando inscrições...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="border-2 border-red-200 bg-red-50">
            <CardContent className="p-6 md:p-8 text-center">
              <XCircle className="h-12 w-12 md:h-16 md:w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold text-red-900 mb-2">
                Erro ao carregar inscrições
              </h3>
              <p className="text-red-700 text-sm md:text-base mb-4">{error}</p>
              <Button onClick={buscarInscricoes} variant="outline">
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && inscricoesFiltradas.length === 0 && (
          <Card className="border-2 border-slate-200">
            <CardContent className="p-8 md:p-12 text-center">
              <Search className="h-16 w-16 md:h-20 md:w-20 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl md:text-2xl font-semibold text-slate-700 mb-2">
                Nenhuma inscrição encontrada
              </h3>
              <p className="text-slate-500 text-sm md:text-base mb-4">
                {filtrosAtivos > 0
                  ? 'Tente ajustar os filtros de busca'
                  : 'Ainda não há inscrições cadastradas'
                }
              </p>
              {filtrosAtivos > 0 && (
                <Button onClick={limparFiltros} variant="outline">
                  Limpar Filtros
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Grid de Inscrições */}
        {!loading && !error && inscricoesFiltradas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {inscricoesFiltradas.map((inscricao) => {
              const statusInfo = getStatusInfo(inscricao.status)
              const StatusIcon = statusInfo.icon

              return (
                <Card
                  key={inscricao.corrida_id}
                  className="hover:shadow-lg transition-shadow duration-300 border-2 hover:border-primary-300"
                >
                  <CardContent className="p-4 md:p-6">
                    {/* Header do Card */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1 line-clamp-2">
                          {inscricao.nome || 'Nome não informado'}
                        </h3>
                        <p className="text-sm text-slate-500">
                          #{inscricao.corrida_id.toString().padStart(4, '0')}
                        </p>
                      </div>

                      {/* Badge de Status */}
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${statusInfo.bg}`}>
                        <StatusIcon className={`h-4 w-4 ${statusInfo.cor}`} />
                      </div>
                    </div>

                    {/* Informações Principais */}
                    <div className="space-y-3 mb-4">
                      {/* Matrícula */}
                      {inscricao.matricula && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <span className="text-slate-600">Mat:</span>
                          <span className="font-medium text-slate-900">{inscricao.matricula}</span>
                        </div>
                      )}

                      {/* Email */}
                      {inscricao.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <span className="text-slate-900 truncate">{inscricao.email}</span>
                        </div>
                      )}

                      {/* WhatsApp */}
                      {inscricao.whatsapp && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <span className="text-slate-900">{formatarTelefone(inscricao.whatsapp)}</span>
                        </div>
                      )}

                      {/* Modalidade */}
                      {inscricao.modalidade && (
                        <div className="flex items-center gap-2 text-sm">
                          <Award className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <span className="text-slate-600">Modalidade:</span>
                          <span className="font-semibold text-primary-600">{inscricao.modalidade}</span>
                        </div>
                      )}

                      {/* Data de Inscrição */}
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-600">Inscrito em:</span>
                        <span className="text-slate-900">{formatarData(inscricao.data_inscricao)}</span>
                      </div>
                    </div>

                    {/* Footer do Card */}
                    <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                      {/* Status */}
                      <div className="flex items-center gap-2">
                        <span className={`text-xs md:text-sm font-medium ${statusInfo.cor}`}>
                          {inscricao.status || 'Pendente'}
                        </span>
                      </div>

                      {/* Kit Retirado */}
                      <div className="flex items-center gap-1">
                        <Package className={`h-4 w-4 ${inscricao.kit_retirado ? 'text-green-600' : 'text-slate-300'}`} />
                        <span className={`text-xs ${inscricao.kit_retirado ? 'text-green-600' : 'text-slate-400'}`}>
                          {inscricao.kit_retirado ? 'Kit Retirado' : 'Kit Pendente'}
                        </span>
                      </div>
                    </div>

                    {/* Informações Adicionais (Expandível em hover/click) */}
                    <details className="mt-4 pt-4 border-t border-slate-100">
                      <summary className="text-xs text-primary-600 cursor-pointer hover:text-primary-700 font-medium">
                        Ver mais detalhes
                      </summary>
                      <div className="mt-3 space-y-2 text-xs text-slate-600">
                        {inscricao.cpf && (
                          <p><strong>CPF:</strong> {formatarCPF(inscricao.cpf)}</p>
                        )}
                        {inscricao.nascimento && (
                          <p><strong>Nascimento:</strong> {formatarData(inscricao.nascimento)}</p>
                        )}
                        {inscricao.tamanho_camiseta && (
                          <p><strong>Tamanho Camiseta:</strong> {inscricao.tamanho_camiseta}</p>
                        )}
                        {inscricao.tipo_participacao && (
                          <p><strong>Tipo:</strong> {inscricao.tipo_participacao}</p>
                        )}
                        {inscricao.data_retirada_kit && (
                          <p><strong>Data Retirada Kit:</strong> {formatarData(inscricao.data_retirada_kit)}</p>
                        )}
                      </div>
                    </details>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-6 md:py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm md:text-base">
            II Corrida e Caminhada da Qualidade FARMACE
          </p>
          <p className="text-xs md:text-sm text-slate-400 mt-2">
            Total de inscrições: {inscricoes.length}
          </p>
        </div>
      </footer>
    </div>
  )
}

