import { useState, FormEvent, ChangeEvent, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Upload, Check, User, CreditCard, MapPin, Shirt, Volume2, VolumeX, ChevronRight, ChevronLeft, Gift, Trophy, AlertCircle, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { salvarInscricaoSupabase } from "@/services/inscricaoCorridaSupabaseService"
import { sendWhatsAppMessage, gerarMensagemConfirmacao } from "@/services/whatsappService"

// Log para confirmar que os serviços foram importados
console.log('📦 [Inscrição] Módulo carregado')
console.log('📦 [Inscrição] salvarInscricaoSupabase:', typeof salvarInscricaoSupabase)
console.log('📦 [Inscrição] sendWhatsAppMessage:', typeof sendWhatsAppMessage)

interface FormData {
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
}

interface FormErrors {
  [key: string]: string
}

export default function Inscricao() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string>('')
  const [numeroParticipante, setNumeroParticipante] = useState<string>('')
  const [formData, setFormData] = useState<FormData>({
    // Etapa 1
    tipoParticipacao: '',
    modalidadeCorrida: '',
    // Etapa 2
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    dataNascimento: '',
    cep: '',
    endereco: '',
    cidade: '',
    estado: '',
    // Etapa 3
    tamanho: 'M',
    foto: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [isMuted, setIsMuted] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)
  const hasUnmutedRef = useRef(false)

  // Função helper para determinar se deve pular a Etapa 3
  const shouldSkipStep3 = () => {
    return formData.tipoParticipacao === 'retirar-cesta'
  }

  // Função helper para calcular o número total de etapas
  const getTotalSteps = () => {
    return shouldSkipStep3() ? 3 : 4
  }

  // Função helper para mapear etapa lógica para etapa visual
  const getVisualStep = (logicalStep: number) => {
    if (shouldSkipStep3() && logicalStep === 4) {
      return 3 // Etapa 4 vira Etapa 3 visualmente
    }
    return logicalStep
  }

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

  const validateCPF = (cpf: string): boolean => {
    cpf = cpf.replace(/[^\d]/g, '')
    if (cpf.length !== 11) return false
    if (/^(\d)\1{10}$/.test(cpf)) return false
    return true
  }

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    const digits = phone.replace(/[^\d]/g, '')
    return digits.length >= 10
  }

  // Validação da Etapa 1
  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.tipoParticipacao) {
      newErrors.tipoParticipacao = 'Selecione um tipo de participação'
    }

    // Se escolheu participar da corrida, deve selecionar a modalidade
    if (formData.tipoParticipacao === 'corrida-natal' && !formData.modalidadeCorrida) {
      newErrors.modalidadeCorrida = 'Selecione uma modalidade de corrida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Validação da Etapa 2
  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório'
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório'
    } else if (!validatePhone(formData.telefone)) {
      newErrors.telefone = 'Telefone inválido'
    }
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório'
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido'
    }
    if (!formData.dataNascimento) newErrors.dataNascimento = 'Data de nascimento é obrigatória'
    if (!formData.cep.trim()) newErrors.cep = 'CEP é obrigatório'
    if (!formData.endereco.trim()) newErrors.endereco = 'Endereço é obrigatório'
    if (!formData.cidade.trim()) newErrors.cidade = 'Cidade é obrigatória'
    if (!formData.estado.trim()) newErrors.estado = 'Estado é obrigatório'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Validação da Etapa 3
  const validateStep3 = (): boolean => {
    const newErrors: FormErrors = {}

    // Apenas valida foto se o usuário escolheu participar da corrida
    if (formData.tipoParticipacao === 'corrida-natal' && !formData.foto) {
      newErrors.foto = 'Foto é obrigatória para participantes da corrida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Validação da Etapa 4 (ou Etapa 3 final se pulou)
  const validateStep4 = (): boolean => {
    // Não há validações específicas na etapa final, apenas confirmação
    return true
  }

  // Navegação entre etapas
  const handleNextStep = () => {
    let isValid = false

    if (currentStep === 1) {
      isValid = validateStep1()
    } else if (currentStep === 2) {
      isValid = validateStep2()
    } else if (currentStep === 3) {
      isValid = validateStep3()
    }

    if (isValid) {
      const totalSteps = getTotalSteps()
      const visualStep = getVisualStep(currentStep)

      if (visualStep < totalSteps) {
        // Se deve pular a Etapa 3, vai direto da Etapa 2 para Etapa 4
        if (currentStep === 2 && shouldSkipStep3()) {
          setCurrentStep(4)
        } else {
          setCurrentStep(currentStep + 1)
        }
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      // Se está na Etapa 4 e pulou a Etapa 3, volta para Etapa 2
      if (currentStep === 4 && shouldSkipStep3()) {
        setCurrentStep(2)
      } else {
        setCurrentStep(currentStep - 1)
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setFormData(prev => ({ ...prev, foto: result }))
        setPhotoPreview(result)
      }
      reader.readAsDataURL(file)
      if (errors.foto) {
        setErrors(prev => ({ ...prev, foto: '' }))
      }
    }
  }

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

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{5})(\d{0,3})/, '$1-$2').slice(0, 9)
  }

  const handleCPFChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setFormData(prev => ({ ...prev, cpf: formatted }))
    if (errors.cpf) {
      setErrors(prev => ({ ...prev, cpf: '' }))
    }
  }

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setFormData(prev => ({ ...prev, telefone: formatted }))
    if (errors.telefone) {
      setErrors(prev => ({ ...prev, telefone: '' }))
    }
  }

  const handleCEPChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value)
    setFormData(prev => ({ ...prev, cep: formatted }))
    if (errors.cep) {
      setErrors(prev => ({ ...prev, cep: '' }))
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    console.log('🎯 [Inscrição] handleSubmit CHAMADO')
    console.log('📊 [Inscrição] currentStep:', currentStep)
    console.log('📋 [Inscrição] formData:', formData)

    // Valida a etapa final antes de submeter
    let isValid = false

    // Se está na Etapa 4 (fluxo normal) ou Etapa 3 (pulou a Etapa 3)
    if (currentStep === 4 || (currentStep === 3 && shouldSkipStep3())) {
      console.log('✅ [Inscrição] Validando etapa final...')
      isValid = validateStep4()
      console.log('📊 [Inscrição] Validação resultado:', isValid)
    } else {
      console.warn('⚠️ [Inscrição] Não está na etapa final! currentStep:', currentStep)
    }

    if (!isValid) {
      console.error('❌ [Inscrição] Validação falhou! Abortando submit.')
      return
    }

    // Inicia o processo de submissão
    console.log('🚀 [Inscrição] Iniciando processo de submissão...')
    setIsSubmitting(true)
    setSubmitError('')

    try {
      console.log('📝 [Inscrição] Iniciando processo de inscrição...')

      // 1. Salva a inscrição no Supabase
      console.log('💾 [Inscrição] Salvando no banco de dados...')
      console.log('📤 [Inscrição] Dados que serão enviados:', JSON.stringify(formData, null, 2))
      const resultado = await salvarInscricaoSupabase(formData)
      console.log('📥 [Inscrição] Resultado do Supabase:', resultado)

      if (!resultado.success) {
        console.error('❌ [Inscrição] Erro ao salvar no banco:', resultado.error)
        setSubmitError(resultado.error || 'Erro ao salvar inscrição')
        setIsSubmitting(false)
        return
      }

      console.log('✅ [Inscrição] Inscrição salva com sucesso!')
      console.log('🎫 [Inscrição] Número do participante:', resultado.data?.numeroParticipante)

      // Armazena o número do participante
      const numeroGerado = resultado.data?.numeroParticipante || '0000'
      setNumeroParticipante(numeroGerado)

      // 2. Envia mensagem de confirmação via WhatsApp (apenas se participar da corrida)
      if (formData.tipoParticipacao === 'corrida-natal') {
        console.log('📱 [Inscrição] Enviando confirmação via WhatsApp...')

        const mensagem = gerarMensagemConfirmacao(
          formData.nome,
          numeroGerado,
          formData.modalidadeCorrida,
          formData.tamanho
        )

        const whatsappResult = await sendWhatsAppMessage({
          phoneNumber: formData.telefone,
          message: mensagem
        })

        if (whatsappResult.success) {
          console.log('✅ [Inscrição] Mensagem WhatsApp enviada com sucesso!')
        } else {
          console.warn('⚠️ [Inscrição] Falha ao enviar WhatsApp, mas inscrição foi salva:', whatsappResult.error)
          // Não bloqueia o fluxo se o WhatsApp falhar
        }
      }

      // 3. Marca como submetido e exibe tela de sucesso
      console.log('🎉 [Inscrição] Processo concluído com sucesso!')
      setSubmitted(true)
      setIsSubmitting(false)

    } catch (error) {
      console.error('❌ [Inscrição] Erro inesperado:', error)
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Erro inesperado ao processar inscrição. Tente novamente.'
      )
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 flex items-center justify-center p-4">
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

        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Inscrição Confirmada!</CardTitle>
            <CardDescription className="text-base">
              Sua inscrição foi realizada com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600 mb-2">Número do Participante</p>
              <p className="text-3xl font-bold text-slate-900">
                #{numeroParticipante}
              </p>
            </div>

            {/* Exibe valor apenas se participar da corrida */}
            {formData.tipoParticipacao === 'corrida-natal' && (
              <div className="bg-accent-50 border-2 border-accent-200 p-4 rounded-lg">
                <p className="text-sm font-semibold text-slate-900 mb-2">Valor da Inscrição</p>
                <p className="text-2xl font-bold text-accent-700">R$ 35,00</p>
                <p className="text-xs text-slate-600 mt-2">
                  Em breve você receberá as instruções de pagamento no e-mail cadastrado.
                </p>
              </div>
            )}

            {/* Mensagem de confirmação via WhatsApp */}
            {formData.tipoParticipacao === 'corrida-natal' && (
              <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
                <p className="text-sm text-green-800 text-center">
                  ✅ Confirmação enviada via WhatsApp para <strong>{formData.telefone}</strong>
                </p>
              </div>
            )}

            <p className="text-sm text-slate-600 text-center">
              Sua inscrição foi registrada com sucesso!
              {formData.tipoParticipacao === 'corrida-natal' && (
                <> Você receberá mais informações no e-mail <strong>{formData.email}</strong>.</>
              )}
            </p>

            <Button
              className="w-full"
              onClick={() => navigate('/')}
            >
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-sky-400 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Formulário de Inscrição</h1>
            <p className="text-white/90">II Corrida e Caminhada da Qualidade FARMACE</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Indicador de Progresso das Etapas */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {/* Etapa 1 */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-all duration-300 ${
                currentStep >= 1
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-slate-200 text-slate-400'
              }`}>
                1
              </div>
              <p className={`text-xs md:text-sm mt-2 font-medium text-center ${
                currentStep >= 1 ? 'text-primary-600' : 'text-slate-400'
              }`}>
                Participação
              </p>
            </div>

            {/* Linha conectora 1-2 */}
            <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${
              currentStep >= 2 ? 'bg-primary-600' : 'bg-slate-200'
            }`}></div>

            {/* Etapa 2 */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-all duration-300 ${
                currentStep >= 2
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-slate-200 text-slate-400'
              }`}>
                2
              </div>
              <p className={`text-xs md:text-sm mt-2 font-medium text-center ${
                currentStep >= 2 ? 'text-primary-600' : 'text-slate-400'
              }`}>
                Dados Pessoais
              </p>
            </div>

            {/* Linha conectora 2-3 */}
            <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${
              (currentStep >= 3 || (currentStep >= 4 && shouldSkipStep3())) ? 'bg-primary-600' : 'bg-slate-200'
            }`}></div>

            {/* Etapa 3 (Finalização) - Número dinâmico baseado no fluxo */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-all duration-300 ${
                (currentStep >= 3 || (currentStep >= 4 && shouldSkipStep3()))
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-slate-200 text-slate-400'
              }`}>
                {getVisualStep(currentStep >= 4 ? 4 : 3)}
              </div>
              <p className={`text-xs md:text-sm mt-2 font-medium text-center ${
                (currentStep >= 3 || (currentStep >= 4 && shouldSkipStep3())) ? 'text-primary-600' : 'text-slate-400'
              }`}>
                Finalização
              </p>
            </div>
          </div>

          {/* Contador de Etapas */}
          <div className="text-center mt-4">
            <p className="text-sm text-slate-600 font-medium">
              Etapa {getVisualStep(currentStep)} de {getTotalSteps()}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ETAPA 1 - Tipo de Participação e Modalidade */}
          {currentStep === 1 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                    <Gift className="w-6 h-6" />
                    Tipo de Participação
                  </CardTitle>
                  <CardDescription>
                    Escolha como você deseja participar dos eventos da Semana da Qualidade
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Seção A - Seleção do Tipo de Participação */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold text-slate-700">
                      Selecione uma opção: *
                    </Label>
                    <RadioGroup
                      value={formData.tipoParticipacao}
                      onValueChange={(value) => {
                        setFormData(prev => ({
                          ...prev,
                          tipoParticipacao: value,
                          // Limpa a modalidade se não for corrida
                          modalidadeCorrida: value === 'corrida-natal' ? prev.modalidadeCorrida : ''
                        }))
                        if (errors.tipoParticipacao) {
                          setErrors(prev => ({ ...prev, tipoParticipacao: '' }))
                        }
                      }}
                      className="space-y-3"
                    >
                      {/* Opção 1 - Corrida + Natal */}
                      <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                        formData.tipoParticipacao === 'corrida-natal'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                      }`}>
                        <RadioGroupItem value="corrida-natal" id="corrida-natal" className="mt-1" />
                        <div className="flex-1">
                          <Label
                            htmlFor="corrida-natal"
                            className="font-semibold text-slate-800 cursor-pointer flex items-center gap-2"
                          >
                            <Trophy className="w-5 h-5 text-primary-600" />
                            Participar da corrida e da comemoração de Natal
                          </Label>
                          <p className="text-sm text-slate-600 mt-1">
                            Você participará da corrida e receberá a cesta natalina
                          </p>
                        </div>
                      </div>

                      {/* Opção 2 - Apenas Natal */}
                      <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                        formData.tipoParticipacao === 'apenas-natal'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                      }`}>
                        <RadioGroupItem value="apenas-natal" id="apenas-natal" className="mt-1" />
                        <div className="flex-1">
                          <Label
                            htmlFor="apenas-natal"
                            className="font-semibold text-slate-800 cursor-pointer flex items-center gap-2"
                          >
                            <Gift className="w-5 h-5 text-accent-600" />
                            Participar apenas da comemoração de Natal
                          </Label>
                          <p className="text-sm text-slate-600 mt-1">
                            Você receberá a cesta natalina
                          </p>
                        </div>
                      </div>

                      {/* Opção 3 - Retirar Cesta */}
                      <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                        formData.tipoParticipacao === 'retirar-cesta'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                      }`}>
                        <RadioGroupItem value="retirar-cesta" id="retirar-cesta" className="mt-1" />
                        <div className="flex-1">
                          <Label
                            htmlFor="retirar-cesta"
                            className="font-semibold text-slate-800 cursor-pointer"
                          >
                            Não participar de nenhum evento e retirar a cesta natalina na Farmace
                          </Label>
                          <p className="text-sm text-slate-600 mt-1">
                            Retirada disponível nos dias <strong>22 ou 23 de dezembro/2025</strong>
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                    {errors.tipoParticipacao && (
                      <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.tipoParticipacao}
                      </p>
                    )}
                  </div>

                  {/* Seção B - Seleção da Modalidade de Corrida (Condicional) */}
                  {formData.tipoParticipacao === 'corrida-natal' && (
                    <div className="space-y-4 pt-4 border-t-2 border-slate-200 animate-in fade-in slide-in-from-top-4 duration-500">
                      <Label className="text-base font-semibold text-slate-700 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-primary-600" />
                        Selecione a modalidade de corrida: *
                      </Label>
                      <RadioGroup
                        value={formData.modalidadeCorrida}
                        onValueChange={(value) => {
                          setFormData(prev => ({ ...prev, modalidadeCorrida: value }))
                          if (errors.modalidadeCorrida) {
                            setErrors(prev => ({ ...prev, modalidadeCorrida: '' }))
                          }
                        }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-3"
                      >
                        {/* 3KM */}
                        <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                          formData.modalidadeCorrida === '3km'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                        }`}>
                          <RadioGroupItem value="3km" id="3km" />
                          <Label htmlFor="3km" className="font-semibold text-slate-800 cursor-pointer">
                            3KM
                          </Label>
                        </div>

                        {/* 5KM */}
                        <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                          formData.modalidadeCorrida === '5km'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                        }`}>
                          <RadioGroupItem value="5km" id="5km" />
                          <Label htmlFor="5km" className="font-semibold text-slate-800 cursor-pointer">
                            5KM
                          </Label>
                        </div>

                        {/* 10KM */}
                        <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                          formData.modalidadeCorrida === '10km'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                        }`}>
                          <RadioGroupItem value="10km" id="10km" />
                          <Label htmlFor="10km" className="font-semibold text-slate-800 cursor-pointer">
                            10KM
                          </Label>
                        </div>
                      </RadioGroup>
                      {errors.modalidadeCorrida && (
                        <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.modalidadeCorrida}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Botão Próximo */}
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={handleNextStep}
                  size="lg"
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8"
                >
                  Próximo
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </>
          )}

          {/* ETAPA 2 - Dados Pessoais e Endereço */}
          {currentStep === 2 && (
            <>
              <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    placeholder="Seu nome completo"
                    className={errors.nome ? 'border-red-500' : ''}
                  />
                  {errors.nome && <p className="text-sm text-red-600 mt-1">{errors.nome}</p>}
                </div>

                <div>
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="seu@email.com"
                    readOnly
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    type="tel"
                    inputMode="numeric"
                    value={formData.telefone}
                    onChange={handlePhoneChange}
                    placeholder="(00) 00000-0000"
                    className={errors.telefone ? 'border-red-500' : ''}
                  />
                  {errors.telefone && <p className="text-sm text-red-600 mt-1">{errors.telefone}</p>}
                </div>

                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    type="text"
                    inputMode="numeric"
                    value={formData.cpf}
                    onChange={handleCPFChange}
                    placeholder="000.000.000-00"
                    className={errors.cpf ? 'border-red-500' : ''}
                  />
                  {errors.cpf && <p className="text-sm text-red-600 mt-1">{errors.cpf}</p>}
                </div>

                <div>
                  <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                  <Input
                    id="dataNascimento"
                    name="dataNascimento"
                    type="date"
                    value={formData.dataNascimento}
                    onChange={handleInputChange}
                    className={errors.dataNascimento ? 'border-red-500' : ''}
                  />
                  {errors.dataNascimento && <p className="text-sm text-red-600 mt-1">{errors.dataNascimento}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cep">CEP *</Label>
                  <Input
                    id="cep"
                    name="cep"
                    type="text"
                    inputMode="numeric"
                    value={formData.cep}
                    onChange={handleCEPChange}
                    placeholder="00000-000"
                    className={errors.cep ? 'border-red-500' : ''}
                  />
                  {errors.cep && <p className="text-sm text-red-600 mt-1">{errors.cep}</p>}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="endereco">Endereço *</Label>
                  <Input
                    id="endereco"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleInputChange}
                    placeholder="Rua, número, complemento"
                    className={errors.endereco ? 'border-red-500' : ''}
                  />
                  {errors.endereco && <p className="text-sm text-red-600 mt-1">{errors.endereco}</p>}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input
                    id="cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleInputChange}
                    placeholder="Sua cidade"
                    className={errors.cidade ? 'border-red-500' : ''}
                  />
                  {errors.cidade && <p className="text-sm text-red-600 mt-1">{errors.cidade}</p>}
                </div>

                <div>
                  <Label htmlFor="estado">Estado *</Label>
                  <select
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.estado ? 'border-red-500' : ''}`}
                  >
                    <option value="">Selecione</option>
                    <option value="AC">AC</option>
                    <option value="AL">AL</option>
                    <option value="AP">AP</option>
                    <option value="AM">AM</option>
                    <option value="BA">BA</option>
                    <option value="CE">CE</option>
                    <option value="DF">DF</option>
                    <option value="ES">ES</option>
                    <option value="GO">GO</option>
                    <option value="MA">MA</option>
                    <option value="MT">MT</option>
                    <option value="MS">MS</option>
                    <option value="MG">MG</option>
                    <option value="PA">PA</option>
                    <option value="PB">PB</option>
                    <option value="PR">PR</option>
                    <option value="PE">PE</option>
                    <option value="PI">PI</option>
                    <option value="RJ">RJ</option>
                    <option value="RN">RN</option>
                    <option value="RS">RS</option>
                    <option value="RO">RO</option>
                    <option value="RR">RR</option>
                    <option value="SC">SC</option>
                    <option value="SP">SP</option>
                    <option value="SE">SE</option>
                    <option value="TO">TO</option>
                  </select>
                  {errors.estado && <p className="text-sm text-red-600 mt-1">{errors.estado}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

              {/* Botões de Navegação - Etapa 2 */}
              <div className="flex justify-between gap-4">
                <Button
                  type="button"
                  onClick={handlePreviousStep}
                  variant="outline"
                  size="lg"
                  className="font-semibold px-8"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Anterior
                </Button>
                <Button
                  type="button"
                  onClick={handleNextStep}
                  size="lg"
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8"
                >
                  Próximo
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </>
          )}

          {/* ETAPA 3 - Informações da Corrida e Upload de Foto (PULADA se retirar-cesta) */}
          {currentStep === 3 && !shouldSkipStep3() && (
            <>
              {/* Tamanho da Camiseta - Apenas se participar da corrida */}
              {formData.tipoParticipacao === 'corrida-natal' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shirt className="w-5 h-5" />
                      Tamanho da Camiseta
                    </CardTitle>
                    <CardDescription>
                      Selecione o tamanho da camiseta que você receberá no kit do atleta
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="tamanho">Tamanho *</Label>
                      <select
                        id="tamanho"
                        name="tamanho"
                        value={formData.tamanho}
                        onChange={handleInputChange}
                        className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="PP">PP</option>
                        <option value="P">P</option>
                        <option value="M">M</option>
                        <option value="G">G</option>
                        <option value="GG">GG</option>
                        <option value="XG">XG</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Upload de Foto - Apenas se participar da corrida */}
              {formData.tipoParticipacao === 'corrida-natal' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Foto do Participante
                    </CardTitle>
                    <CardDescription>
                      Envie uma foto recente para identificação no dia da corrida
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Label
                        htmlFor="foto"
                        className={`flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 transition-colors ${
                          errors.foto ? 'border-red-500' : 'border-slate-300'
                        }`}
                      >
                        {photoPreview ? (
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-12 h-12 mb-3 text-slate-400" />
                            <p className="mb-2 text-sm md:text-base text-slate-600 text-center px-4">
                              <span className="font-semibold">Clique para enviar</span> ou arraste e solte
                            </p>
                            <p className="text-xs text-slate-500">PNG, JPG ou JPEG (MAX. 5MB)</p>
                          </div>
                        )}
                        <Input
                          id="foto"
                          name="foto"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </Label>
                      {errors.foto && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.foto}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Informação de Pagamento - Apenas se participar da corrida */}
              {formData.tipoParticipacao === 'corrida-natal' && (
                <Card className="bg-accent-50 border-2 border-accent-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-accent-900">
                      <CreditCard className="w-5 h-5" />
                      Valor da Inscrição
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-3xl md:text-4xl font-bold text-accent-700 mb-2">R$ 35,00</p>
                      <p className="text-sm text-slate-600">
                        Após confirmar a inscrição, você receberá as instruções de pagamento por e-mail.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Botões de Navegação - Etapa 3 */}
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <Button
                  type="button"
                  onClick={handlePreviousStep}
                  variant="outline"
                  size="lg"
                  className="font-semibold px-8 w-full sm:w-auto"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Anterior
                </Button>
                <Button
                  type="button"
                  onClick={handleNextStep}
                  size="lg"
                  className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8"
                >
                  Próximo
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </>
          )}

          {/* ETAPA 4 - Finalização e Resumo (ou Etapa 3 se pulou a anterior) */}
          {(currentStep === 4 || (currentStep === 3 && shouldSkipStep3())) && (
            <>

              {/* Resumo da Inscrição */}
              <Card className="bg-primary-50 border-2 border-primary-200">
                <CardHeader>
                  <CardTitle className="text-primary-900">Resumo da Inscrição</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-primary-200">
                    <span className="text-slate-700 font-medium">Tipo de Participação:</span>
                    <span className="text-slate-900 font-semibold">
                      {formData.tipoParticipacao === 'corrida-natal' && 'Corrida + Natal'}
                      {formData.tipoParticipacao === 'apenas-natal' && 'Apenas Natal'}
                      {formData.tipoParticipacao === 'retirar-cesta' && 'Retirar Cesta'}
                    </span>
                  </div>
                  {formData.tipoParticipacao === 'corrida-natal' && formData.modalidadeCorrida && (
                    <div className="flex justify-between items-center py-2 border-b border-primary-200">
                      <span className="text-slate-700 font-medium">Modalidade:</span>
                      <span className="text-slate-900 font-semibold">{formData.modalidadeCorrida.toUpperCase()}</span>
                    </div>
                  )}
                  {formData.tipoParticipacao === 'corrida-natal' && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-700 font-medium">Tamanho da Camiseta:</span>
                      <span className="text-slate-900 font-semibold">{formData.tamanho}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Mensagem de Erro (se houver) */}
              {submitError && (
                <Card className="bg-red-50 border-2 border-red-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-red-900 mb-1">
                          Erro ao processar inscrição
                        </p>
                        <p className="text-sm text-red-700">
                          {submitError}
                        </p>
                        <p className="text-xs text-red-600 mt-2">
                          Por favor, tente novamente. Se o erro persistir, entre em contato com o suporte.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Botões de Navegação - Etapa Final */}
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <Button
                  type="button"
                  onClick={handlePreviousStep}
                  variant="outline"
                  size="lg"
                  className="font-semibold px-8 w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Anterior
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Confirmar Inscrição
                    </>
                  )}
                </Button>
              </div>

              <p className="text-center text-sm text-slate-500">
                * Campos obrigatórios
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
