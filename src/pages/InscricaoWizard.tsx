import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ArrowLeft, ArrowRight, Check, User, Trophy, Shirt, Gift, FileText, Volume2, VolumeX, X } from "lucide-react"
import Confetti from "react-confetti"
import { useWindowSize } from "@/hooks/useWindowSize"
import { sendWhatsAppMessage, gerarMensagemConfirmacao } from "@/services/whatsappService"

// Interface para os dados do formulário
interface FormData {
  // Etapa 1: Dados Cadastrais
  nome: string
  email: string
  cpf: string
  dataNascimento: string
  whatsapp: string
  
  // Etapa 2: Categoria
  categoria: string
  
  // Etapa 3: Tamanho da Camiseta
  tamanho: string
  
  // Etapa 4: Evento de Natal
  participarNatal: string
  
  // Etapa 5: Regulamento
  aceitouRegulamento: boolean
}

export default function InscricaoWizard() {
  const navigate = useNavigate()
  const { width, height } = useWindowSize()

  const [currentStep, setCurrentStep] = useState(1)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [whatsappSent, setWhatsappSent] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const hasUnmutedRef = useRef(false)

  const [formData, setFormData] = useState<FormData>({
    nome: "",
    email: "",
    cpf: "",
    dataNascimento: "",
    whatsapp: "",
    categoria: "",
    tamanho: "",
    participarNatal: "",
    aceitouRegulamento: false
  })

  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100

  // Ativa som do áudio automaticamente após primeira interação do usuário
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasUnmutedRef.current && audioRef.current) {
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.muted = false
            setIsMuted(false)
            hasUnmutedRef.current = true
          }
        }, 2000)
        // Remove listeners após primeira execução
        document.removeEventListener('click', handleFirstInteraction)
        document.removeEventListener('touchstart', handleFirstInteraction)
        document.removeEventListener('keydown', handleFirstInteraction)
      }
    }

    document.addEventListener('click', handleFirstInteraction)
    document.addEventListener('touchstart', handleFirstInteraction)
    document.addEventListener('keydown', handleFirstInteraction)

    return () => {
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('touchstart', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [])

  // Validação de cada etapa
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.nome && formData.email && formData.cpf && formData.dataNascimento && formData.whatsapp)
      case 2:
        return !!formData.categoria
      case 3:
        return !!formData.tamanho
      case 4:
        return !!formData.participarNatal
      case 5:
        return formData.aceitouRegulamento
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async () => {
    if (validateStep(5)) {
      setIsSubmitting(true)

      try {
        // Salvar no localStorage
        const inscricoes = JSON.parse(localStorage.getItem('inscricoes') || '[]')
        const numeroParticipante = (inscricoes.length + 1).toString().padStart(4, '0')

        const novaInscricao = {
          ...formData,
          id: Date.now(),
          dataInscricao: new Date().toISOString(),
          numeroParticipante
        }

        inscricoes.push(novaInscricao)
        localStorage.setItem('inscricoes', JSON.stringify(inscricoes))

        // Enviar mensagem de confirmação via WhatsApp
        console.log('Enviando mensagem de confirmação via WhatsApp...')

        const mensagem = gerarMensagemConfirmacao(
          formData.nome,
          numeroParticipante,
          formData.categoria
        )

        const resultado = await sendWhatsAppMessage({
          phoneNumber: formData.whatsapp,
          message: mensagem
        })

        if (resultado.success) {
          console.log('✅ Mensagem WhatsApp enviada com sucesso!')
          setWhatsappSent(true)
        } else {
          console.error('❌ Erro ao enviar mensagem WhatsApp:', resultado.error)
          // Mesmo com erro no WhatsApp, continua o fluxo
          setWhatsappSent(false)
        }

      } catch (error) {
        console.error('Erro ao processar inscrição:', error)
        // Mesmo com erro, mostra o modal de sucesso
      } finally {
        setIsSubmitting(false)

        // Mostrar confetes e modal
        setShowConfetti(true)
        setShowSuccessModal(true)
      }
    }
  }

  const handleCloseSuccess = () => {
    setShowConfetti(false)
    setShowSuccessModal(false)
    navigate('/')
  }

  const handleCancelInscricao = () => {
    setShowCancelModal(true)
  }

  const handleConfirmCancel = () => {
    setShowCancelModal(false)
    navigate('/')
  }

  // Máscaras de formatação
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14)
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').slice(0, 15)
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50">
      {/* Background Music - Áudio do vídeo 0104.mp4 */}
      <audio
        ref={audioRef}
        autoPlay
        loop
        muted={isMuted}
        className="hidden"
      >
        <source src="/0104.mp4" type="audio/mp4" />
        Seu navegador não suporta áudio HTML5.
      </audio>

      {/* Botão de Controle de Som Flutuante */}
      <button
        onClick={() => {
          if (audioRef.current) {
            audioRef.current.muted = !isMuted
            setIsMuted(!isMuted)
          }
        }}
        className="fixed bottom-6 right-6 z-50 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 transform hover:scale-110 border-2 border-white/20 backdrop-blur-sm"
        aria-label={isMuted ? "Ativar som" : "Desativar som"}
      >
        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6 animate-pulse" />}
      </button>

      {/* Confetes */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      {/* Header com Hero Background */}
      <div className="relative text-white py-4 md:py-6 shadow-lg sticky top-0 z-40 overflow-hidden">
        {/* Imagem de fundo do Hero */}
        <img
          src="/HeroCorridaFarmace.png"
          alt="II Corrida FARMACE - 2025.2"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Overlay escuro para legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40"></div>

        {/* Conteúdo do Header */}
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/20 mb-3 md:mb-4 text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="text-center mb-3 md:mb-4">
            <h1 className="text-xl md:text-3xl font-bold mb-1 md:mb-2 drop-shadow-lg">Inscrição - Etapa {currentStep} de {totalSteps}</h1>
            <p className="text-white/90 text-sm md:text-base drop-shadow-md">II Corrida e Caminhada da Qualidade FARMACE</p>
          </div>

          <div className="space-y-2">
            <Progress value={progress} className="h-2 md:h-3 bg-white/20" />
            <p className="text-center text-xs md:text-sm text-white/80">{Math.round(progress)}% concluído</p>
          </div>
        </div>
      </div>

      {/* Conteúdo do Wizard */}
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        {/* Etapa 1: Confirmação de Dados Cadastrais */}
        {currentStep === 1 && (
          <StepDadosCadastrais
            formData={formData}
            onInputChange={handleInputChange}
            formatCPF={formatCPF}
            formatPhone={formatPhone}
          />
        )}

        {/* Etapa 2: Escolha da Categoria */}
        {currentStep === 2 && (
          <StepCategoria
            categoria={formData.categoria}
            onCategoriaChange={(value) => handleInputChange('categoria', value)}
          />
        )}

        {/* Etapa 3: Tamanho da Camiseta */}
        {currentStep === 3 && (
          <StepTamanhoCamiseta
            tamanho={formData.tamanho}
            onTamanhoChange={(value) => handleInputChange('tamanho', value)}
          />
        )}

        {/* Etapa 4: Evento de Natal */}
        {currentStep === 4 && (
          <StepEventoNatal
            participarNatal={formData.participarNatal}
            onParticipacaoChange={(value) => handleInputChange('participarNatal', value)}
          />
        )}

        {/* Etapa 5: Regulamento */}
        {currentStep === 5 && (
          <StepRegulamento
            aceitouRegulamento={formData.aceitouRegulamento}
            onAceiteChange={(value) => handleInputChange('aceitouRegulamento', value)}
          />
        )}

        {/* Botões de Navegação */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-6 md:mt-8">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="w-full sm:w-auto order-3 sm:order-1 h-11 md:h-12 text-sm md:text-base border-2 border-slate-300 text-slate-700 hover:border-primary-500 hover:text-primary-700 hover:bg-primary-50/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          )}

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!validateStep(currentStep)}
              className="w-full sm:flex-1 order-1 sm:order-2 bg-primary-600 hover:bg-primary-700 h-11 md:h-12 text-sm md:text-base font-semibold text-white"
            >
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!validateStep(5) || isSubmitting}
              className="w-full sm:flex-1 order-1 sm:order-2 bg-green-600 hover:bg-green-700 h-11 md:h-12 text-sm md:text-base font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Processando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar Inscrição
                </>
              )}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleCancelInscricao}
            className="w-full sm:w-auto order-2 sm:order-3 h-11 md:h-12 text-sm md:text-base border-2 border-red-300 text-red-700 hover:border-red-500 hover:text-red-800 hover:bg-red-50/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar Inscrição
          </Button>
        </div>
      </div>

      {/* Modal de Sucesso - Formato Recibo */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Cabeçalho do Recibo */}
          <div className="text-center border-b-2 border-dashed border-slate-300 pb-3 mb-3">
            <div className="mx-auto w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-lg sm:text-xl font-bold text-green-600 mb-1">
              Inscrição Realizada!
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Comprovante de Inscrição
            </DialogDescription>
          </div>

          {/* Corpo do Recibo */}
          <div className="space-y-2.5 py-1">
            {/* Status */}
            <div className="bg-amber-50 border-l-4 border-amber-400 p-2.5 rounded">
              <div className="flex items-center gap-2">
                <span className="text-lg">⏳</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-amber-800">Status: Aguardando Revisão</p>
                  <p className="text-xs text-amber-600">Em breve você receberá a confirmação</p>
                </div>
              </div>
            </div>

            {/* Número do Participante */}
            <div className="bg-gradient-to-r from-primary-50 to-sky-50 border border-primary-200 rounded-lg p-2.5">
              <p className="text-xs text-slate-600 mb-0.5">Número do Participante</p>
              <p className="text-xl sm:text-2xl font-bold text-primary-700 tracking-wider">
                #{(JSON.parse(localStorage.getItem('inscricoes') || '[]').length).toString().padStart(4, '0')}
              </p>
            </div>

            {/* Dados do Inscrito */}
            <div className="space-y-2 text-sm">
              <div className="border-b border-slate-200 pb-1.5">
                <p className="text-xs text-slate-500">Nome</p>
                <p className="font-semibold text-slate-800 text-sm">{formData.nome}</p>
              </div>

              <div className="border-b border-slate-200 pb-1.5">
                <p className="text-xs text-slate-500">E-mail</p>
                <p className="font-medium text-slate-700 break-all text-xs">{formData.email}</p>
              </div>

              {/* WhatsApp, Categoria, Camiseta e Evento de Natal em 4 colunas */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <p className="text-xs text-slate-500">WhatsApp</p>
                  <p className="font-medium text-slate-700 text-xs">{formData.whatsapp}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Categoria</p>
                  <p className="font-semibold text-primary-700 uppercase text-xs">{formData.categoria}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Camiseta</p>
                  <p className="font-semibold text-primary-700 text-xs">{formData.tamanho}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Evento Natal</p>
                  <p className="font-medium text-slate-700 text-xs">
                    {formData.participarNatal === 'sim' ? '🎄 Sim' : '🚫 Não'}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-1.5">
                <p className="text-xs text-slate-500">Data da Inscrição</p>
                <p className="font-medium text-slate-700 text-xs">{new Date().toLocaleString('pt-BR')}</p>
              </div>
            </div>

            {/* Aviso WhatsApp */}
            {whatsappSent ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2.5">
                <div className="flex items-start gap-2">
                  <span className="text-base">✅</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-green-800 mb-0.5">
                      Mensagem enviada para seu WhatsApp!
                    </p>
                    <p className="text-xs text-green-600">
                      Você receberá atualizações sobre sua inscrição via WhatsApp.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                <div className="flex items-start gap-2">
                  <span className="text-base">📱</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-blue-800 mb-0.5">
                      Fique atento ao seu WhatsApp!
                    </p>
                    <p className="text-xs text-blue-600">
                      Você será notificado assim que sua inscrição for confirmada pela organização.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rodapé do Recibo */}
          <div className="border-t-2 border-dashed border-slate-300 pt-3 mt-3">
            <p className="text-center text-xs text-slate-400 mb-2">
              II Corrida FARMACE - 2025.2
            </p>
            <Button
              onClick={handleCloseSuccess}
              className="w-full bg-primary-600 hover:bg-primary-700 h-10 font-semibold text-sm text-white"
            >
              Voltar para a Página Inicial
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Cancelamento */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <X className="w-10 h-10 text-red-600" />
            </div>
            <DialogTitle className="text-2xl text-center text-red-600">
              Cancelar Inscrição?
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              Tem certeza que deseja cancelar sua inscrição?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-center text-slate-600">
              Todos os dados preenchidos serão perdidos e você será redirecionado para a página inicial.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCancelModal(false)}
                className="w-full sm:flex-1 border-2 border-slate-300 hover:border-slate-400"
              >
                Continuar Inscrição
              </Button>
              <Button
                onClick={handleConfirmCancel}
                className="w-full sm:flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Sim, Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================
