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
  /** Indica se o processo está pausado (aguardando confirmação de cancelamento) */
  pausado: boolean
  /** Callback para fechar o modal (só funciona quando concluído) */
  onClose: () => void
  /** Callback para solicitar cancelamento do envio */
  onCancelar: () => void
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
  pausado,
  onClose,
  onCancelar,
  modoTeste = false
}: ModalWhatsAppEnvioProps) {
  // Calcular estatísticas
  const totalMensagens = mensagens.length
  const mensagensEnviadas = mensagens.filter(m => m.status === 'enviado').length
  const mensagensFalhas = mensagens.filter(m => m.status === 'falhou').length
  const progresso = totalMensagens > 0 ? Math.round((mensagensEnviadas / totalMensagens) * 100) : 0

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
        className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
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
        <Card className="border-0 shadow-none flex flex-col overflow-hidden h-full">
          <CardContent className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 overflow-hidden h-full">
            {/* Grid de Duas Colunas - Mobile: coluna única, Desktop: 50/50 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 flex-1 overflow-hidden min-h-0">

              {/* COLUNA ESQUERDA - Controles e Informações */}
              <div className="flex flex-col gap-4 overflow-y-auto pr-2">

                {/* Cabeçalho - Fixo (sem scroll) */}
                <div className="flex-shrink-0 text-center space-y-2">
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

            {/* Barra de Progresso Linear - Fixo (sem scroll) */}
            <div className="flex-shrink-0 space-y-2">
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

            {/* Banner de Pausado - Aparece quando o processo está pausado */}
            {pausado && (
              <div className="flex-shrink-0 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-lg p-4 animate-pulse">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
                    <span className="text-2xl">⏸️</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-yellow-900">
                      Processo Pausado
                    </p>
                    <p className="text-xs text-yellow-800">
                      Aguardando sua decisão...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Contador Regressivo - Fixo (sem scroll) */}
            {mostrarContador && !pausado && (
              <div className="flex-shrink-0 bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-300 rounded-lg p-4 text-center shadow-sm">
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

            {/* Botão Cancelar - Visível apenas durante o envio (não concluído) */}
            {!concluido && (
              <div className="flex-shrink-0">
                <Button
                  onClick={onCancelar}
                  variant="outline"
                  className="w-full border-2 border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 transition-all duration-300"
                  size="lg"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar Envio
                </Button>
              </div>
            )}

              </div>
              {/* FIM COLUNA ESQUERDA */}

              {/* COLUNA DIREITA - Lista de Contatos */}
              <div className="flex flex-col gap-4 overflow-y-auto pr-2 min-h-0">
                <div className="flex-shrink-0 border-b pb-2 mb-2">
                  <h3 className="text-lg font-semibold text-slate-700 text-center">
                    Lista de Contatos
                  </h3>
                </div>

            {/* Lista de Mensagens - COM SCROLL (área scrollável) */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-2 min-h-0 flex flex-col items-center px-4">
              {mensagens.map((mensagem, index) => {
                return (
                  <div
                    key={mensagem.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg transition-all duration-300 border w-full max-w-sm",
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

              </div>
              {/* FIM COLUNA DIREITA */}

            </div>
            {/* FIM DO GRID DE DUAS COLUNAS */}

            {/* Resumo Final (quando concluído) - Full-width embaixo das colunas */}
            {concluido && (
              <div className="flex-shrink-0 space-y-3 pt-2 border-t">
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

