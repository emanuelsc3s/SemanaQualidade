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

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/services/supabase'
import { sendWhatsAppMessage } from '@/services/whatsappService'
import { TbWhatsAppSend, WhatsAppStatus } from '@/types/whatsapp-type'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ModalWhatsAppEnvio, MensagemEnvio, EnvioStatus } from '@/components/ModalWhatsAppEnvio'
import {
  Loader2,
  Send,
  RefreshCw,
  Search,
  ArrowLeft,
  AlertCircle,
  Settings
} from 'lucide-react'

// 🚨 CONSTANTES DE SEGURANÇA - INTERVALOS ALEATÓRIOS
const INTERVALO_MINIMO_SEGUNDOS = 10 // Intervalo mínimo entre envios (segundos)
const INTERVALO_MAXIMO_SEGUNDOS = 45 // Intervalo máximo entre envios (segundos)
const STORAGE_KEY_MODO_TESTE = 'whatsapp_modo_teste' // Chave do localStorage

/**
 * Gera um intervalo aleatório entre min e max segundos
 * Cada chamada retorna um valor único e imprevisível
 * @param min Intervalo mínimo em segundos (padrão: 10)
 * @param max Intervalo máximo em segundos (padrão: 45)
 * @returns Intervalo aleatório em segundos
 */
const gerarIntervaloAleatorio = (min: number = 10, max: number = 45): number => {
  const intervalo = Math.floor(Math.random() * (max - min + 1)) + min
  console.log(`🎲 [Randomização] Intervalo gerado: ${intervalo}s (entre ${min}s e ${max}s)`)
  return intervalo
}

// Função para obter modo teste do localStorage
const getModoTeste = (): boolean => {
  const stored = localStorage.getItem(STORAGE_KEY_MODO_TESTE)
  return stored === 'true'
}