// COMPONENTES DAS ETAPAS
// ============================================

// Etapa 1: Dados Cadastrais
interface StepDadosCadastraisProps {
  formData: FormData
  onInputChange: (field: keyof FormData, value: string | boolean) => void
  formatCPF: (value: string) => string
  formatPhone: (value: string) => string
}

function StepDadosCadastrais({ formData, onInputChange, formatCPF, formatPhone }: StepDadosCadastraisProps) {
  return (
    <Card className="shadow-xl border-2 border-primary-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="bg-gradient-to-r from-primary-50 to-sky-50 border-b border-primary-100">
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl text-slate-800">
          <User className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
          Confirmação de Dados Cadastrais
        </CardTitle>
        <CardDescription className="text-sm md:text-base">
          Confirme seus dados e adicione seu WhatsApp para receber a confirmação
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4 md:space-y-5">
        <div className="grid gap-4 md:gap-5">
          <div>
            <Label htmlFor="nome" className="text-sm md:text-base font-medium text-slate-700">
              Nome Completo *
            </Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => onInputChange('nome', e.target.value)}
              placeholder="Seu nome completo"
              className="mt-1.5 h-12 text-sm md:text-base border-slate-300 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
            <div>
              <Label htmlFor="email" className="text-sm md:text-base font-medium text-slate-700">
                E-mail *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => onInputChange('email', e.target.value)}
                placeholder="seu@email.com"
                className="mt-1.5 h-12 text-sm md:text-base border-slate-300 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <Label htmlFor="cpf" className="text-sm md:text-base font-medium text-slate-700">
                CPF *
              </Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => onInputChange('cpf', formatCPF(e.target.value))}
                placeholder="000.000.000-00"
                className="mt-1.5 h-12 text-sm md:text-base border-slate-300 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
            <div>
              <Label htmlFor="dataNascimento" className="text-sm md:text-base font-medium text-slate-700">
                Data de Nascimento *
              </Label>
              <Input
                id="dataNascimento"
                type="date"
                value={formData.dataNascimento}
                onChange={(e) => onInputChange('dataNascimento', e.target.value)}
                className="mt-1.5 h-12 text-sm md:text-base border-slate-300 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <Label htmlFor="whatsapp" className="text-sm md:text-base font-medium text-slate-700">
                WhatsApp *
              </Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => onInputChange('whatsapp', formatPhone(e.target.value))}
                placeholder="(00) 00000-0000"
                className="mt-1.5 h-12 text-sm md:text-base border-slate-300 focus:border-primary-500 focus:ring-primary-500"
              />
              <p className="text-xs md:text-sm text-slate-500 mt-1.5">
                Você receberá a confirmação de inscrição via WhatsApp
              </p>
            </div>
          </div>
        </div>

        <div className="bg-accent-50 border-l-4 border-accent-400 p-3 md:p-4 rounded mt-4">
          <p className="text-xs md:text-sm text-slate-700">
            <strong className="text-accent-700">⚠️ Importante:</strong> Verifique se todos os dados estão corretos antes de prosseguir.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Etapa 2: Categoria
