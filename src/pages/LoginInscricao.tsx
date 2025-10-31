import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import { ArrowLeft, User, Lock, HelpCircle, Volume2, VolumeX } from "lucide-react"

export default function LoginInscricao() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    matricula: "",
    senha: ""
  })
  const [showHelp, setShowHelp] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Limpa mensagem de erro anterior
    setErrorMessage("")

    // Validação hardcoded (sem backend por enquanto)
    const MATRICULA_VALIDA = "468"
    const SENHA_VALIDA = "123"
    const NOME_COLABORADOR = "CICERO EMANUEL DA SILVA"

    // Remove espaços em branco e verifica as credenciais
    const matriculaDigitada = formData.matricula.trim()
    const senhaDigitada = formData.senha.trim()

    if (matriculaDigitada === MATRICULA_VALIDA && senhaDigitada === SENHA_VALIDA) {
      // Login bem-sucedido
      // Armazena dados do colaborador no localStorage
      const colaboradorData = {
        matricula: MATRICULA_VALIDA,
        nome: NOME_COLABORADOR,
        loginTimestamp: new Date().toISOString()
      }

      localStorage.setItem('colaboradorLogado', JSON.stringify(colaboradorData))

      console.log("Login bem-sucedido:", NOME_COLABORADOR)

      // Redireciona para página de inscrição
      navigate('/inscricao')
    } else {
      // Credenciais inválidas
      setErrorMessage("Matrícula ou senha incorreta. Por favor, verifique suas credenciais.")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limpa mensagem de erro quando usuário começa a digitar
    if (errorMessage) {
      setErrorMessage("")
    }

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
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <h1 className="mb-0 drop-shadow-lg font-bold" style={{ fontSize: '32px' }}>
            II Corrida - 2025
          </h1>
          <p className="text-xl text-white/90 drop-shadow-md">
            Faça seu login para realizar a inscrição
          </p>
        </div>
      </div>

      {/* Seção Direita - Formulário de Login */}
      <div className="w-full lg:flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-sky-50 relative">
        {/* Botão de Ajuda Flutuante */}
        <button
          onClick={handleHelpClick}
          className="fixed top-4 right-4 lg:absolute lg:top-8 lg:right-8 z-50
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
              className="h-16 w-auto mb-8 drop-shadow-2xl"
            />
          </div>

          {/* Botão Voltar */}
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6 text-slate-600 hover:text-primary-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Home
          </Button>

          {/* Logo Mobile */}
          <div className="lg:hidden mb-8 text-center">
            <img
              src="https://farmace.com.br/wp-content/uploads/2023/12/cropped-big-logo-farmace.png"
              alt="Farmace"
              className="h-12 w-auto mx-auto mb-4"
            />
            <h2 className="text-slate-800 font-bold" style={{ fontSize: '32px' }}>
              II Corrida - 2025
            </h2>
          </div>

          {/* Card de Login */}
          <Card className="shadow-xl border-2 border-primary-100">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center" style={{ color: '#242F65' }}>
                Seja Bem-Vindo!
              </CardTitle>
              <p className="text-center text-slate-600">
                Entre com suas credenciais para continuar
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Campo Matrícula */}
                <div className="space-y-2">
                  <Label htmlFor="matricula" className="text-slate-700 font-medium">
                    Matrícula
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="matricula"
                      name="matricula"
                      type="text"
                      placeholder="Digite sua matrícula (ex: 001234 ou 1234)"
                      value={formData.matricula}
                      onChange={handleChange}
                      required
                      className="pl-10 h-12 border-slate-300 focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Campo Senha */}
                <div className="space-y-2">
                  <Label htmlFor="senha" className="text-slate-700 font-medium">
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="senha"
                      name="senha"
                      type="password"
                      placeholder="••••••••"
                      value={formData.senha}
                      onChange={handleChange}
                      required
                      className="pl-10 h-12 border-slate-300 focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Mensagem de Erro */}
                {errorMessage && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
                    </div>
                  </div>
                )}

                {/* Botão de Login */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Entrar
                </Button>

                {/* Link de Ajuda abaixo do botão Entrar */}
                <div className="mt-4 text-center">
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
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
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
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                      Campo de Login - Número de Matrícula
                    </h3>
                    <p className="text-slate-600 text-sm ml-8">
                      Para fazer login, utilize seu <strong>número de Matrícula do RH</strong> (número que consta no seu crachá).
                      Você pode digitar o número <strong>com ou sem os zeros à esquerda</strong>.
                    </p>
                    <p className="text-slate-600 text-sm ml-8 bg-sky-50 border border-sky-200 rounded p-2 mt-2">
                      <strong>Exemplo:</strong> '001234' ou '1234' - ambos são aceitos
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                      Composição da Senha
                    </h3>
                    <p className="text-slate-600 text-sm ml-8">
                      A senha é formada pelos <strong>3 últimos dígitos do seu CPF</strong> seguidos do <strong>dia e mês do seu nascimento (DDMM)</strong>.
                    </p>
                    <p className="text-slate-600 text-sm ml-8 bg-sky-50 border border-sky-200 rounded p-2 mt-2">
                      <strong>Exemplo:</strong> Se os últimos dígitos do CPF são '456' e você nasceu em 15 de março, sua senha será '<strong>4561503</strong>'
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                      Problemas para acessar?
                    </h3>
                    <p className="text-slate-600 text-sm ml-8">
                      Entre em contato com o RH ou TI da FARMACE para obter suas credenciais de acesso.
                    </p>
                  </div>

                  <div className="bg-accent-50 border-l-4 border-accent-400 p-4 rounded mt-6">
                    <p className="text-sm text-slate-700">
                      <strong className="text-accent-700">⚠️ Importante:</strong> Apenas colaboradores da FARMACE podem se inscrever neste evento.
                    </p>
                  </div>

                  <Button
                    onClick={handleHelpClick}
                    className="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    Entendi
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Informações Adicionais */}
          <div className="mt-6 text-center text-sm text-slate-600">
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
      </div>
    </div>
  )
}