// Função para salvar modo teste no localStorage
const setModoTeste = (valor: boolean): void => {
  localStorage.setItem(STORAGE_KEY_MODO_TESTE, valor.toString())
  console.log(`🔧 [Config] Modo teste ${valor ? 'ATIVADO' : 'DESATIVADO'}`)
}

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

  // Estados do Modal de Envio
  const [modalEnvioAberto, setModalEnvioAberto] = useState(false)
  const [mensagensEnvio, setMensagensEnvio] = useState<MensagemEnvio[]>([])
  const [mensagemAtualIndex, setMensagemAtualIndex] = useState(0)
  const [contadorRegressivo, setContadorRegressivo] = useState(0)
  const [enviosConcluidos, setEnviosConcluidos] = useState(false)

  // Estados de Cancelamento
  const [modalCancelarAberto, setModalCancelarAberto] = useState(false)

  // 🔴 CRÍTICO: Usar useRef para flags de controle (não useState)
  // Refs são atualizadas imediatamente e funcionam corretamente em loops assíncronos
  const cancelarEnvioRef = useRef(false) // Flag de cancelamento
  const processoPausadoRef = useRef(false) // Flag de pausa

  // Estado visual separado para forçar re-render do componente quando pausado
  const [processoPausadoUI, setProcessoPausadoUI] = useState(false)

  // Estados de Configuração
  const [modalConfigAberto, setModalConfigAberto] = useState(false)
  const [modoTesteAtivo, setModoTesteAtivo] = useState(getModoTeste())

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

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar mensagens'
      console.error('❌ [WhatsApp] Erro:', error)
      setErro(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Carregar mensagens ao montar o componente
  useEffect(() => {
    carregarMensagens()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Enviar mensagens selecionadas com intervalo de 15 segundos
  const enviarMensagensSelecionadas = async () => {
    if (mensagensSelecionadas.size === 0) {
      alert('Selecione pelo menos uma mensagem para enviar')
      return
    }

    // Se for apenas 1 mensagem, envia direto sem modal
    if (mensagensSelecionadas.size === 1) {
      await enviarMensagemUnica()
      return
    }

    // 🚨 SEGURANÇA: Confirmação dupla para envio em lote
    const totalMensagens = mensagensSelecionadas.size
    const tempoMedio = Math.ceil((INTERVALO_MINIMO_SEGUNDOS + INTERVALO_MAXIMO_SEGUNDOS) / 2)
    const tempoTotal = Math.ceil((totalMensagens - 1) * tempoMedio / 60) // tempo em minutos

    const confirmacao1 = window.confirm(
      `⚠️ ATENÇÃO - ENVIO EM LOTE\n\n` +
      `Você está prestes a enviar ${totalMensagens} mensagens.\n\n` +
      `Para evitar banimento do WhatsApp:\n` +
      `• Intervalo ALEATÓRIO entre ${INTERVALO_MINIMO_SEGUNDOS}-${INTERVALO_MAXIMO_SEGUNDOS} segundos entre cada envio\n` +
      `• Tempo total estimado: ~${tempoTotal} minuto(s) (pode variar)\n` +
      `• O processo NÃO pode ser cancelado após iniciar\n\n` +
      `Deseja continuar?`
    )

    if (!confirmacao1) return

    // Segunda confirmação
    const confirmacao2 = window.confirm(
      `🔒 CONFIRMAÇÃO FINAL\n\n` +
      `Confirma o envio de ${totalMensagens} mensagens com intervalo aleatório de ${INTERVALO_MINIMO_SEGUNDOS}-${INTERVALO_MAXIMO_SEGUNDOS} segundos?\n\n` +
      `Esta é sua última chance de cancelar.`
    )

    if (!confirmacao2) return

    // Preparar lista de mensagens para o modal
    const mensagensParaEnviar: MensagemEnvio[] = Array.from(mensagensSelecionadas).map(id => {
      const mensagem = mensagens.find(m => m.id === id)
      return {
        id,
        numero: mensagem?.numero || 'Desconhecido',
        status: 'aguardando' as EnvioStatus
      }
    })

    // Abrir modal e iniciar processo
    setMensagensEnvio(mensagensParaEnviar)
    setMensagemAtualIndex(0)
    setContadorRegressivo(0)
    setEnviosConcluidos(false)
    setModalEnvioAberto(true)
    setEnviando(true)

    // Processar envios sequencialmente
    await processarEnviosEmLote(mensagensParaEnviar)
  }

  // Enviar mensagem única (sem modal)
  const enviarMensagemUnica = async () => {
    const id = Array.from(mensagensSelecionadas)[0]
    const mensagem = mensagens.find(m => m.id === id)
    if (!mensagem) return

    try {
      setEnviando(true)
      console.log(`📤 [WhatsApp] Enviando mensagem única: ${id}`)

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
        await supabase
          .from('tbwhatsapp_send')
          .update({
            status: 'enviado' as WhatsAppStatus,
            sent_at: new Date().toISOString(),
            processed_at: new Date().toISOString()
          })
          .eq('id', id)

        alert('✅ Mensagem enviada com sucesso!')
      } else {
        throw new Error(resultado.error || 'Erro desconhecido')
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar'
      console.error(`❌ [WhatsApp] Erro ao enviar:`, error)

      await supabase
        .from('tbwhatsapp_send')
        .update({
          status: 'falhou' as WhatsAppStatus,
          last_error: errorMessage,
          processed_at: new Date().toISOString()
        })
        .eq('id', id)

      alert(`❌ Erro ao enviar mensagem: ${errorMessage}`)
    } finally {
      setEnviando(false)
      setMensagensSelecionadas(new Set())
      await carregarMensagens()
    }
  }

  // Processar envios em lote com intervalo aleatório entre 10-45 segundos
  const processarEnviosEmLote = async (mensagensParaEnviar: MensagemEnvio[]) => {
    const timestampInicio = new Date().toISOString()
    console.log(`\n${'='.repeat(80)}`)
    console.log(`🚀 [WhatsApp] INICIANDO ENVIO EM LOTE`)
    console.log(`📅 Timestamp: ${timestampInicio}`)
    console.log(`📊 Total de mensagens: ${mensagensParaEnviar.length}`)
    console.log(`⏱️  Intervalo configurado: ${INTERVALO_MINIMO_SEGUNDOS}-${INTERVALO_MAXIMO_SEGUNDOS} segundos (aleatório)`)
    console.log(`🧪 Modo teste: ${modoTesteAtivo ? 'SIM (não envia de verdade)' : 'NÃO (envio real)'}`)
    console.log(`${'='.repeat(80)}\n`)

    // 🚨 RESETAR flags de controle no início
    cancelarEnvioRef.current = false
    processoPausadoRef.current = false
    setProcessoPausadoUI(false)

    let timestampUltimoEnvio: number | null = null

    for (let i = 0; i < mensagensParaEnviar.length; i++) {
      // 🛑 VERIFICAR CANCELAMENTO antes de processar cada mensagem
      if (cancelarEnvioRef.current) {
        console.log(`\n${'='.repeat(80)}`)
        console.log(`🛑 [WhatsApp] ENVIO CANCELADO PELO USUÁRIO`)
        console.log(`📊 Mensagens enviadas: ${i}/${mensagensParaEnviar.length}`)
        console.log(`📅 Timestamp cancelamento: ${new Date().toISOString()}`)
        console.log(`${'='.repeat(80)}\n`)

        // Marcar processo como concluído (mesmo que cancelado)
        setEnviosConcluidos(true)
        setEnviando(false)
        setMensagensSelecionadas(new Set())
        setModalCancelarAberto(false) // Fechar modal de confirmação
        setModalEnvioAberto(false) // Fechar modal de progresso

        // Recarregar mensagens após 2 segundos
        setTimeout(async () => {
          await carregarMensagens()
        }, 2000)

        return // Sair da função imediatamente
      }
      const mensagemEnvio = mensagensParaEnviar[i]
      setMensagemAtualIndex(i)

      // 🚨 VALIDAÇÃO DE SEGURANÇA: Verificar intervalo mínimo
      if (timestampUltimoEnvio !== null) {
        const tempoDecorrido = (Date.now() - timestampUltimoEnvio) / 1000
        if (tempoDecorrido < INTERVALO_MINIMO_SEGUNDOS) {
          const tempoRestante = INTERVALO_MINIMO_SEGUNDOS - tempoDecorrido
          console.warn(`⚠️  [SEGURANÇA] Intervalo insuficiente! Aguardando mais ${tempoRestante.toFixed(1)}s...`)
          await new Promise(resolve => setTimeout(resolve, tempoRestante * 1000))
        }
      }

      console.log(`\n--- Mensagem ${i + 1}/${mensagensParaEnviar.length} ---`)
      console.log(`📞 Número: ${mensagemEnvio.numero}`)
      console.log(`🆔 ID: ${mensagemEnvio.id}`)
      console.log(`⏰ Timestamp: ${new Date().toISOString()}`)

      // Atualizar status para "enviando"
      setMensagensEnvio(prev =>
        prev.map((m, idx) =>
          idx === i ? { ...m, status: 'enviando' as EnvioStatus } : m
        )
      )

      const mensagem = mensagens.find(m => m.id === mensagemEnvio.id)
      if (!mensagem) {
        console.error(`❌ [WhatsApp] Mensagem não encontrada no banco de dados`)
        setMensagensEnvio(prev =>
          prev.map((m, idx) =>
            idx === i ? { ...m, status: 'falhou' as EnvioStatus, errorMessage: 'Mensagem não encontrada' } : m
          )
        )
        continue
      }

      try {
        // Atualizar status no banco para "enviando"
        await supabase
          .from('tbwhatsapp_send')
          .update({
            status: 'enviando' as WhatsAppStatus,
            attempts: mensagem.attempts + 1
          })
          .eq('id', mensagemEnvio.id)

        // 🧪 MODO TESTE: Simular envio sem chamar API
        let resultado
        if (modoTesteAtivo) {
          console.log(`🧪 [MODO TESTE] Simulando envio (não chama API real)`)
          await new Promise(resolve => setTimeout(resolve, 500)) // Simula delay da API
          resultado = { success: true }
        } else {
          // Enviar via API Evolution (ENVIO REAL)
          console.log(`📤 [WhatsApp] Enviando via API Evolution...`)
          resultado = await sendWhatsAppMessage({
            phoneNumber: mensagem.numero,
            message: mensagem.message
          })
        }

        if (resultado.success) {
          // Sucesso: atualizar banco e estado
          await supabase
            .from('tbwhatsapp_send')
            .update({
              status: 'enviado' as WhatsAppStatus,
              sent_at: new Date().toISOString(),
              processed_at: new Date().toISOString()
            })
            .eq('id', mensagemEnvio.id)

          setMensagensEnvio(prev =>
            prev.map((m, idx) =>
              idx === i ? { ...m, status: 'enviado' as EnvioStatus } : m
            )
          )

          timestampUltimoEnvio = Date.now()
          console.log(`✅ [WhatsApp] Mensagem ${i + 1}/${mensagensParaEnviar.length} enviada com sucesso`)
          console.log(`⏰ Timestamp do envio: ${new Date(timestampUltimoEnvio).toISOString()}`)
        } else {
          throw new Error(resultado.error || 'Erro desconhecido')
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar'
        console.error(`❌ [WhatsApp] Erro ao enviar mensagem ${i + 1}:`, error)
        console.error(`📋 Detalhes do erro:`, errorMessage)

        // Falha: atualizar banco e estado
        await supabase
          .from('tbwhatsapp_send')
          .update({
            status: 'falhou' as WhatsAppStatus,
            last_error: errorMessage,
            processed_at: new Date().toISOString()
          })
          .eq('id', mensagemEnvio.id)

        setMensagensEnvio(prev =>
          prev.map((m, idx) =>
            idx === i ? {
              ...m,
              status: 'falhou' as EnvioStatus,
              errorMessage
            } : m
          )
        )
      }

      // Aguardar intervalo ALEATÓRIO antes da próxima mensagem (exceto na última)
      if (i < mensagensParaEnviar.length - 1) {
        // 🎲 GERAR INTERVALO ALEATÓRIO para cada mensagem
        const intervaloAleatorio = gerarIntervaloAleatorio(INTERVALO_MINIMO_SEGUNDOS, INTERVALO_MAXIMO_SEGUNDOS)

        console.log(`\n⏳ [WhatsApp] Aguardando ${intervaloAleatorio} segundos antes da próxima mensagem...`)
        console.log(`🎲 [WhatsApp] Intervalo randomizado entre ${INTERVALO_MINIMO_SEGUNDOS}-${INTERVALO_MAXIMO_SEGUNDOS}s`)
        console.log(`📊 Progresso: ${i + 1}/${mensagensParaEnviar.length} concluídas`)

        // Contador regressivo com intervalo ALEATÓRIO e suporte a PAUSA
        let segundosRestantes = intervaloAleatorio

        while (segundosRestantes > 0) {
          // 🛑 VERIFICAR CANCELAMENTO durante o contador regressivo
          if (cancelarEnvioRef.current) {
            console.log(`🛑 [WhatsApp] Cancelamento detectado durante contador regressivo`)
            setContadorRegressivo(0)
            break // Sair do loop do contador
          }

          // ⏸️ VERIFICAR PAUSA - Aguardar enquanto estiver pausado
          if (processoPausadoRef.current) {
            console.log(`⏸️  [WhatsApp] Processo PAUSADO - Aguardando decisão do usuário...`)
            console.log(`⏸️  [WhatsApp] Tempo restante salvo: ${segundosRestantes}s`)

            // POLLING: Verificar a cada 100ms se ainda está pausado
            while (processoPausadoRef.current && !cancelarEnvioRef.current) {
              await new Promise(resolve => setTimeout(resolve, 100))
            }

            // Se foi cancelado durante a pausa, sair
            if (cancelarEnvioRef.current) {
              console.log(`🛑 [WhatsApp] Cancelamento confirmado durante pausa`)
              setContadorRegressivo(0)
              break
            }

            // Se chegou aqui, foi retomado - continuar de onde parou
            console.log(`▶️  [WhatsApp] Processo RETOMADO - Continuando contador de ${segundosRestantes}s`)
          }

          setContadorRegressivo(segundosRestantes)
          console.log(`⏱️  [WhatsApp] Contador: ${segundosRestantes}s restantes (intervalo: ${intervaloAleatorio}s)`)
          await new Promise(resolve => setTimeout(resolve, 1000))
          segundosRestantes--
        }

        setContadorRegressivo(0)

        // Se foi cancelado, não logar conclusão do intervalo
        if (!cancelarEnvioRef.current) {
          console.log(`✅ [WhatsApp] Intervalo de ${intervaloAleatorio}s concluído. Próxima: ${i + 2}/${mensagensParaEnviar.length}`)
        }
      }
    }

    // Finalizar processo
    const timestampFim = new Date().toISOString()
    console.log(`\n${'='.repeat(80)}`)
    console.log(`🏁 [WhatsApp] ENVIO EM LOTE CONCLUÍDO`)
    console.log(`📅 Timestamp início: ${timestampInicio}`)
    console.log(`📅 Timestamp fim: ${timestampFim}`)
    console.log(`📊 Total processado: ${mensagensParaEnviar.length} mensagens`)
    console.log(`${'='.repeat(80)}\n`)

    setEnviosConcluidos(true)
    setEnviando(false)
    setMensagensSelecionadas(new Set())

    // Recarregar mensagens após 2 segundos
    setTimeout(async () => {
      await carregarMensagens()
    }, 2000)
  }

  // Fechar modal de envio
  const fecharModalEnvio = () => {
    setModalEnvioAberto(false)
    setMensagensEnvio([])
    setMensagemAtualIndex(0)
    setContadorRegressivo(0)
    setEnviosConcluidos(false)
    cancelarEnvioRef.current = false // Resetar flag de cancelamento
    processoPausadoRef.current = false // Resetar flag de pausa
    setProcessoPausadoUI(false)
  }

  // Solicitar cancelamento (abre modal de confirmação e PAUSA o processo)
  const solicitarCancelamento = () => {
    console.log('⏸️  [WhatsApp] Solicitação de cancelamento - PAUSANDO processo...')
    processoPausadoRef.current = true // 🔴 PAUSAR IMEDIATAMENTE
    setProcessoPausadoUI(true) // Atualizar UI
    setModalCancelarAberto(true)
  }

  // Confirmar cancelamento
  const confirmarCancelamento = () => {
    console.log('🛑 [WhatsApp] Usuário confirmou cancelamento - Processo será interrompido IMEDIATAMENTE')
    cancelarEnvioRef.current = true // 🔴 CANCELAR IMEDIATAMENTE
    processoPausadoRef.current = false // Despausar para permitir que o loop detecte o cancelamento
    setProcessoPausadoUI(false)
    setModalCancelarAberto(false)
    console.log('🛑 [WhatsApp] Flags atualizadas: cancelarEnvio=true, processoPausado=false')
  }

  // Cancelar o cancelamento (continuar enviando - RETOMAR processo)
  const cancelarCancelamento = () => {
    console.log('▶️  [WhatsApp] Usuário optou por continuar enviando - RETOMANDO processo...')
    processoPausadoRef.current = false // 🟢 RETOMAR processo
    setProcessoPausadoUI(false)
    setModalCancelarAberto(false)
  }

  // Alternar modo teste
  const alternarModoTeste = () => {
    const novoValor = !modoTesteAtivo
    setModoTesteAtivo(novoValor)
    setModoTeste(novoValor)
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

  // Badge de status com cores (seguindo padrão do ModalWhatsAppEnvio)
  const getStatusBadge = (status: WhatsAppStatus) => {
    const badges = {
      pendente: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      enviando: 'bg-sky-100 text-primary-700 border border-sky-300',
      enviado: 'bg-green-100 text-green-700 border border-green-200',
      falhou: 'bg-red-100 text-red-700 border border-red-200',
      cancelado: 'bg-slate-100 text-slate-700 border border-slate-200'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold transition-colors duration-300 ${badges[status]}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 p-4 sm:p-6">
      {/* Aviso de Modo Teste */}
      {modoTesteAtivo && (
        <div className="mb-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-3 sm:p-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                <span className="text-lg">🧪</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-800">
                MODO TESTE ATIVADO
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                As mensagens NÃO serão enviadas de verdade. Acesse as configurações para desativar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
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
            onClick={() => setModalConfigAberto(true)}
            className="flex items-center gap-2 hover:bg-slate-100 transition-colors"
            title="Configurações"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Config</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={carregarMensagens}
            disabled={loading}
            className="flex items-center gap-2 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
        </div>
      </div>

      {/* Card Principal */}
      <Card className="shadow-lg border-0">
        <CardHeader className="border-b bg-white/50 backdrop-blur p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Total de mensagens */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">
                Total: {totalItems} mensagem(ns)
              </span>
              {loading && <Loader2 className="w-4 h-4 animate-spin text-primary-600" />}
            </div>

            {/* Busca local */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 transition-all duration-300"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Erro */}
          {erro && (
            <div className="p-6 sm:p-12 text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
              <div>
                <p className="text-red-700 font-semibold">Erro ao carregar mensagens</p>
                <p className="text-sm text-slate-600 mt-1">{erro}</p>
              </div>
              <Button
                onClick={carregarMensagens}
                className="bg-primary-600 hover:bg-primary-700 text-white transition-colors duration-300"
              >
                Tentar novamente
              </Button>
            </div>
          )}

          {/* Loading inicial */}
          {loading && mensagens.length === 0 && !erro && (
            <div className="p-12 text-center space-y-3">
              <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto" />
              <p className="text-sm text-slate-600">Carregando mensagens...</p>
            </div>
          )}

          {/* Tabela de mensagens */}
          {!loading && !erro && mensagens.length > 0 && (
            <>
              {/* Barra de ações */}
              <div className="p-4 sm:p-6 border-b bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={mensagensSelecionadas.size === mensagensFiltradas.length && mensagensFiltradas.length > 0}
                    onCheckedChange={toggleSelecionarTodas}
                    id="select-all"
                  />
                  <label htmlFor="select-all" className="text-sm font-medium text-slate-700 cursor-pointer">
                    {mensagensSelecionadas.size === mensagensFiltradas.length && mensagensFiltradas.length > 0
                      ? 'Desselecionar todas'
                      : 'Selecionar todas'}
                  </label>
                  {mensagensSelecionadas.size > 0 && (
                    <span className="text-sm font-semibold text-primary-600">
                      ({mensagensSelecionadas.size} selecionada(s))
                    </span>
                  )}
                </div>

                <Button
                  onClick={enviarMensagensSelecionadas}
                  disabled={mensagensSelecionadas.size === 0 || enviando}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <th className="p-3 text-left text-xs font-semibold text-slate-700 uppercase w-12">
                        <span className="sr-only">Selecionar</span>
                      </th>
                      <th className="p-3 text-left text-xs font-semibold text-slate-700 uppercase">
                        Número
                      </th>
                      <th className="p-3 text-left text-xs font-semibold text-slate-700 uppercase hidden md:table-cell">
                        Mensagem
                      </th>
                      <th className="p-3 text-left text-xs font-semibold text-slate-700 uppercase">
                        Status
                      </th>
                      <th className="p-3 text-left text-xs font-semibold text-slate-700 uppercase hidden lg:table-cell">
                        Tentativas
                      </th>
                      <th className="p-3 text-left text-xs font-semibold text-slate-700 uppercase hidden lg:table-cell">
                        Data Criação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {mensagensFiltradas.map((mensagem) => (
                      <tr
                        key={mensagem.id}
                        className={`hover:bg-slate-50 transition-colors duration-300 ${
                          mensagensSelecionadas.has(mensagem.id) ? 'bg-sky-50 border-l-4 border-l-primary-600' : ''
                        }`}
                      >
                        <td className="p-3">
                          <Checkbox
                            checked={mensagensSelecionadas.has(mensagem.id)}
                            onCheckedChange={() => toggleSelecionarMensagem(mensagem.id)}
                          />
                        </td>
                        <td className="p-3 text-sm font-mono font-medium text-slate-900">
                          {mensagem.numero}
                        </td>
                        <td className="p-3 text-sm text-slate-700 hidden md:table-cell max-w-xs truncate">
                          {mensagem.message}
                        </td>
                        <td className="p-3">
                          {getStatusBadge(mensagem.status)}
                        </td>
                        <td className="p-3 text-sm text-slate-600 hidden lg:table-cell">
                          <span className="font-medium">{mensagem.attempts}</span> / {mensagem.max_attempts}
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
              <div className="p-4 sm:p-6 border-t bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-medium">Itens por página:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-primary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-300"
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
                    className="transition-colors duration-300 disabled:opacity-50"
                  >
                    Anterior
                  </Button>
                  <span className="text-sm font-medium text-slate-700 px-2">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="transition-colors duration-300 disabled:opacity-50"
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Sem mensagens */}
          {!loading && !erro && mensagens.length === 0 && (
            <div className="p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                <Send className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600">Nenhuma mensagem encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Configurações */}
      {modalConfigAberto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 space-y-4 sm:space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Settings className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Configurações</h2>
              <p className="text-sm text-slate-600">
                Ajustes de envio de mensagens
              </p>
            </div>

            {/* Modo Teste */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    🧪 Modo Teste
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Quando ativado, simula o envio sem chamar a API real do WhatsApp
                  </p>
                </div>
                <button
                  onClick={alternarModoTeste}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300
                    ${modoTesteAtivo ? 'bg-green-600' : 'bg-slate-300'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
                      ${modoTesteAtivo ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              {/* Status atual */}
              <div className={`
                rounded-lg p-3 text-sm font-semibold text-center transition-all duration-300
                ${modoTesteAtivo
                  ? 'bg-green-100 text-green-800 border-2 border-green-300'
                  : 'bg-sky-100 text-primary-700 border-2 border-sky-300'
                }
              `}>
                {modoTesteAtivo ? (
                  <>
                    ✅ MODO TESTE ATIVO
                    <br />
                    <span className="text-xs font-normal">
                      Mensagens NÃO serão enviadas de verdade
                    </span>
                  </>
                ) : (
                  <>
                    🚀 MODO PRODUÇÃO ATIVO
                    <br />
                    <span className="text-xs font-normal">
                      Mensagens serão enviadas via API real
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Informações de Segurança */}
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 text-sm mb-2 flex items-center gap-2">
                ⚠️ Informações Importantes
              </h4>
              <ul className="text-xs text-yellow-800 space-y-1.5">
                <li>• Intervalo aleatório de {INTERVALO_MINIMO_SEGUNDOS}-{INTERVALO_MAXIMO_SEGUNDOS} segundos entre envios</li>
                <li>• Use o modo teste antes de enviar em produção</li>
                <li>• Evite enviar mais de 50 mensagens por vez</li>
                <li>• A configuração é salva automaticamente</li>
              </ul>
            </div>

            {/* Botão Fechar */}
            <Button
              onClick={() => setModalConfigAberto(false)}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white transition-colors duration-300"
              size="lg"
            >
              Fechar
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Envio em Lote */}
      <ModalWhatsAppEnvio
        open={modalEnvioAberto}
        mensagens={mensagensEnvio}
        mensagemAtualIndex={mensagemAtualIndex}
        contadorRegressivo={contadorRegressivo}
        concluido={enviosConcluidos}
        pausado={processoPausadoUI}
        onClose={fecharModalEnvio}
        onCancelar={solicitarCancelamento}
        modoTeste={modoTesteAtivo}
      />

      {/* Modal de Confirmação de Cancelamento - Renderizado via Portal */}
      {modalCancelarAberto && createPortal(
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 pointer-events-auto"
          onClick={(e) => {
            // Fecha o modal se clicar no backdrop
            if (e.target === e.currentTarget) {
              cancelarCancelamento()
            }
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 space-y-4 sm:space-y-6 animate-in fade-in duration-300 relative z-[10000] pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Cancelar Envio?
              </h2>
              <p className="text-sm text-slate-600">
                Tem certeza que deseja cancelar o envio de mensagens?
              </p>
            </div>

            {/* Aviso */}
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ O processo será interrompido <strong>imediatamente</strong>.
              </p>
              <p className="text-xs text-yellow-700 mt-2">
                As mensagens já enviadas não serão afetadas, mas as mensagens restantes não serão enviadas.
              </p>
            </div>

            {/* Estatísticas */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {mensagensEnvio.filter(m => m.status === 'enviado').length}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Já enviadas
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-600">
                    {mensagensEnvio.filter(m => m.status === 'aguardando').length}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Restantes
                  </div>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button
                onClick={cancelarCancelamento}
                variant="outline"
                className="flex-1 border-2 hover:bg-slate-50 transition-colors duration-300 relative z-[10001]"
                size="lg"
              >
                Não, continuar enviando
              </Button>
              <Button
                onClick={confirmarCancelamento}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white transition-colors duration-300 relative z-[10001]"
                size="lg"
              >
                Sim, cancelar envio
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

