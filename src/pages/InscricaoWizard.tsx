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
import { sendWhatsAppMessage, gerarMensagemConfirmacao, gerarMensagemRetirarCesta, gerarMensagemApenasNatal } from "@/services/whatsappService"

// Interface para os dados do formulário
interface FormData {
  // Etapa 1: Dados Cadastrais
  nome: string
  email: string
  cpf: string
  dataNascimento: string
  whatsapp: string

  // Etapa 2: Tipo de Participação
  tipoParticipacao: string
  modalidadeCorrida: string

  // Etapa 3: Tamanho da Camiseta
  tamanho: string

  // Etapa 4: Regulamento
  aceitouRegulamento: boolean
}

export default function InscricaoWizard() {
  const navigate = useNavigate()
  const { width, height } = useWindowSize()

  const [currentStep, setCurrentStep] = useState(1)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showWhatsappWarning, setShowWhatsappWarning] = useState(false)
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
    tipoParticipacao: "",
    modalidadeCorrida: "",
    tamanho: "",
    aceitouRegulamento: false
  })

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  // Scroll para o topo sempre que a etapa mudar
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  // Carrega dados do funcionário logado do localStorage
  useEffect(() => {
    const colaboradorLogado = localStorage.getItem('colaboradorLogado')

    if (colaboradorLogado) {
      try {
        const dados = JSON.parse(colaboradorLogado)

        // Função para formatar CPF (XXX.XXX.XXX-XX)
        const formatarCPF = (cpf: string) => {
          const numbers = cpf.replace(/\D/g, '')
          return numbers
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
            .slice(0, 14)
        }

        // Função para converter data de "DD.MM.YYYY HH:MM" para "YYYY-MM-DD"
        const convertDateFormat = (dateString: string): string => {
          // Formato de entrada: "10.06.1958 00:00"
          // Formato de saída: "1958-06-10"
          const [datePart] = dateString.split(' ')
          const [dia, mes, ano] = datePart.split('.')
          return `${ano}-${mes}-${dia}`
        }

        // Preenche automaticamente os campos da Etapa 1
        setFormData(prev => ({
          ...prev,
          nome: dados.nome || '',
          email: dados.email || '', // ✅ NOVO: Preenche email automaticamente
          cpf: formatarCPF(dados.cpf || ''),
          dataNascimento: dados.dataNascimento ? convertDateFormat(dados.dataNascimento) : ''
        }))

        console.log('✅ Dados do funcionário carregados automaticamente:', {
          nome: dados.nome,
          email: dados.email, // ✅ NOVO: Log do email
          cpf: dados.cpf,
          cpfFormatado: formatarCPF(dados.cpf || ''),
          dataNascimento: dados.dataNascimento,
          dataNascimentoConvertida: dados.dataNascimento ? convertDateFormat(dados.dataNascimento) : ''
        })
      } catch (error) {
        console.error('❌ Erro ao carregar dados do funcionário:', error)
      }
    } else {
      console.warn('⚠️ Nenhum funcionário logado encontrado no localStorage')
    }
  }, [])

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

  // Função para validar se o WhatsApp está completo
  const isWhatsappValid = (whatsapp: string): boolean => {
    // Remove caracteres não numéricos
    const numbers = whatsapp.replace(/\D/g, '')
    // WhatsApp válido deve ter 11 dígitos (DDD + 9 dígitos)
    return numbers.length === 11
  }

  // Função para verificar se deve pular a Etapa 3 (seleção de tamanho de camisa)
  // Retorna true se o usuário escolheu "retirar-cesta" (não participar de nenhum evento)
  const shouldSkipStep3 = (): boolean => {
    return formData.tipoParticipacao === 'retirar-cesta'
  }

  // Função para verificar se deve pular a Etapa 4 (aceite de regulamento)
  // Retorna true se o usuário escolheu "apenas-natal" (participar apenas da comemoração de Natal)
  const shouldSkipStep4 = (): boolean => {
    return formData.tipoParticipacao === 'apenas-natal'
  }

  // Validação de cada etapa
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        // Etapa 1: Apenas WhatsApp é obrigatório
        return isWhatsappValid(formData.whatsapp)
      case 2:
        // Etapa 2: Valida tipo de participação e modalidade (se aplicável)
        if (!formData.tipoParticipacao) return false
        // Se escolheu participar da corrida, deve selecionar a modalidade
        if (formData.tipoParticipacao === 'corrida-natal' && !formData.modalidadeCorrida) return false
        return true
      case 3:
        // Etapa 3: Valida tamanho da camisa (apenas se não pular esta etapa)
        if (shouldSkipStep3()) return true // Se pular, considera válido automaticamente
        return !!formData.tamanho
      case 4:
        return formData.aceitouRegulamento
      default:
        return false
    }
  }

  const handleNext = async () => {
    // Etapa 1: Validação customizada com modal
    if (currentStep === 1) {
      if (!isWhatsappValid(formData.whatsapp)) {
        setShowWhatsappWarning(true)
        return
      }
    }

    // Para outras etapas, usa validação normal
    if (validateStep(currentStep)) {
      // NOVO: Se está na Etapa 2 e escolheu "retirar-cesta", pula direto para o modal de confirmação
      if (currentStep === 2 && formData.tipoParticipacao === 'retirar-cesta') {
        // Submete a inscrição diretamente
        await handleSubmitRetirarCesta()
        return
      }

      if (currentStep < totalSteps) {
        // Lógica condicional de navegação entre etapas
        if (currentStep === 2 && shouldSkipStep3()) {
          // Se escolheu "retirar-cesta", pula a Etapa 3 (seleção de camisa) e vai direto para Etapa 4
          setCurrentStep(4)
        } else if (currentStep === 3 && shouldSkipStep4()) {
          // Se escolheu "apenas-natal", pula a Etapa 4 (regulamento) e submete direto
          await handleSubmitApenasNatal()
          return
        } else {
          // Avança normalmente
          setCurrentStep(currentStep + 1)
        }

        // Força o scroll para o topo imediatamente
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 0)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      // Lógica condicional de navegação ao voltar
      if (currentStep === 4 && shouldSkipStep3()) {
        // Se escolheu "retirar-cesta", volta direto para Etapa 2 (pula a Etapa 3)
        setCurrentStep(2)
      } else {
        // Volta normalmente
        setCurrentStep(currentStep - 1)
      }

      // Força o scroll para o topo imediatamente
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 0)
    }
  }

  // Função específica para processar inscrição de quem escolheu participar apenas da comemoração de Natal
  const handleSubmitApenasNatal = async () => {
    setIsSubmitting(true)

    try {
      // Salvar no localStorage
      const inscricoes = JSON.parse(localStorage.getItem('inscricoes') || '[]')
      const numeroParticipante = (inscricoes.length + 1).toString().padStart(4, '0')

      const novaInscricao = {
        ...formData,
        id: Date.now(),
        dataInscricao: new Date().toISOString(),
        numeroParticipante,
        // Define valores padrão para campos não preenchidos
        aceitouRegulamento: true // Aceita automaticamente (não há regulamento para quem só participa do Natal)
      }

      inscricoes.push(novaInscricao)
      localStorage.setItem('inscricoes', JSON.stringify(inscricoes))

      // Enviar mensagem de confirmação via WhatsApp
      console.log('📱 Enviando mensagem de confirmação via WhatsApp (Apenas Natal)...')

      const mensagem = gerarMensagemApenasNatal(
        formData.nome,
        numeroParticipante,
        formData.tamanho
      )

      console.log('📝 Mensagem gerada:', mensagem.substring(0, 100) + '...')
      console.log('📞 WhatsApp:', formData.whatsapp)

      const resultado = await sendWhatsAppMessage({
        phoneNumber: formData.whatsapp,
        message: mensagem
      })

      console.log('📊 Resultado do envio:', resultado)

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

  // Função específica para processar inscrição de quem escolheu apenas retirar a cesta
  const handleSubmitRetirarCesta = async () => {
    setIsSubmitting(true)

    try {
      // Salvar no localStorage
      const inscricoes = JSON.parse(localStorage.getItem('inscricoes') || '[]')
      const numeroParticipante = (inscricoes.length + 1).toString().padStart(4, '0')

      const novaInscricao = {
        ...formData,
        id: Date.now(),
        dataInscricao: new Date().toISOString(),
        numeroParticipante,
        // Define valores padrão para campos não preenchidos
        tamanho: 'N/A', // Não precisa de camiseta
        aceitouRegulamento: true // Aceita automaticamente (não há regulamento para quem só retira cesta)
      }

      inscricoes.push(novaInscricao)
      localStorage.setItem('inscricoes', JSON.stringify(inscricoes))

      // Enviar mensagem de confirmação via WhatsApp
      console.log('📱 Enviando mensagem de confirmação via WhatsApp (Retirar Cesta)...')

      const mensagem = gerarMensagemRetirarCesta(
        formData.nome,
        numeroParticipante
      )

      console.log('📝 Mensagem gerada:', mensagem.substring(0, 100) + '...')
      console.log('📞 WhatsApp:', formData.whatsapp)

      const resultado = await sendWhatsAppMessage({
        phoneNumber: formData.whatsapp,
        message: mensagem
      })

      console.log('📊 Resultado do envio:', resultado)

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

  const handleSubmit = async () => {
    if (validateStep(4)) {
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

        // Formata a categoria baseado no tipo de participação e modalidade
        const categoriaFormatada = formData.tipoParticipacao === 'corrida-natal'
          ? formData.modalidadeCorrida.toUpperCase()
          : formData.tipoParticipacao === 'apenas-natal'
          ? 'APENAS NATAL'
          : 'RETIRAR CESTA'

        const mensagem = gerarMensagemConfirmacao(
          formData.nome,
          numeroParticipante,
          categoriaFormatada
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

  // Função para mascarar CPF conforme LGPD (mostra apenas 3 primeiros e 2 últimos dígitos)
  const maskCPF = (cpf: string) => {
    // Remove caracteres não numéricos
    const numbers = cpf.replace(/\D/g, '')

    if (numbers.length < 5) {
      // Se tiver menos de 5 dígitos, retorna formatado normalmente
      return formatCPF(cpf)
    }

    // Pega os 3 primeiros e 2 últimos dígitos
    const first3 = numbers.slice(0, 3)
    const last2 = numbers.slice(-2)

    // Formata como: XXX.***.**X-XX
    // Exemplo: 006.769.013-01 vira 006.***.**3-01
    const secondToLast = numbers.length >= 3 ? numbers[numbers.length - 3] : '*'

    return `${first3}.***.**${secondToLast}-${last2}`
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
          src="/Banner.png"
          alt="II Corrida FARMACE - 2025.2"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Overlay escuro para legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40"></div>

        {/* Conteúdo do Header */}
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="flex items-start gap-4 mb-3 md:mb-4">
            {/* Logo da FARMACE */}
            <img
              src="https://farmace.com.br/wp-content/uploads/2023/12/cropped-big-logo-farmace.png"
              alt="Farmace"
              className="drop-shadow-lg"
              style={{ maxWidth: '150px' }}
            />

            {/* Textos do Header */}
            <div className="flex-1 text-center">
              <h1 className="text-xl md:text-3xl font-bold mb-1 md:mb-2 drop-shadow-lg">INSCRIÇÃO - ETAPA {currentStep} de {totalSteps}</h1>
              <p className="text-white/90 text-sm md:text-base drop-shadow-md">II Corrida FARMACE - 2025</p>
            </div>
          </div>

          <div>
            <Progress value={progress} className="h-2 md:h-3 bg-white/20" />
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
            maskCPF={maskCPF}
          />
        )}

        {/* Etapa 2: Tipo de Participação e Modalidade */}
        {currentStep === 2 && (
          <StepTipoParticipacao
            tipoParticipacao={formData.tipoParticipacao}
            modalidadeCorrida={formData.modalidadeCorrida}
            onTipoChange={(value) => {
              handleInputChange('tipoParticipacao', value)
              // Se escolheu "retirar-cesta", limpa o tamanho da camisa
              if (value === 'retirar-cesta') {
                handleInputChange('tamanho', '')
              }
            }}
            onModalidadeChange={(value) => handleInputChange('modalidadeCorrida', value)}
          />
        )}

        {/* Etapa 3: Tamanho da Camiseta */}
        {currentStep === 3 && (
          <StepTamanhoCamiseta
            tamanho={formData.tamanho}
            onTamanhoChange={(value) => handleInputChange('tamanho', value)}
          />
        )}

        {/* Etapa 4: Regulamento */}
        {currentStep === 4 && (
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
              disabled={currentStep === 1 ? false : !validateStep(currentStep)}
              className="w-full sm:flex-1 order-1 sm:order-2 bg-primary-600 hover:bg-primary-700 h-11 md:h-12 text-sm md:text-base font-semibold text-white"
            >
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!validateStep(4) || isSubmitting}
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
          {/* Cabeçalho do Recibo - Customizado para "Retirar Cesta" */}
          <div className="text-center border-b-2 border-dashed border-slate-300 pb-3 mb-3">
            <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-2 ${
              formData.tipoParticipacao === 'retirar-cesta'
                ? 'bg-amber-100'
                : 'bg-green-100'
            }`}>
              {formData.tipoParticipacao === 'retirar-cesta' ? (
                <Gift className="w-8 h-8 text-amber-600" />
              ) : (
                <Check className="w-8 h-8 text-green-600" />
              )}
            </div>
            <DialogTitle className={`text-lg sm:text-xl font-bold mb-1 ${
              formData.tipoParticipacao === 'retirar-cesta'
                ? 'text-amber-600'
                : 'text-green-600'
            }`}>
              {formData.tipoParticipacao === 'retirar-cesta'
                ? 'Solicitação Registrada!'
                : 'Inscrição Realizada!'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {formData.tipoParticipacao === 'retirar-cesta'
                ? 'Comprovante de Retirada de Cesta Natalina'
                : 'Comprovante de Inscrição'}
            </DialogDescription>
          </div>

          {/* Corpo do Recibo */}
          <div className="space-y-2.5 py-1">
            {/* Status - Confirmado para todos os tipos de participação */}
            <div className="bg-green-50 border-l-4 border-green-400 p-2.5 rounded">
              <div className="flex items-center gap-2">
                <span className="text-lg">✅</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-green-800">Status: Confirmado</p>
                  <p className="text-xs text-green-600">
                    {formData.tipoParticipacao === 'retirar-cesta'
                      ? 'Sua cesta estará disponível para retirada'
                      : 'Sua inscrição foi confirmada com sucesso!'}
                  </p>
                </div>
              </div>
            </div>

            {/* Número do Participante/Registro */}
            <div className="bg-gradient-to-r from-primary-50 to-sky-50 border border-primary-200 rounded-lg p-2.5">
              <p className="text-xs text-slate-600 mb-0.5">
                {formData.tipoParticipacao === 'retirar-cesta'
                  ? 'Número de Registro'
                  : 'Número do Participante'}
              </p>
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

              {/* WhatsApp, Categoria e Camiseta - Layout condicional */}
              {formData.tipoParticipacao === 'retirar-cesta' ? (
                // Layout para "Retirar Cesta" - Sem camiseta
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-slate-500">WhatsApp</p>
                    <p className="font-medium text-slate-700 text-xs">{formData.whatsapp}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Opção Escolhida</p>
                    <p className="font-semibold text-amber-700 uppercase text-xs">
                      RETIRAR CESTA
                    </p>
                  </div>
                </div>
              ) : (
                // Layout padrão - Com camiseta
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-slate-500">WhatsApp</p>
                    <p className="font-medium text-slate-700 text-xs">{formData.whatsapp}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Participação</p>
                    <p className="font-semibold text-primary-700 uppercase text-xs">
                      {formData.tipoParticipacao === 'corrida-natal'
                        ? formData.modalidadeCorrida.toUpperCase()
                        : 'APENAS NATAL'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Camiseta</p>
                    <p className="font-semibold text-primary-700 text-xs">{formData.tamanho}</p>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-200 pt-1.5">
                <p className="text-xs text-slate-500">
                  {formData.tipoParticipacao === 'retirar-cesta'
                    ? 'Data do Registro'
                    : 'Data da Inscrição'}
                </p>
                <p className="font-medium text-slate-700 text-xs">{new Date().toLocaleString('pt-BR')}</p>
              </div>
            </div>

            {/* Informações específicas para "Retirar Cesta" */}
            {formData.tipoParticipacao === 'retirar-cesta' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <span className="text-lg">📍</span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-amber-900 mb-1.5">
                      Informações Importantes:
                    </p>
                    <div className="space-y-1 text-xs text-amber-800">
                      <p>❌ Você <strong>NÃO</strong> participará da II Corrida FARMACE</p>
                      <p>❌ Você <strong>NÃO</strong> participará do evento de comemoração de Natal</p>
                      <p className="mt-2 pt-2 border-t border-amber-300">
                        ✅ Sua cesta natalina estará disponível para <strong>retirada presencial na FARMACE</strong> nos dias:
                      </p>
                      <p className="font-semibold">• 22 de dezembro de 2025</p>
                      <p className="font-semibold">• 23 de dezembro de 2025</p>
                      <p className="mt-1.5 text-amber-700">
                        🕐 Horário: Das 8h às 17h
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                      Você receberá atualizações importantes sobre o evento via WhatsApp.
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

      {/* Modal de Aviso - WhatsApp Obrigatório */}
      <Dialog open={showWhatsappWarning} onOpenChange={setShowWhatsappWarning}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">📱</span>
            </div>
            <DialogTitle className="text-2xl text-center text-amber-600">
              WhatsApp Obrigatório
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-center text-slate-600">
              Por favor, preencha-o corretamente com um número válido no formato <strong>(00) 00000-0000</strong>.
            </p>
            <p className="text-center text-sm text-slate-500">
              <strong>Você receberá a confirmação de inscrição e atualizações importantes via WhatsApp.</strong>
            </p>
            <Button
              onClick={() => setShowWhatsappWarning(false)}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white"
            >
              Entendi
            </Button>
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
  maskCPF: (value: string) => string
}

function StepDadosCadastrais({ formData, onInputChange, formatCPF, formatPhone, maskCPF }: StepDadosCadastraisProps) {
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
              Nome Completo
            </Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => onInputChange('nome', e.target.value)}
              placeholder="Seu nome completo"
              className="mt-1.5 h-12 text-sm md:text-base border-slate-300 bg-slate-50"
              readOnly
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
            <div>
              <Label htmlFor="email" className="text-sm md:text-base font-medium text-slate-700">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => onInputChange('email', e.target.value)}
                placeholder="seu@email.com"
                className="mt-1.5 h-12 text-sm md:text-base border-slate-300 focus:border-primary-500 focus:ring-primary-500"
              />
              <p className="text-xs md:text-sm text-slate-500 mt-1.5">
                Você pode alterar o e-mail se desejar
              </p>
            </div>

            <div>
              <Label htmlFor="cpf" className="text-sm md:text-base font-medium text-slate-700">
                CPF
              </Label>
              <Input
                id="cpf"
                value={maskCPF(formData.cpf)}
                onChange={(e) => onInputChange('cpf', formatCPF(e.target.value))}
                placeholder="000.***.**0-00"
                className="mt-1.5 h-12 text-sm md:text-base border-slate-300 bg-slate-50"
                readOnly
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
            <div>
              <Label htmlFor="dataNascimento" className="text-sm md:text-base font-medium text-slate-700">
                Data de Nascimento
              </Label>
              <Input
                id="dataNascimento"
                type="date"
                value={formData.dataNascimento}
                onChange={(e) => onInputChange('dataNascimento', e.target.value)}
                className="mt-1.5 h-12 text-sm md:text-base border-slate-300 bg-slate-50"
                readOnly
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
                required
              />
              <p className="text-xs md:text-sm text-slate-500 mt-1.5">
                Você receberá a confirmação de inscrição via WhatsApp
              </p>
            </div>
          </div>
        </div>

        <div className="bg-accent-50 border-l-4 border-accent-400 p-3 md:p-4 rounded mt-4">
          <p className="text-xs md:text-sm text-slate-700">
            <strong className="text-accent-700">⚠️ Importante:</strong> O campo WhatsApp é obrigatório. Verifique se todos os dados estão corretos antes de prosseguir.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Etapa 2: Tipo de Participação e Modalidade
interface StepTipoParticipacaoProps {
  tipoParticipacao: string
  modalidadeCorrida: string
  onTipoChange: (value: string) => void
  onModalidadeChange: (value: string) => void
}

function StepTipoParticipacao({ tipoParticipacao, modalidadeCorrida, onTipoChange, onModalidadeChange }: StepTipoParticipacaoProps) {
  return (
    <Card className="shadow-xl border-2 border-primary-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="bg-gradient-to-r from-primary-50 to-sky-50 border-b border-primary-100">
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl text-slate-800">
          <Gift className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
          Tipo de Participação
        </CardTitle>
        <CardDescription className="text-sm md:text-base">
          Escolha como você deseja participar dos eventos
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Seção A - Seleção do Tipo de Participação */}
        <div className="space-y-4">
          <Label className="text-base md:text-lg font-semibold text-slate-700">
            Selecione uma opção: *
          </Label>
          <RadioGroup
            value={tipoParticipacao}
            onValueChange={(value) => {
              onTipoChange(value)
              // Limpa a modalidade se não for corrida
              if (value !== 'corrida-natal') {
                onModalidadeChange('')
              }
            }}
            className="space-y-3 md:space-y-4"
          >
            {/* Opção 1 - Corrida + Natal */}
            <label
              className={`flex items-start gap-3 md:gap-4 p-4 md:p-5 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                tipoParticipacao === 'corrida-natal'
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-slate-200 hover:border-primary-300'
              }`}
            >
              <RadioGroupItem value="corrida-natal" id="corrida-natal" className="mt-1 w-5 h-5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-5 h-5 text-primary-600" />
                  <span className="font-bold text-base md:text-lg text-slate-800">
                    Participar da corrida e da comemoração de Natal
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-600">
                  Você participará da corrida e receberá a cesta natalina <strong>21 de Dezembro</strong>
                </p>
              </div>
              {tipoParticipacao === 'corrida-natal' && (
                <Check className="w-5 h-5 md:w-6 md:h-6 text-primary-600 flex-shrink-0" />
              )}
            </label>

            {/* Seção B - Seleção da Modalidade de Corrida (Condicional) - DENTRO DO RADIOGROUP */}
            {tipoParticipacao === 'corrida-natal' && (
              <div className="ml-0 pl-4 md:pl-6 border-l-4 border-primary-400 bg-primary-50/50 rounded-r-lg py-4 md:py-5 pr-4 md:pr-5 animate-in fade-in slide-in-from-top-4 duration-500">
                <Label className="text-base md:text-lg font-semibold text-slate-700 flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-primary-600" />
                  Selecione a modalidade de corrida: *
                </Label>
                <RadioGroup
                  value={modalidadeCorrida}
                  onValueChange={onModalidadeChange}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4"
                >
                  {/* 3KM */}
                  <label
                    className={`flex flex-col items-center justify-center gap-2 p-4 md:p-5 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                      modalidadeCorrida === '3km'
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : 'border-slate-200 hover:border-primary-300'
                    }`}
                  >
                    <RadioGroupItem value="3km" id="3km" className="w-5 h-5" />
                    <span className="font-bold text-2xl md:text-3xl text-primary-600">3KM</span>
                    <span className="text-xs md:text-sm text-slate-600 text-center">Caminhada ou Corrida Leve</span>
                    {modalidadeCorrida === '3km' && (
                      <Check className="w-5 h-5 text-primary-600 mt-1" />
                    )}
                  </label>

                  {/* 5KM */}
                  <label
                    className={`flex flex-col items-center justify-center gap-2 p-4 md:p-5 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                      modalidadeCorrida === '5km'
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : 'border-slate-200 hover:border-primary-300'
                    }`}
                  >
                    <RadioGroupItem value="5km" id="5km" className="w-5 h-5" />
                    <span className="font-bold text-2xl md:text-3xl text-primary-600">5KM</span>
                    <span className="text-xs md:text-sm text-slate-600 text-center">Corrida Intermediária</span>
                    {modalidadeCorrida === '5km' && (
                      <Check className="w-5 h-5 text-primary-600 mt-1" />
                    )}
                  </label>

                  {/* 10KM */}
                  <label
                    className={`flex flex-col items-center justify-center gap-2 p-4 md:p-5 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                      modalidadeCorrida === '10km'
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : 'border-slate-200 hover:border-primary-300'
                    }`}
                  >
                    <RadioGroupItem value="10km" id="10km" className="w-5 h-5" />
                    <span className="font-bold text-2xl md:text-3xl text-primary-600">10KM</span>
                    <span className="text-xs md:text-sm text-slate-600 text-center">Corrida Avançada</span>
                    {modalidadeCorrida === '10km' && (
                      <Check className="w-5 h-5 text-primary-600 mt-1" />
                    )}
                  </label>
                </RadioGroup>
              </div>
            )}

            {/* Opção 2 - Apenas Natal */}
            <label
              className={`flex items-start gap-3 md:gap-4 p-4 md:p-5 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                tipoParticipacao === 'apenas-natal'
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-slate-200 hover:border-primary-300'
              }`}
            >
              <RadioGroupItem value="apenas-natal" id="apenas-natal" className="mt-1 w-5 h-5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="w-5 h-5 text-accent-600" />
                  <span className="font-bold text-base md:text-lg text-slate-800">
                    Participar apenas da comemoração de Natal
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-600">
                  Você receberá a cesta natalina dia <strong>21 de Dezembro</strong>
                </p>
              </div>
              {tipoParticipacao === 'apenas-natal' && (
                <Check className="w-5 h-5 md:w-6 md:h-6 text-primary-600 flex-shrink-0" />
              )}
            </label>

            {/* Opção 3 - Retirar Cesta */}
            <label
              className={`flex items-start gap-3 md:gap-4 p-4 md:p-5 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                tipoParticipacao === 'retirar-cesta'
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-slate-200 hover:border-primary-300'
              }`}
            >
              <RadioGroupItem value="retirar-cesta" id="retirar-cesta" className="mt-1 w-5 h-5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="w-5 h-5 text-slate-600" />
                  <span className="font-bold text-base md:text-lg text-slate-800">
                    Não participar de nenhum evento e retirar a cesta natalina na Farmace
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-600">
                  Retirada disponível nos dias <strong>22 ou 23 de dezembro/2025</strong>
                </p>
              </div>
              {tipoParticipacao === 'retirar-cesta' && (
                <Check className="w-5 h-5 md:w-6 md:h-6 text-primary-600 flex-shrink-0" />
              )}
            </label>
          </RadioGroup>
        </div>
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

// Etapa 4: Regulamento
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
            <h3 className="font-bold text-base md:text-lg text-slate-900 mb-3 text-center">
              REGULAMENTO - II CORRIDA DA QUALIDADE FARMACE
            </h3>

            <div className="text-center mb-4">
              <h4 className="font-bold text-sm md:text-base text-slate-900 mb-1">
                BARBALHA-CE
              </h4>
              <p className="text-xs md:text-sm font-semibold text-slate-800">
                Dia 21 de dezembro de 2025
              </p>
            </div>

            <section>
              <h4 className="font-semibold text-sm md:text-base text-slate-800 mb-2">1. O EVENTO</h4>
              <p className="text-xs md:text-sm leading-relaxed mb-2">
                Hábitos saudáveis, como boa alimentação, exercícios físicos, melhoram a qualidade de vida
                dos colaboradores de empresas. Pensando nisto, a FARMACE no intuito em melhorar a
                qualidade de vida do seu quadro de funcionários, comemora o encerramento do ano e da
                Semana da Qualidade da empresa, com uma corrida.
              </p>
              <p className="text-xs md:text-sm leading-relaxed">
                Diante do exposto, será realizada uma corrida no dia 21 de dezembro de 2025, com local
                de largada as 7:00 da manhã, na própria FARMACE.
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-sm md:text-base text-slate-800 mb-2">2. PARTICIPANTES E PROVAS</h4>
              <p className="text-xs md:text-sm leading-relaxed mb-2">
                Estarão habilitados a correr a CORRIDA DA FARMACE- 2025
              </p>
              <p className="text-xs md:text-sm leading-relaxed mb-2">
                Funcionários a partir de 16 anos (completos ou a serem completados em 2025), para os 3k
                e 5K e 18 anos para os 10k.
              </p>
              <p className="text-xs md:text-sm leading-relaxed mb-2">As provas serão:</p>
              <ul className="list-disc list-inside text-xs md:text-sm space-y-1 ml-2">
                <li>Categoria geral, DISTANCIA 3KM, sem premiação em troféus. Corrida e Caminhada inclusiva.</li>
                <li>Categoria geral, Distância de 5K, os 3 primeiros gerais, masculino e feminino, premiados com troféus</li>
                <li>Distancia 10K os 3 premiados na geral, masculino e feminino, serão premiados, com troféus.</li>
              </ul>
            </section>

            <section>
              <h4 className="font-semibold text-sm md:text-base text-slate-800 mb-2">3. PREMIAÇÕES</h4>
              <p className="text-xs md:text-sm leading-relaxed">
                Troféus aos vencedores, geral 5k e 10k, e medalhas finisher somente aos concluintes dos
                percursos. Poderão ser oferecidos também eventuais brindes de parceiros aos vencedores.
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-sm md:text-base text-slate-800 mb-2">4. SERVIÇOS AOS PARTICIPANTES</h4>
              <p className="text-xs md:text-sm leading-relaxed mb-2">
                Entrega de medalhas aos que concluirem a prova, chip, camisetas, número de peito,
                hidratação, alimentação, resultados, e eventuais brindes que os patrocinadores ofereçam para
                o kit. A entrega dos kits, acontecerá no dia 18/12 e 19/12, na sede da Farmace, das 10:30 às
                19:30 horas. No ato da retirada, obrigatória a apresentação do documento de identidade.{' '}
                <strong>NÃO HAVERA ENTREGA DE KITS, APÓS A DATA E O HORARIO ESPECIFICADO, SOB HIPOTESE
                ALGUMA.</strong>
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-sm md:text-base text-slate-800 mb-2">5. INSCRIÇÕES</h4>
              <p className="text-xs md:text-sm leading-relaxed mb-2">
                As inscrições poderão ser realizadas via site da empresa.
              </p>
              <p className="text-xs md:text-sm leading-relaxed">
                <strong>INICIO DAS INSCRIÇÕES:</strong> dia 31 de outubro de 2025
              </p>
              <p className="text-xs md:text-sm leading-relaxed">
                <strong>TERMINO DAS INSCRIÇÕES:</strong> Dia 10 de novembro de 2025
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-sm md:text-base text-slate-800 mb-2">6. ENTREGA DE RESULTADOS E MEDALHAS</h4>
              <p className="text-xs md:text-sm leading-relaxed mb-2">
                Os resultados completos serão divulgados pelo site oficial da FARMACE, www.farmace.com.br.
              </p>
              <p className="text-xs md:text-sm leading-relaxed">
                As medalhas serão entregues logo após a prova, apenas para os que completarem o
                percurso e estiverem portando pulseira identificadora. Não haverá entrega posterior de
                medalhas.
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-sm md:text-base text-slate-800 mb-2">7. SISTEMA DE CRONOMETRAGEM E VALIDAÇÃO DOS TEMPOS DE PROVAS</h4>
              <p className="text-xs md:text-sm leading-relaxed">
                Os 3 primeiros por naipe e distancia, serão classificados, pela ordem de chegada, para efeitos
                de classificação. Os demais, pelo tempo liquido.
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-sm md:text-base text-slate-800 mb-2">8. ESTADO DE SAUDE E OBRIGAÇÕES DO ATLETA</h4>
              <p className="text-xs md:text-sm leading-relaxed">
                Ao se inscrever no evento, o atleta admite estar em bom estado de saúde e dá seu aceite
                sobre este regulamento, e também assume total responsabilidade sobre as informações
                fornecidas, sejam de dados de inscrição e tempos de validação. O atleta cede também, seus
                direitos de imagem a prova, sem custo, para serem usadas ou não, no futuro. O número de
                peito, deve estar fixado no tronco de forma visível. O uso de equipamentos sonoro, tais como
                fones e assemelhados, pode levar a desclassificação, também, conforme determina as regras
                da World Athetics. Por ser uma prova com permissão oficial da Federação Cearense, os
                árbitros presentes, podem assim proceder.
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-sm md:text-base text-slate-800 mb-2">9. CANAIS OFICIAIS</h4>
              <p className="text-xs md:text-sm leading-relaxed">
                Os canais oficiais do evento serão consideradas, as mídias sociais da FARMACE, NO INSTAGRAM @farmaceoficial, site da oficial da farmace, www.farmace.com.br.
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-sm md:text-base text-slate-800 mb-2">10. CASOS OMISSOS</h4>
              <p className="text-xs md:text-sm leading-relaxed">
                Casos omissos ao regulamento, a comissão organizadora tem o direito de decidir de forma
                que entender como a mais justa. No caso de duvida, será aplicada as determinações da Norma
                07 da WA/Cbat.
              </p>
            </section>

            <section className="border-t-2 border-slate-300 pt-4 mt-6">
              <h4 className="font-semibold text-sm md:text-base text-slate-800 mb-2">REALIZAÇÃO</h4>
              <p className="text-xs md:text-sm leading-relaxed font-bold text-slate-900">
                FARMACE
              </p>
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
