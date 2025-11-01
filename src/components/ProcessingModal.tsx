import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Status de cada etapa do processo
 */
export type StepStatus = 'pending' | 'processing' | 'completed' | 'error'

/**
 * Interface para definir uma etapa do processo
 */
export interface ProcessStep {
  id: string
  label: string
  status: StepStatus
  errorMessage?: string
}

/**
 * Props do componente ProcessingModal
 */
interface ProcessingModalProps {
  /** Controla se o modal está aberto */
  open: boolean
  /** Título do modal */
  title?: string
  /** Mensagem de estimativa de tempo */
  estimatedTime?: string
  /** Lista de etapas do processo */
  steps: ProcessStep[]
  /** Progresso atual (0-100) */
  progress?: number
}

/**
 * Modal de progresso que exibe as etapas sendo executadas em tempo real
 * 
 * Features:
 * - Responsivo (mobile-first)
 * - Impossível de fechar durante processamento
 * - Animações suaves
 * - Indicadores visuais para cada etapa (loading, success, error)
 * - Barra de progresso linear
 */
export function ProcessingModal({
  open,
  title = "Processando sua inscrição",
  estimatedTime = "Aguarde aproximadamente 10 segundos...",
  steps,
  progress = 0
}: ProcessingModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md sm:max-w-lg"
        onInteractOutside={(e) => {
          // Previne o fechamento ao clicar fora do modal
          e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          // Previne o fechamento ao pressionar ESC
          e.preventDefault()
        }}
        hideCloseButton={true}
      >
        <Card className="border-0 shadow-none">
          <CardContent className="p-6 space-y-6">
            {/* Cabeçalho */}
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {title}
              </h2>
              <p className="text-sm text-slate-600">
                {estimatedTime}
              </p>
            </div>

            {/* Barra de Progresso Linear */}
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Lista de Etapas */}
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg transition-all duration-300",
                    step.status === 'processing' && "bg-sky-50 border border-sky-200",
                    step.status === 'completed' && "bg-green-50 border border-green-200",
                    step.status === 'error' && "bg-red-50 border border-red-200",
                    step.status === 'pending' && "bg-slate-50 border border-slate-200"
                  )}
                >
                  {/* Ícone de Status */}
                  <div className="flex-shrink-0 mt-0.5">
                    {step.status === 'pending' && (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white" />
                    )}
                    {step.status === 'processing' && (
                      <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                    )}
                    {step.status === 'completed' && (
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                    {step.status === 'error' && (
                      <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                    )}
                  </div>

                  {/* Label e Mensagem de Erro */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium transition-colors duration-300",
                        step.status === 'pending' && "text-slate-500",
                        step.status === 'processing' && "text-primary-700",
                        step.status === 'completed' && "text-green-700",
                        step.status === 'error' && "text-red-700"
                      )}
                    >
                      {step.label}
                    </p>
                    {step.status === 'error' && step.errorMessage && (
                      <p className="text-xs text-red-600 mt-1">
                        {step.errorMessage}
                      </p>
                    )}
                  </div>

                  {/* Número da Etapa */}
                  <div className="flex-shrink-0">
                    <span
                      className={cn(
                        "text-xs font-semibold px-2 py-1 rounded-full transition-colors duration-300",
                        step.status === 'pending' && "bg-slate-200 text-slate-600",
                        step.status === 'processing' && "bg-primary-100 text-primary-700",
                        step.status === 'completed' && "bg-green-100 text-green-700",
                        step.status === 'error' && "bg-red-100 text-red-700"
                      )}
                    >
                      {index + 1}/{steps.length}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Mensagem de Rodapé */}
            <div className="text-center">
              <p className="text-xs text-slate-500">
                Por favor, não feche esta janela durante o processamento
              </p>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}

