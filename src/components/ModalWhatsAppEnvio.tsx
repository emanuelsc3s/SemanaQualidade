/**
 * Modal de Envio em Lote de Mensagens WhatsApp
 * 
 * Funcionalidades:
 * - Envio sequencial com intervalo de 15 segundos entre mensagens
 * - Contador regressivo em tempo real
 * - Progresso visual (X/Y mensagens)
 * - Impossível fechar durante o processamento
 * - Design responsivo mobile-first
 * - Feedback visual de sucesso/erro por mensagem
 */

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Loader2, X, Clock, Send, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Status de envio de cada mensagem
 */
export type EnvioStatus = 'aguardando' | 'enviando' | 'enviado' | 'falhou'

/**
 * Interface para cada mensagem no processo de envio
 */
export interface MensagemEnvio {
  id: string
  numero: string
  status: EnvioStatus
  errorMessage?: string
}

/**
 * Props do componente ModalWhatsAppEnvio
 */
interface ModalWhatsAppEnvioProps {
  /** Controla se o modal está aberto */
  open: boolean
  /** Lista de mensagens a serem enviadas */
  mensagens: MensagemEnvio[]
  /** Índice da mensagem atual sendo enviada (0-based) */
  mensagemAtualIndex: number
  /** Contador regressivo em segundos até o próximo envio */
  contadorRegressivo: number
  /** Indica se o processo foi concluído */
  concluido: boolean
  /** Callback para fechar o modal (só funciona quando concluído) */
  onClose: () => void
  /** Modo teste ativado (opcional) */
  modoTeste?: boolean
}

/**
 * Modal de envio em lote de mensagens WhatsApp
 * 
 * Features:
 * - Responsivo (mobile-first)
 * - Impossível de fechar durante processamento
 * - Contador regressivo de 15 segundos
 * - Progresso visual (X/Y)
 * - Animações suaves
 * - Indicadores visuais para cada mensagem
 */
