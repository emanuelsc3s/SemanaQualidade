import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useNavigate } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import { ArrowLeft, User, Lock, HelpCircle, Volume2, VolumeX, AlertCircle } from "lucide-react"
import funcionariosData from "../../data/funcionarios.json"
import { supabase } from "@/services/supabase"

// Tipo para os dados do funcionário
interface Funcionario {
  MATRICULA: string
  NOME: string
  CPF: string
  NASCIMENTO: string
  EMAIL: string // ✅ NOVO: Campo de email do funcionário
}

// Função para gerar a senha esperada baseada no CPF e data de nascimento
const gerarSenha = (cpf: string, dataNascimento: string): string => {
  // Pega os 3 últimos dígitos do CPF
  const ultimosDigitosCPF = cpf.slice(-3)

  // Extrai dia e mês da data de nascimento (formato: DD.MM.YYYY HH:MM)
  const [dia, mes] = dataNascimento.split('.')
  const ddmm = `${dia}${mes}`

  return `${ultimosDigitosCPF}${ddmm}`
}

// Função para normalizar matrícula (remove zeros à esquerda)
const normalizarMatricula = (matricula: string): string => {
  return matricula.replace(/^0+/, '') || '0'
}

// Função para formatar matrícula com 6 dígitos (adiciona zeros à esquerda)
const formatarMatricula6Digitos = (matricula: string): string => {
  const matriculaNormalizada = normalizarMatricula(matricula)
  return matriculaNormalizada.padStart(6, '0')
}

// Função para formatar data/hora de forma legível
const formatarDataHora = (dataISO: string): string => {
  const data = new Date(dataISO)
  const dia = data.getDate().toString().padStart(2, '0')
  const mes = (data.getMonth() + 1).toString().padStart(2, '0')
  const ano = data.getFullYear()
  const horas = data.getHours().toString().padStart(2, '0')
  const minutos = data.getMinutes().toString().padStart(2, '0')

  return `${dia}/${mes}/${ano} às ${horas}:${minutos}`
}