interface StepCategoriaProps {
  categoria: string
  onCategoriaChange: (value: string) => void
}

function StepCategoria({ categoria, onCategoriaChange }: StepCategoriaProps) {
  const categorias = [
    { value: '3km', label: '3KM', description: 'Caminhada ou Corrida Leve', icon: '🚶' },
    { value: '5km', label: '5KM', description: 'Corrida Intermediária', icon: '🏃' },
    { value: '10km', label: '10KM', description: 'Corrida Avançada', icon: '🏃‍♂️💨' },
    { value: 'nao-participar', label: 'Não Participar', description: 'Não desejo participar da corrida', icon: '🚫' }
  ]

  return (
    <Card className="shadow-xl border-2 border-primary-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="bg-gradient-to-r from-primary-50 to-sky-50 border-b border-primary-100">
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl text-slate-800">
          <Trophy className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
          Escolha sua Categoria
        </CardTitle>
        <CardDescription className="text-sm md:text-base">
          Selecione a distância que você deseja percorrer
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <RadioGroup value={categoria} onValueChange={onCategoriaChange} className="space-y-3 md:space-y-4">
          {categorias.map((cat) => (
            <label
              key={cat.value}
              className={`flex items-center gap-4 p-4 md:p-5 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                categoria === cat.value
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-slate-200 hover:border-primary-300'
              }`}
            >
              <RadioGroupItem value={cat.value} id={cat.value} className="w-5 h-5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="font-bold text-lg md:text-xl text-slate-800">{cat.label}</span>
                </div>
                <p className="text-xs md:text-sm text-slate-600">{cat.description}</p>
              </div>
              {categoria === cat.value && (
                <Check className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
              )}
            </label>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}

// Etapa 3: Tamanho da Camiseta
interface StepTamanhoCamisetaProps {
  tamanho: string
  onTamanhoChange: (value: string) => void
}

function StepTamanhoCamiseta({ tamanho, onTamanhoChange }: StepTamanhoCamisetaProps) {
  const tamanhos = [
    { value: 'P', altura: '73,0', largura: '50,0' },
    { value: 'M', altura: '75,0', largura: '53,0' },
    { value: 'G', altura: '77,5', largura: '55,0' },
    { value: 'GG', altura: '80,0', largura: '58,0' },
    { value: 'XG', altura: '82,5', largura: '60,5' },
    { value: 'EXG', altura: '85,0', largura: '64,0' }
  ]

  return (
    <Card className="shadow-xl border-2 border-primary-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="bg-gradient-to-r from-primary-50 to-sky-50 border-b border-primary-100">
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl text-slate-800">
          <Shirt className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
          Escolha o Tamanho da sua Camiseta
        </CardTitle>
        <CardDescription className="text-sm md:text-base">
          Confira a tabela de medidas e selecione o tamanho ideal
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-5 md:space-y-6">
        {/* Tabela de Medidas */}
        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-primary-100 text-primary-900">
                <th className="border border-primary-200 p-2 md:p-3 text-left font-semibold">Tamanho</th>
                <th className="border border-primary-200 p-2 md:p-3 text-center font-semibold">Altura (cm)</th>
                <th className="border border-primary-200 p-2 md:p-3 text-center font-semibold">Largura (cm)</th>
              </tr>
            </thead>
            <tbody>
              {tamanhos.map((t) => (
                <tr key={t.value} className={tamanho === t.value ? 'bg-primary-50' : 'hover:bg-slate-50'}>
                  <td className="border border-slate-200 p-2 md:p-3 font-semibold text-slate-800">{t.value}</td>
                  <td className="border border-slate-200 p-2 md:p-3 text-center text-slate-600">{t.altura}</td>
                  <td className="border border-slate-200 p-2 md:p-3 text-center text-slate-600">{t.largura}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs md:text-sm text-slate-500 italic">
          * Medidas aproximadas considerando altura (do ombro à barra) e largura (de axila a axila)
        </p>

        {/* Seleção de Tamanho */}
        <RadioGroup value={tamanho} onValueChange={onTamanhoChange} className="grid grid-cols-3 sm:grid-cols-6 gap-2 md:gap-3">
          {tamanhos.map((t) => (
            <label
              key={t.value}
              className={`flex items-center justify-center p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                tamanho === t.value
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-slate-200 hover:border-primary-300'
              }`}
            >
              <RadioGroupItem value={t.value} id={t.value} className="sr-only" />
              <span className={`font-bold text-base md:text-lg ${tamanho === t.value ? 'text-primary-700' : 'text-slate-700'}`}>
                {t.value}
              </span>
            </label>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}

// Etapa 4: Evento de Natal
interface StepEventoNatalProps {
  participarNatal: string
  onParticipacaoChange: (value: string) => void
}

function StepEventoNatal({ participarNatal, onParticipacaoChange }: StepEventoNatalProps) {
  const opcoesNatal = [
    {
      value: 'sim',
      label: 'Participar',
      description: 'Desejo participar e receber a cesta natalina',
      icon: '🎄'
    },
    {
      value: 'nao',
      label: 'Não Participar',
      description: 'Não desejo participar do evento de Natal',
      icon: '🚫'
    }
  ]

  return (
    <Card className="shadow-xl border-2 border-primary-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="bg-gradient-to-r from-primary-50 to-sky-50 border-b border-primary-100">
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl text-slate-800">
          <Gift className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
          Participação no Evento de Natal
        </CardTitle>
        <CardDescription className="text-sm md:text-base">
          Participe do nosso evento especial de Natal
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-5 md:space-y-6">
          {/* Card de Informação */}
          <div className="bg-gradient-to-br from-red-50 to-green-50 border-2 border-red-200 rounded-lg p-4 md:p-6">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="text-3xl md:text-4xl">🎄</div>
              <div className="flex-1">
                <h3 className="font-bold text-base md:text-lg text-slate-800 mb-2">Evento de Natal FARMACE</h3>
                <p className="text-sm md:text-base text-slate-600 mb-3">
                  Ao participar, você receberá uma <strong>cesta natalina especial</strong> no evento.
                  Celebre conosco essa data especial!
                </p>
                <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500">
                  <span>🎁</span>
                  <span>Cesta natalina inclusa</span>
                </div>
              </div>
            </div>
          </div>

          {/* RadioGroup de Participação */}
          <RadioGroup value={participarNatal} onValueChange={onParticipacaoChange} className="space-y-3 md:space-y-4">
            {opcoesNatal.map((opcao) => (
              <label
                key={opcao.value}
                className={`flex items-center gap-4 p-4 md:p-5 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  participarNatal === opcao.value
                    ? 'border-primary-500 bg-primary-50 shadow-md'
                    : 'border-slate-200 hover:border-primary-300'
                }`}
              >
                <RadioGroupItem value={opcao.value} id={opcao.value} className="w-5 h-5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{opcao.icon}</span>
                    <span className="font-bold text-lg md:text-xl text-slate-800">{opcao.label}</span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-600">{opcao.description}</p>
                </div>
                {participarNatal === opcao.value && (
                  <Check className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
                )}
              </label>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  )
}

// Etapa 5: Regulamento
interface StepRegulamentoProps {
  aceitouRegulamento: boolean
  onAceiteChange: (value: boolean) => void
}

function StepRegulamento({ aceitouRegulamento, onAceiteChange }: StepRegulamentoProps) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false)
  const regulamentoRef = useRef<HTMLDivElement>(null)

  // Detecta quando o usuário rolou até o final
  useEffect(() => {
    const handleScroll = () => {
      if (regulamentoRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = regulamentoRef.current
        // Considera "final" quando está a 10px do fundo (para dar margem)
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 10
        setScrolledToBottom(isAtBottom)
      }
    }

    const regulamentoElement = regulamentoRef.current
    if (regulamentoElement) {
      regulamentoElement.addEventListener('scroll', handleScroll)
      // Verifica inicialmente se já está no fundo (caso o conteúdo seja pequeno)
      handleScroll()
    }

    return () => {
      if (regulamentoElement) {
        regulamentoElement.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  return (
    <Card className="shadow-xl border-2 border-primary-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="bg-gradient-to-r from-primary-50 to-sky-50 border-b border-primary-100">
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl text-slate-800">
          <FileText className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
          Regulamento do Evento
        </CardTitle>
        <CardDescription className="text-sm md:text-base">
          Role até o final do regulamento para poder aceitar os termos
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-5 md:space-y-6">
        {/* Área Scrollável do Regulamento */}
        <div
          ref={regulamentoRef}
          className="border-2 border-slate-200 rounded-lg p-4 md:p-5 max-h-[400px] md:max-h-[500px] overflow-y-auto bg-slate-50"
        >
          <div className="prose prose-sm md:prose-base max-w-none text-slate-700 space-y-4">
            <h3 className="font-bold text-base md:text-lg text-slate-900 mb-3">
              REGULAMENTO - II CORRIDA E CAMINHADA DA QUALIDADE FARMACE
            </h3>

            <section>
              <h4 className="font-semibold text-sm md:text-base text-slate-800 mb-2">1. DO EVENTO</h4>
              <p className="text-xs md:text-sm leading-relaxed">
                A II Corrida e Caminhada da Qualidade FARMACE é um evento corporativo interno,
                exclusivo para colaboradores da empresa FARMACE, realizado durante a Semana da Qualidade 2025.
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-sm md:text-base text-slate-800 mb-2">2. DAS MODALIDADES</h4>
              <p className="text-xs md:text-sm leading-relaxed mb-2">O evento oferece três modalidades:</p>
              <ul className="list-disc list-inside text-xs md:text-sm space-y-1 ml-2">
                <li>Caminhada/Corrida 3KM</li>
                <li>Corrida 5KM</li>
                <li>Corrida 10KM</li>
              </ul>
            </section>

            <section>
              <h4 className="font-semibold text-sm md:text-base text-slate-800 mb-2">3. DA INSCRIÇÃO</h4>
              <ul className="list-disc list-inside text-xs md:text-sm space-y-1 ml-2">
                <li>Valor da inscrição: R$ 35,00</li>
                <li>Inscrições limitadas por ordem de chegada</li>
                <li>Apenas colaboradores da FARMACE podem se inscrever</li>
                <li>É obrigatório apresentar documento com foto no dia do evento</li>
              </ul>
            </section>

            <section>
              <h4 className="font-semibold text-sm md:text-base text-slate-800 mb-2">4. DO KIT DO ATLETA</h4>
              <p className="text-xs md:text-sm leading-relaxed">
                Cada participante receberá um kit contendo: camiseta oficial do evento e número de peito.
                A retirada do kit será informada posteriormente via WhatsApp.
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-sm md:text-base text-slate-800 mb-2">5. DO DIA DO EVENTO</h4>
              <ul className="list-disc list-inside text-xs md:text-sm space-y-1 ml-2">
                <li>Concentração: 6h30</li>
                <li>Largada: 7h00</li>
                <li>Local: FARMACE (local específico será divulgado)</li>
                <li>É obrigatório o uso da camiseta oficial do evento</li>
              </ul>
            </section>

            <section>
              <h4 className="font-semibold text-sm md:text-base text-slate-800 mb-2">6. DAS RESPONSABILIDADES</h4>
              <p className="text-xs md:text-sm leading-relaxed">
                O participante declara estar em boas condições de saúde e apto para participar do evento.
                A organização não se responsabiliza por objetos perdidos, acidentes ou problemas de saúde
                decorrentes da participação no evento.
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-sm md:text-base text-slate-800 mb-2">7. DO USO DE IMAGEM</h4>
              <p className="text-xs md:text-sm leading-relaxed">
                Ao se inscrever, o participante autoriza o uso de sua imagem em fotos e vídeos do evento
                para fins de divulgação institucional da FARMACE.
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-sm md:text-base text-slate-800 mb-2">8. DISPOSIÇÕES GERAIS</h4>
              <ul className="list-disc list-inside text-xs md:text-sm space-y-1 ml-2">
                <li>A organização se reserva o direito de alterar este regulamento a qualquer momento</li>
                <li>Casos omissos serão resolvidos pela comissão organizadora</li>
                <li>A participação no evento implica na aceitação total deste regulamento</li>
              </ul>
            </section>
          </div>
        </div>

        {/* Aviso para rolar até o final */}
        {!scrolledToBottom && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-3 md:p-4 rounded animate-pulse">
            <p className="text-xs md:text-sm text-amber-700">
              <strong>👆 Role o regulamento até o final</strong> para poder marcar o aceite dos termos.
            </p>
          </div>
        )}

        {/* Checkbox de Aceite */}
        <div className={`flex items-start gap-3 p-4 md:p-5 border-2 rounded-lg transition-all ${
          scrolledToBottom
            ? 'border-slate-300 bg-white hover:border-primary-400 cursor-pointer'
            : 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
        }`}>
          <Checkbox
            id="aceitouRegulamento"
            checked={aceitouRegulamento}
            onCheckedChange={onAceiteChange}
            disabled={!scrolledToBottom}
            className="mt-1 w-5 h-5"
          />
          <label
            htmlFor="aceitouRegulamento"
            className={`flex-1 ${scrolledToBottom ? 'cursor-pointer' : 'cursor-not-allowed'}`}
          >
            <span className="font-semibold text-sm md:text-base text-slate-800 block mb-1">
              Li e aceito o regulamento *
            </span>
            <span className="text-xs md:text-sm text-slate-600">
              Ao marcar esta opção, você declara ter lido e concordado com todos os termos do regulamento
            </span>
          </label>
        </div>

        {!aceitouRegulamento && scrolledToBottom && (
          <div className="bg-red-50 border-l-4 border-red-400 p-3 md:p-4 rounded">
            <p className="text-xs md:text-sm text-red-700">
              <strong>⚠️ Atenção:</strong> Você precisa aceitar o regulamento para confirmar sua inscrição.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