export function ModalWhatsAppEnvio({
  open,
  mensagens,
  mensagemAtualIndex,
  contadorRegressivo,
  concluido,
  onClose,
  modoTeste = false
}: ModalWhatsAppEnvioProps) {
  // Calcular estatísticas
  const totalMensagens = mensagens.length
  const mensagensEnviadas = mensagens.filter(m => m.status === 'enviado').length
  const mensagensFalhas = mensagens.filter(m => m.status === 'falhou').length
  const progresso = totalMensagens > 0 ? Math.round((mensagensEnviadas / totalMensagens) * 100) : 0

  // Mensagem atual
  const mensagemAtual = mensagens[mensagemAtualIndex]

  // CORREÇÃO: O contador deve aparecer quando:
  // 1. Não está concluído
  // 2. Há um contador regressivo ativo (> 0)
  // 3. A mensagem atual já foi enviada (status 'enviado' ou 'falhou')
  // Isso significa que estamos no intervalo de espera entre mensagens
  const mostrarContador = !concluido && contadorRegressivo > 0

  // Debug log
  if (contadorRegressivo > 0) {
    console.log(`🔍 [Modal] Contador: ${contadorRegressivo}s | Concluído: ${concluido} | Mostrar: ${mostrarContador}`)
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        // Só permite fechar se o processo estiver concluído
        if (!isOpen && concluido) {
          onClose()
        }
      }}
    >
      <DialogContent
        className="max-w-md sm:max-w-lg"
        onInteractOutside={(e) => {
          // Previne o fechamento ao clicar fora se não estiver concluído
          if (!concluido) {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={(e) => {
          // Previne o fechamento ao pressionar ESC se não estiver concluído
          if (!concluido) {
            e.preventDefault()
          }
        }}
        hideCloseButton={!concluido}
      >
        <Card className="border-0 shadow-none">
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Cabeçalho */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                {concluido ? (
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                ) : (
                  <Send className="w-8 h-8 text-primary-600" />
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {concluido ? 'Envio Concluído!' : 'Enviando Mensagens'}
              </h2>
              <p className="text-sm text-slate-600">
                {concluido
                  ? `${mensagensEnviadas} de ${totalMensagens} mensagens enviadas com sucesso`
                  : 'Aguarde enquanto as mensagens são enviadas...'
                }
              </p>

              {/* Aviso de Modo Teste */}
              {modoTeste && !concluido && (
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-3 mt-3">
                  <p className="text-sm font-semibold text-yellow-800">
                    🧪 MODO TESTE ATIVADO
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    As mensagens NÃO serão enviadas de verdade
                  </p>
                </div>
              )}
            </div>

            {/* Barra de Progresso Linear */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">
                  Progresso: {mensagensEnviadas}/{totalMensagens}
                </span>
                <span className="font-semibold text-primary-600">
                  {progresso}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-full transition-all duration-500 ease-out"
                  style={{ width: `${progresso}%` }}
                />
              </div>
            </div>

            {/* Contador Regressivo */}
            {mostrarContador && (
              <div className="bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-300 rounded-lg p-4 text-center shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Clock className="w-6 h-6 text-sky-600" />
                  <span className="text-sm font-semibold text-sky-800">
                    Próximo envio em:
                  </span>
                </div>
                <div className="text-4xl sm:text-5xl font-bold text-sky-600 tabular-nums mb-2">
                  {contadorRegressivo}s
                </div>
                <div className="text-xs text-sky-700 space-y-1">
                  <p>✅ Mensagem {mensagemAtualIndex + 1} enviada</p>
                  <p>⏳ Aguardando para enviar mensagem {mensagemAtualIndex + 2}</p>
                </div>
              </div>
            )}

            {/* Lista de Mensagens */}
            <div className="space-y-2 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2">
              {mensagens.map((mensagem, index) => {
                const isAtual = index === mensagemAtualIndex
                
                return (
                  <div
                    key={mensagem.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg transition-all duration-300 border",
                      mensagem.status === 'aguardando' && "bg-slate-50 border-slate-200",
                      mensagem.status === 'enviando' && "bg-sky-50 border-sky-300 shadow-sm",
                      mensagem.status === 'enviado' && "bg-green-50 border-green-200",
                      mensagem.status === 'falhou' && "bg-red-50 border-red-200"
                    )}
                  >
                    {/* Ícone de Status */}
                    <div className="flex-shrink-0 mt-0.5">
                      {mensagem.status === 'aguardando' && (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white" />
                      )}
                      {mensagem.status === 'enviando' && (
                        <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                      )}
                      {mensagem.status === 'enviado' && (
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                      {mensagem.status === 'falhou' && (
                        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                          <X className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    {/* Informações da Mensagem */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium transition-colors duration-300 truncate",
                          mensagem.status === 'aguardando' && "text-slate-500",
                          mensagem.status === 'enviando' && "text-primary-700",
                          mensagem.status === 'enviado' && "text-green-700",
                          mensagem.status === 'falhou' && "text-red-700"
                        )}
                      >
                        {mensagem.numero}
                      </p>
                      {mensagem.status === 'falhou' && mensagem.errorMessage && (
                        <p className="text-xs text-red-600 mt-1 truncate">
                          {mensagem.errorMessage}
                        </p>
                      )}
                      {mensagem.status === 'enviando' && (
                        <p className="text-xs text-primary-600 mt-1">
                          Enviando agora...
                        </p>
                      )}
                    </div>

                    {/* Número da Mensagem */}
                    <div className="flex-shrink-0">
                      <span
                        className={cn(
                          "text-xs font-semibold px-2 py-1 rounded-full transition-colors duration-300",
                          mensagem.status === 'aguardando' && "bg-slate-200 text-slate-600",
                          mensagem.status === 'enviando' && "bg-primary-100 text-primary-700",
                          mensagem.status === 'enviado' && "bg-green-100 text-green-700",
                          mensagem.status === 'falhou' && "bg-red-100 text-red-700"
                        )}
                      >
                        {index + 1}/{totalMensagens}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Resumo Final (quando concluído) */}
            {concluido && (
              <div className="space-y-3 pt-2 border-t">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">
                      {mensagensEnviadas}
                    </div>
                    <div className="text-xs text-green-700 mt-1">
                      Enviadas
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-2xl font-bold text-red-600">
                      {mensagensFalhas}
                    </div>
                    <div className="text-xs text-red-700 mt-1">
                      Falhas
                    </div>
                  </div>
                </div>

                <Button
                  onClick={onClose}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                >
                  Fechar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}

