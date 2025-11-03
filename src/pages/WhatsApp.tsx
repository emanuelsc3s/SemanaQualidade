/**
 * Página de Gerenciamento de Mensagens WhatsApp
 * 
 * Funcionalidades:
 * - Listagem de todas as mensagens da tabela tbwhatsapp_send
 * - Seleção individual e em massa de mensagens
 * - Envio de mensagens selecionadas via API Evolution
 * - Paginação e filtros
 * - Design responsivo mobile-first
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/services/supabase'
import { sendWhatsAppMessage } from '@/services/whatsappService'
import { TbWhatsAppSend, WhatsAppStatus } from '@/types/whatsapp-type'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Loader2, 
  Send, 
  RefreshCw, 
  Search,
  CheckSquare,
  Square,
  ArrowLeft,
  AlertCircle
} from 'lucide-react'

export default function WhatsApp() {
  const navigate = useNavigate()

  // Estados principais
  const [mensagens, setMensagens] = useState<TbWhatsAppSend[]>([])
  const [mensagensSelecionadas, setMensagensSelecionadas] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [totalItems, setTotalItems] = useState(0)

  // Carregar mensagens do Supabase
  const carregarMensagens = async () => {
    try {
      setLoading(true)
      setErro(null)

      console.log('📥 [WhatsApp] Carregando mensagens...')

      // Calcular offset para paginação
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1

      // Buscar mensagens com paginação
      const { data, error, count } = await supabase
        .from('tbwhatsapp_send')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) {
        console.error('❌ [WhatsApp] Erro ao carregar mensagens:', error)
        throw error
      }

      console.log(`✅ [WhatsApp] ${data?.length || 0} mensagens carregadas`)
      setMensagens(data || [])
      setTotalItems(count || 0)

    } catch (error: any) {
      console.error('❌ [WhatsApp] Erro:', error)
      setErro(error.message || 'Erro ao carregar mensagens')
    } finally {
      setLoading(false)
    }
  }

  // Carregar mensagens ao montar o componente
  useEffect(() => {
    carregarMensagens()
  }, [currentPage, itemsPerPage])

  // Selecionar/desselecionar todas as mensagens
  const toggleSelecionarTodas = () => {
    if (mensagensSelecionadas.size === mensagensFiltradas.length) {
      // Desselecionar todas
      setMensagensSelecionadas(new Set())
    } else {
      // Selecionar todas (apenas as filtradas)
      const novasSelecoes = new Set(mensagensFiltradas.map(m => m.id))
      setMensagensSelecionadas(novasSelecoes)
    }
  }

  // Selecionar/desselecionar mensagem individual
  const toggleSelecionarMensagem = (id: string) => {
    const novasSelecoes = new Set(mensagensSelecionadas)
    if (novasSelecoes.has(id)) {
      novasSelecoes.delete(id)
    } else {
      novasSelecoes.add(id)
    }
    setMensagensSelecionadas(novasSelecoes)
  }

  // Enviar mensagens selecionadas
  const enviarMensagensSelecionadas = async () => {
    if (mensagensSelecionadas.size === 0) {
      alert('Selecione pelo menos uma mensagem para enviar')
      return
    }

    const confirmacao = window.confirm(
      `Deseja enviar ${mensagensSelecionadas.size} mensagem(ns) selecionada(s)?`
    )

    if (!confirmacao) return

    try {
      setEnviando(true)
      console.log(`📤 [WhatsApp] Enviando ${mensagensSelecionadas.size} mensagens...`)

      let enviadas = 0
      let falhas = 0
      const erros: Array<{ id: string; numero: string; error: string }> = []

      // Enviar cada mensagem selecionada
      for (const id of mensagensSelecionadas) {
        const mensagem = mensagens.find(m => m.id === id)
        if (!mensagem) continue

        try {
          // Atualizar status para "enviando"
          await supabase
            .from('tbwhatsapp_send')
            .update({ 
              status: 'enviando' as WhatsAppStatus,
              attempts: mensagem.attempts + 1
            })
            .eq('id', id)

          // Enviar via API Evolution
          const resultado = await sendWhatsAppMessage({
            phoneNumber: mensagem.numero,
            message: mensagem.message
          })

          if (resultado.success) {
            // Atualizar status para "enviado"
            await supabase
              .from('tbwhatsapp_send')
              .update({ 
                status: 'enviado' as WhatsAppStatus,
                sent_at: new Date().toISOString(),
                processed_at: new Date().toISOString()
              })
              .eq('id', id)

            enviadas++
            console.log(`✅ [WhatsApp] Mensagem ${id} enviada com sucesso`)
          } else {
            throw new Error(resultado.error || 'Erro desconhecido')
          }

        } catch (error: any) {
          console.error(`❌ [WhatsApp] Erro ao enviar mensagem ${id}:`, error)
          
          // Atualizar status para "falhou"
          await supabase
            .from('tbwhatsapp_send')
            .update({ 
              status: 'falhou' as WhatsAppStatus,
              last_error: error.message || 'Erro ao enviar',
              processed_at: new Date().toISOString()
            })
            .eq('id', id)

          falhas++
          erros.push({
            id,
            numero: mensagem.numero,
            error: error.message || 'Erro desconhecido'
          })
        }
      }

      // Exibir resultado
      let mensagemResultado = `✅ ${enviadas} mensagem(ns) enviada(s) com sucesso`
      if (falhas > 0) {
        mensagemResultado += `\n❌ ${falhas} mensagem(ns) falharam`
      }
      alert(mensagemResultado)

      // Limpar seleções e recarregar
      setMensagensSelecionadas(new Set())
      await carregarMensagens()

    } catch (error: any) {
      console.error('❌ [WhatsApp] Erro geral:', error)
      alert(`Erro ao enviar mensagens: ${error.message}`)
    } finally {
      setEnviando(false)
    }
  }

  // Filtrar mensagens por busca local
  const mensagensFiltradas = mensagens.filter(m => {
    if (!searchTerm) return true
    const termo = searchTerm.toLowerCase()
    return (
      m.numero.includes(termo) ||
      m.message.toLowerCase().includes(termo) ||
      m.status.toLowerCase().includes(termo) ||
      (m.matricula && m.matricula.toLowerCase().includes(termo))
    )
  })

  // Calcular total de páginas
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Badge de status com cores
  const getStatusBadge = (status: WhatsAppStatus) => {
    const badges = {
      pendente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      enviando: 'bg-blue-100 text-blue-800 border-blue-300',
      enviado: 'bg-green-100 text-green-800 border-green-300',
      falhou: 'bg-red-100 text-red-800 border-red-300',
      cancelado: 'bg-gray-100 text-gray-800 border-gray-300'
    }

    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${badges[status]}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Mensagens WhatsApp
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Gerenciamento de fila de envio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={carregarMensagens}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
        </div>
      </div>

      {/* Card Principal */}
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-white/50 backdrop-blur">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Total de mensagens */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">
                Total: {totalItems} mensagem(ns)
              </span>
              {loading && <Loader2 className="w-4 h-4 animate-spin text-primary-600" />}
            </div>

            {/* Busca local */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Erro */}
          {erro && (
            <div className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-red-600 font-medium">Erro ao carregar mensagens</p>
              <p className="text-sm text-slate-600 mt-1">{erro}</p>
              <Button onClick={carregarMensagens} className="mt-4">
                Tentar novamente
              </Button>
            </div>
          )}

          {/* Loading inicial */}
          {loading && mensagens.length === 0 && !erro && (
            <div className="p-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-3" />
              <p className="text-slate-600">Carregando mensagens...</p>
            </div>
          )}

          {/* Tabela de mensagens */}
          {!loading && !erro && mensagens.length > 0 && (
            <>
              {/* Barra de ações */}
              <div className="p-4 border-b bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={mensagensSelecionadas.size === mensagensFiltradas.length && mensagensFiltradas.length > 0}
                    onCheckedChange={toggleSelecionarTodas}
                    id="select-all"
                  />
                  <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                    {mensagensSelecionadas.size === mensagensFiltradas.length && mensagensFiltradas.length > 0
                      ? 'Desselecionar todas'
                      : 'Selecionar todas'}
                  </label>
                  {mensagensSelecionadas.size > 0 && (
                    <span className="text-sm text-slate-600">
                      ({mensagensSelecionadas.size} selecionada(s))
                    </span>
                  )}
                </div>

                <Button
                  onClick={enviarMensagensSelecionadas}
                  disabled={mensagensSelecionadas.size === 0 || enviando}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  {enviando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar Selecionadas
                    </>
                  )}
                </Button>
              </div>

              {/* Tabela responsiva */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-100 border-b">
                    <tr>
                      <th className="p-3 text-left text-xs font-medium text-slate-700 uppercase w-12">
                        <span className="sr-only">Selecionar</span>
                      </th>
                      <th className="p-3 text-left text-xs font-medium text-slate-700 uppercase">
                        Número
                      </th>
                      <th className="p-3 text-left text-xs font-medium text-slate-700 uppercase hidden md:table-cell">
                        Mensagem
                      </th>
                      <th className="p-3 text-left text-xs font-medium text-slate-700 uppercase">
                        Status
                      </th>
                      <th className="p-3 text-left text-xs font-medium text-slate-700 uppercase hidden lg:table-cell">
                        Tentativas
                      </th>
                      <th className="p-3 text-left text-xs font-medium text-slate-700 uppercase hidden lg:table-cell">
                        Data Criação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {mensagensFiltradas.map((mensagem) => (
                      <tr
                        key={mensagem.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          mensagensSelecionadas.has(mensagem.id) ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="p-3">
                          <Checkbox
                            checked={mensagensSelecionadas.has(mensagem.id)}
                            onCheckedChange={() => toggleSelecionarMensagem(mensagem.id)}
                          />
                        </td>
                        <td className="p-3 text-sm font-mono text-slate-900">
                          {mensagem.numero}
                        </td>
                        <td className="p-3 text-sm text-slate-700 hidden md:table-cell max-w-xs truncate">
                          {mensagem.message}
                        </td>
                        <td className="p-3">
                          {getStatusBadge(mensagem.status)}
                        </td>
                        <td className="p-3 text-sm text-slate-600 hidden lg:table-cell">
                          {mensagem.attempts} / {mensagem.max_attempts}
                        </td>
                        <td className="p-3 text-sm text-slate-600 hidden lg:table-cell">
                          {new Date(mensagem.created_at).toLocaleString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              <div className="p-4 border-t bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span>Itens por página:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="border rounded px-2 py-1"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-slate-600">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Sem mensagens */}
          {!loading && !erro && mensagens.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-600">Nenhuma mensagem encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