export default function LoginInscricao() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    matricula: "",
    senha: ""
  })
  const [showHelp, setShowHelp] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [showAlreadyRegisteredDialog, setShowAlreadyRegisteredDialog] = useState(false)
  const [inscricaoExistente, setInscricaoExistente] = useState<{
    dataInscricao: string
    matricula: string
  } | null>(null)
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hasUnmutedRef = useRef(false)

  // Ativa som automaticamente após primeira interação do usuário
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasUnmutedRef.current && videoRef.current) {
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.muted = false
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Remove espaços em branco
    const matriculaDigitada = formData.matricula.trim()
    const senhaDigitada = formData.senha.trim()

    // Busca o funcionário no JSON
    const funcionarios = funcionariosData.RecordSet as Funcionario[]
    const funcionario = funcionarios.find(f => {
      // Normaliza a matrícula (remove zeros à esquerda para comparação)
      const matriculaNormalizada = normalizarMatricula(f.MATRICULA)
      const matriculaDigitadaNormalizada = normalizarMatricula(matriculaDigitada)

      return matriculaNormalizada === matriculaDigitadaNormalizada
    })

    if (!funcionario) {
      // Matrícula não encontrada
      setShowErrorDialog(true)
      return
    }

    // Gera a senha esperada baseada no CPF e data de nascimento
    const senhaEsperada = gerarSenha(funcionario.CPF, funcionario.NASCIMENTO)

    if (senhaDigitada === senhaEsperada) {
      // Login bem-sucedido - AGORA verifica se já está inscrito
      console.log("✅ Login bem-sucedido:", funcionario.NOME, "| Email:", funcionario.EMAIL)

      // Formata a matrícula com 6 dígitos para consultar no banco
      const matriculaFormatada = formatarMatricula6Digitos(funcionario.MATRICULA)
      console.log("🔍 [Login] Verificando inscrição para matrícula:", matriculaFormatada)
      console.log("🔍 [Login] Matrícula original do funcionário:", funcionario.MATRICULA)

      setIsCheckingRegistration(true)

      try {
        // Consulta o Supabase para verificar se já existe inscrição
        console.log("📡 [Login] Iniciando consulta ao Supabase...")
        console.log("📡 [Login] Filtros: matricula =", matriculaFormatada, "AND deleted_at IS NULL")

        const { data, error, count } = await supabase
          .from('tbcorrida')
          .select('corrida_id, data_inscricao, matricula, created_at, deleted_at', { count: 'exact' })
          .eq('matricula', matriculaFormatada)

        console.log("📡 [Login] Resposta do Supabase:")
        console.log("  - Total de registros encontrados:", count)
        console.log("  - Dados retornados:", data)
        console.log("  - Erro:", error)

        setIsCheckingRegistration(false)

        if (error) {
          console.error('❌ [Login] Erro ao consultar Supabase:', error)
          console.error('❌ [Login] Detalhes do erro:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
          // Em caso de erro na consulta, BLOQUEIA o prosseguimento para segurança
          alert('Erro ao verificar inscrição. Por favor, tente novamente.')
          return
        }

        // Filtra manualmente registros com deleted_at NULL (inscrições ativas)
        const inscricoesAtivas = data?.filter(registro => registro.deleted_at === null) || []
        console.log("🔍 [Login] Inscrições ativas (deleted_at IS NULL):", inscricoesAtivas.length)

        if (inscricoesAtivas.length > 0) {
          // JÁ EXISTE INSCRIÇÃO ATIVA - Mostra modal de alerta
          const inscricao = inscricoesAtivas[0]
          console.log('⚠️ [Login] Inscrição ativa encontrada:', inscricao)
          setInscricaoExistente({
            dataInscricao: inscricao.data_inscricao || inscricao.created_at || new Date().toISOString(),
            matricula: inscricao.matricula || matriculaFormatada
          })
          setShowAlreadyRegisteredDialog(true)
          return // NÃO redireciona
        }

        // NÃO existe inscrição ativa - Prossegue normalmente
        console.log('✅ [Login] Nenhuma inscrição ativa encontrada, prosseguindo...')

        const colaboradorData = {
          matricula: funcionario.MATRICULA,
          nome: funcionario.NOME,
          cpf: funcionario.CPF,
          dataNascimento: funcionario.NASCIMENTO,
          email: funcionario.EMAIL || '',
          loginTimestamp: new Date().toISOString()
        }

        localStorage.setItem('colaboradorLogado', JSON.stringify(colaboradorData))

        // Redireciona para página de inscrição
        navigate('/inscricao')

      } catch (error) {
        console.error('❌ Erro inesperado ao verificar inscrição:', error)
        setIsCheckingRegistration(false)
        // Em caso de erro, permite prosseguir (fail-safe)
        console.warn('⚠️ Erro inesperado, permitindo prosseguir...')

        const colaboradorData = {
          matricula: funcionario.MATRICULA,
          nome: funcionario.NOME,
          cpf: funcionario.CPF,
          dataNascimento: funcionario.NASCIMENTO,
          email: funcionario.EMAIL || '',
          loginTimestamp: new Date().toISOString()
        }

        localStorage.setItem('colaboradorLogado', JSON.stringify(colaboradorData))
        navigate('/inscricao')
      }
    } else {
      // Senha incorreta
      console.log("Senha esperada:", senhaEsperada, "Senha digitada:", senhaDigitada)
      setShowErrorDialog(true)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleHelpClick = () => {
    setShowHelp(!showHelp)
  }

  return (
    <div className="min-h-screen flex">
      {/* Seção Esquerda - Vídeo de Branding - Proporção 9:16 (Story Instagram) */}
      <div className="hidden lg:flex lg:w-[56.25vh] lg:max-w-[40%] relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/0104.mp4" type="video/mp4" />
          Seu navegador não suporta vídeos HTML5.
        </video>

        {/* Botão de Controle de Som */}
        <button
          onClick={() => {
            if (videoRef.current) {
              videoRef.current.muted = !isMuted
              setIsMuted(!isMuted)
            }
          }}
          className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-sm text-white rounded-full p-3 hover:bg-black/70 transition-all duration-300"
          aria-label={isMuted ? "Ativar som" : "Desativar som"}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        
        {/* Overlay com gradiente para melhor legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        
        {/* Texto sobre o vídeo */}
        <div className="login-video-section-short relative z-10 flex flex-col justify-end p-12 text-white">
          <h1 className="login-video-title-short mb-0 drop-shadow-lg font-bold" style={{ fontSize: '32px' }}>
            II Corrida - 2025
          </h1>
          <p className="login-video-subtitle-short text-xl text-white/90 drop-shadow-md">
            Faça seu login para realizar a inscrição
          </p>
        </div>
      </div>

      {/* Seção Direita - Formulário de Login */}
      <div className="login-container-short w-full lg:flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-sky-50 relative">
        {/* Botão de Ajuda Flutuante */}
        <button
          onClick={handleHelpClick}
          className="login-help-button-short fixed top-4 right-4 lg:absolute lg:top-8 lg:right-8 z-50
                     bg-primary-600 text-white rounded-full px-5 py-3 shadow-lg
                     hover:bg-primary-700 hover:scale-105 transition-all duration-300
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                     flex items-center gap-2 font-medium text-sm"
          aria-label="Ajuda para fazer login"
        >
          <HelpCircle className="w-5 h-5" />
          <span>Posso Ajudar?</span>
        </button>

        <div className="w-full max-w-md">
          {/* Logo FARMACE - Topo da área de login */}
          <div className="flex justify-center mb-8">
            <img
              src="https://farmace.com.br/wp-content/uploads/2023/12/cropped-big-logo-farmace.png"
              alt="Farmace"
              className="login-logo-short h-16 w-auto mb-8 drop-shadow-2xl"
            />
          </div>

          {/* Botão Voltar */}
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="login-back-button-short mb-6 text-slate-600 hover:text-primary-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Home
          </Button>

          {/* Logo Mobile */}
          <div className="lg:hidden mb-8 text-center">
            <img
              src="https://farmace.com.br/wp-content/uploads/2023/12/cropped-big-logo-farmace.png"
              alt="Farmace"
              className="login-mobile-logo-short h-12 w-auto mx-auto mb-4"
            />
            <h2 className="login-mobile-title-short text-slate-800 font-bold" style={{ fontSize: '32px' }}>
              II Corrida - 2025
            </h2>
          </div>

          {/* Card de Login */}
          <Card className="login-card-short shadow-xl border-2 border-primary-100">
            <CardHeader className="login-card-header-short space-y-1">
              <CardTitle className="login-card-title-short text-2xl font-bold text-center" style={{ color: '#242F65' }}>
                Seja Bem-Vindo!
              </CardTitle>
              <p className="login-card-subtitle-short text-center text-slate-600">
                Entre com suas credenciais para continuar
              </p>
            </CardHeader>
            <CardContent className="login-card-content-short">
              <form onSubmit={handleSubmit} className="login-form-short space-y-6">
                {/* Campo Matrícula */}
                <div className="space-y-2">
                  <Label htmlFor="matricula" className="login-label-short text-slate-700 font-medium">
                    Matrícula
                  </Label>
                  <div className="relative">
                    <User className="login-input-icon-short absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="matricula"
                      name="matricula"
                      type="text"
                      inputMode="numeric"
                      placeholder="Digite sua matrícula (ex: 001234 ou 1234)"
                      value={formData.matricula}
                      onChange={handleChange}
                      required
                      className="login-input-short pl-10 h-12 border-slate-300 focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Campo Senha */}
                <div className="space-y-2">
                  <Label htmlFor="senha" className="login-label-short text-slate-700 font-medium">
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="login-input-icon-short absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="senha"
                      name="senha"
                      type="password"
                      inputMode="numeric"
                      placeholder="3 últimos dígitos CPF + Dia Mês Nascimento"
                      value={formData.senha}
                      onChange={handleChange}
                      required
                      className="login-input-short pl-10 h-12 border-slate-300 focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Botão de Login */}
                <Button
                  type="submit"
                  disabled={isCheckingRegistration}
                  className="login-submit-button-short w-full h-12 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckingRegistration ? 'Verificando...' : 'Entrar'}
                </Button>

                {/* Link de Ajuda abaixo do botão Entrar */}
                <div className="login-help-link-short mt-4 text-center">
                  <button
                    type="button"
                    onClick={handleHelpClick}
                    className="text-primary-600 hover:text-primary-700 hover:underline text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 mx-auto"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Precisa de ajuda para fazer login?
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Modal de Ajuda */}
          {showHelp && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:absolute lg:inset-auto lg:top-0 lg:right-0 lg:left-0 lg:bottom-0">
              <Card className="w-full max-w-lg shadow-2xl border-2 border-primary-200 animate-in fade-in zoom-in duration-300 bg-white overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <CardTitle className="login-help-modal-title-short text-xl font-bold flex items-center gap-2">
                      <HelpCircle className="w-6 h-6" />
                      Como fazer login?
                    </CardTitle>
                    <button
                      onClick={handleHelpClick}
                      className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                      aria-label="Fechar ajuda"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="login-help-modal-content-short p-6 space-y-4">
                  <div className="space-y-3">
                    <h3 className="login-help-modal-heading-short font-bold text-slate-800 flex items-center gap-2">
                      <span className="bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                      Campo de Login - Número de Matrícula
                    </h3>
                    <p className="login-help-modal-text-short text-slate-600 text-sm ml-8">
                      Para fazer login, utilize seu <strong>número de Matrícula do RH</strong> (número que consta no seu crachá).
                      Você pode digitar o número <strong>com ou sem os zeros à esquerda</strong>.
                    </p>
                    <p className="login-help-modal-text-short text-slate-600 text-sm ml-8 bg-sky-50 border border-sky-200 rounded p-2 mt-2">
                      <strong>Exemplo:</strong> '001234' ou '1234' - ambos são aceitos
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="login-help-modal-heading-short font-bold text-slate-800 flex items-center gap-2">
                      <span className="bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                      Composição da Senha
                    </h3>
                    <p className="login-help-modal-text-short text-slate-600 text-sm ml-8">
                      A senha é formada pelos <strong>3 últimos dígitos do seu CPF</strong> seguidos do <strong>dia e mês do seu nascimento (DDMM)</strong>.
                    </p>
                    <p className="login-help-modal-text-short text-slate-600 text-sm ml-8 bg-sky-50 border border-sky-200 rounded p-2 mt-2">
                      <strong>Exemplo:</strong> Se os últimos dígitos do CPF são '456' e você nasceu em 15 de março, sua senha será '<strong>4561503</strong>'
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="login-help-modal-heading-short font-bold text-slate-800 flex items-center gap-2">
                      <span className="bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                      Problemas para acessar?
                    </h3>
                    <p className="login-help-modal-text-short text-slate-600 text-sm ml-8">
                      Entre em contato com o RH ou TI da FARMACE para obter suas credenciais de acesso.
                    </p>
                  </div>

                  <div className="bg-accent-50 border-l-4 border-accent-400 p-4 rounded mt-6">
                    <p className="login-help-modal-text-short text-sm text-slate-700">
                      <strong className="text-accent-700">⚠️ Importante:</strong> Apenas colaboradores da FARMACE podem se inscrever neste evento.
                    </p>
                  </div>

                  <Button
                    onClick={handleHelpClick}
                    className="login-help-modal-button-short w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    Entendi
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Informações Adicionais */}
          <div className="login-footer-short mt-6 text-center text-sm text-slate-600">
            <p>
              Ao fazer login, você concorda com nossos{" "}
              <a href="#" className="text-primary-600 hover:underline">
                Termos de Uso
              </a>{" "}
              e{" "}
              <a href="#" className="text-primary-600 hover:underline">
                Política de Privacidade
              </a>
            </p>
          </div>
        </div>

        {/* Modal de Erro de Autenticação */}
        <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Erro de Autenticação
              </DialogTitle>
              <DialogDescription className="text-slate-600 pt-2">
                Matrícula ou senha incorreta. Por favor, verifique suas credenciais.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
              <Button
                type="button"
                onClick={() => setShowErrorDialog(false)}
                className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white"
              >
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Inscrição Já Existente */}
        <Dialog open={showAlreadyRegisteredDialog} onOpenChange={setShowAlreadyRegisteredDialog}>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="w-6 h-6" />
                Você já está inscrito!
              </DialogTitle>
              <DialogDescription className="text-slate-600 pt-4 space-y-3">
                <p className="font-medium text-slate-800">
                  Identificamos que você já realizou sua inscrição para a II Corrida FARMACE.
                </p>

                {inscricaoExistente && (
                  <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">Data da inscrição:</span>
                      <br />
                      <span className="text-primary-700 font-medium">
                        {formatarDataHora(inscricaoExistente.dataInscricao)}
                      </span>
                    </p>
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">Matrícula:</span>
                      <br />
                      <span className="text-primary-700 font-medium">
                        {inscricaoExistente.matricula}
                      </span>
                    </p>
                  </div>
                )}

                <div className="bg-accent-50 border-l-4 border-accent-400 p-3 rounded">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold text-accent-700">📱 Atenção:</span>
                    <br />
                    Mais detalhes sobre sua inscrição serão enviados via WhatsApp em breve.
                  </p>
                </div>

                <p className="text-xs text-slate-500 italic">
                  Caso tenha alguma dúvida, entre em contato com a organização do evento.
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
              <Button
                type="button"
                onClick={() => {
                  setShowAlreadyRegisteredDialog(false)
                  setInscricaoExistente(null)
                }}
                className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white"
              >
                Entendi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

