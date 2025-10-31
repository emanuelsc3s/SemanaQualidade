import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin, Award, Users, Clock, DollarSign, Menu, X, Volume2, VolumeX } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"

export default function Home() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hasUnmutedRef = useRef(false)

  // Ativa som do áudio automaticamente após mover o mouse
  useEffect(() => {
    const handleMouseMove = () => {
      if (!hasUnmutedRef.current && audioRef.current) {
        console.log('🎵 Movimento do mouse detectado, ativando áudio em 2s...')
        setTimeout(() => {
          if (audioRef.current) {
            console.log('🎵 Desmutando áudio...')
            console.log('🎵 Estado do áudio - paused:', audioRef.current.paused, 'muted:', audioRef.current.muted, 'volume:', audioRef.current.volume)
            audioRef.current.muted = false
            setIsMuted(false)
            hasUnmutedRef.current = true
            // Garante que o áudio está tocando após desmutar
            audioRef.current.play().then(() => {
              console.log('✅ Áudio reproduzindo com sucesso!')
              console.log('🎵 Volume atual:', audioRef.current?.volume)
            }).catch(error => {
              console.log('❌ Erro ao tentar reproduzir áudio:', error)
            })
          }
        }, 2000)
        // Remove listener após primeira execução
        document.removeEventListener('mousemove', handleMouseMove)
      }
    }

    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // Controla a velocidade de reprodução do vídeo do hero
  const handleVideoLoad = () => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5 // 50% da velocidade normal (slow motion)
    }
  }

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY

      // Se estiver no topo, sempre mostrar
      if (currentScrollY <= 10) {
        setIsVisible(true)
      }
      // Se scrollando para baixo, esconder
      else if (currentScrollY > lastScrollY) {
        setIsVisible(false)
        setMobileMenuOpen(false) // Fechar menu mobile ao esconder
      }
      // Se scrollando para cima, mostrar
      else {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', controlNavbar)

    // Cleanup
    return () => {
      window.removeEventListener('scroll', controlNavbar)
    }
  }, [lastScrollY])

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
            const newMutedState = !isMuted
            audioRef.current.muted = newMutedState
            setIsMuted(newMutedState)

            // Se está desmutando, garante que o áudio está tocando
            if (!newMutedState) {
              audioRef.current.play().catch(error => {
                console.log('Erro ao tentar reproduzir áudio:', error)
              })
            }
          }
        }}
        className="fixed bottom-6 right-6 z-50 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 transform hover:scale-110 border-2 border-white/20 backdrop-blur-sm"
        aria-label={isMuted ? "Ativar som" : "Desativar som"}
      >
        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6 animate-pulse" />}
      </button>

      {/* Floating Liquid Glass Header */}
      <header className={`fixed left-4 right-4 z-50 transition-all duration-500 ${
        isVisible ? 'top-4 opacity-100' : '-top-24 opacity-0'
      }`}>
        <div className="container mx-auto">
          <div className="relative bg-white/10 backdrop-blur rounded-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
            <div className="relative flex items-center justify-between h-20 px-6">
              {/* Logo with glass effect */}
              <div className="flex-shrink-0 transition-all duration-300 hover:scale-105 hover:drop-shadow-[0_0_8px_rgba(36,71,137,0.3)]">
                <img
                  src="https://farmace.com.br/wp-content/uploads/2023/12/cropped-big-logo-farmace.png"
                  alt="Farmace"
                  className="h-12 w-auto drop-shadow-lg"
                  style={{ maxHeight: '48px' }}
                />
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-2">
                <a
                  href="#home"
                  className="px-5 py-2.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] hover:text-[#0a588a] font-light hover:font-bold transition-all duration-300 rounded-xl hover:bg-white/20 cursor-pointer relative group"
                  onClick={(e) => {
                    e.preventDefault()
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  Home
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-sky-400 to-blue-500 group-hover:w-3/4 transition-all duration-300 rounded-full shadow-lg"></span>
                </a>
                <a
                  href="#info"
                  className="px-5 py-2.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] hover:text-[#0a588a] font-light hover:font-bold transition-all duration-300 rounded-xl hover:bg-white/20 cursor-pointer relative group"
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById('info')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Evento
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-sky-400 to-blue-500 group-hover:w-3/4 transition-all duration-300 rounded-full shadow-lg"></span>
                </a>
                <a
                  href="#edicao-anterior"
                  className="px-5 py-2.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] hover:text-[#0a588a] font-light hover:font-bold transition-all duration-300 rounded-xl hover:bg-white/20 cursor-pointer relative group"
                >
                  Edição Anterior
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-sky-400 to-blue-500 group-hover:w-3/4 transition-all duration-300 rounded-full shadow-lg"></span>
                </a>
                <a
                  href="#duvidas"
                  className="px-5 py-2.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] hover:text-[#0a588a] font-light hover:font-bold transition-all duration-300 rounded-xl hover:bg-white/20 cursor-pointer relative group"
                >
                  Dúvidas
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-sky-400 to-blue-500 group-hover:w-3/4 transition-all duration-300 rounded-full shadow-lg"></span>
                </a>
                <a
                  href="#contato"
                  className="px-5 py-2.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] hover:text-[#0a588a] font-light hover:font-bold transition-all duration-300 rounded-xl hover:bg-white/20 cursor-pointer relative group"
                >
                  Contato
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-sky-400 to-blue-500 group-hover:w-3/4 transition-all duration-300 rounded-full shadow-lg"></span>
                </a>

                {/* Liquid Glass CTA Button */}
                <div className="ml-4 relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-accent-400 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                  <Button
                    onClick={() => navigate('/loginInscricao')}
                    className="relative bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold px-8 py-2.5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 backdrop-blur-sm"
                  >
                    Inscreva-se
                  </Button>
                </div>
              </nav>

              {/* Mobile Menu Button - Glass Effect */}
              <button
                className="lg:hidden p-3 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] hover:bg-white/20 rounded-xl transition-all duration-300"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Liquid Glass */}
        {mobileMenuOpen && (
          <div className="lg:hidden container mx-auto mt-2 bg-white/10 backdrop-blur rounded-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] overflow-hidden">
            <nav className="px-4 py-4 flex flex-col gap-1">
              <a
                href="#home"
                className="px-5 py-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] hover:text-[#0a588a] hover:bg-white/20 font-light hover:font-bold transition-all duration-300 rounded-xl cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  setMobileMenuOpen(false)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                Home
              </a>
              <a
                href="#info"
                className="px-5 py-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] hover:text-[#0a588a] hover:bg-white/20 font-light hover:font-bold transition-all duration-300 rounded-xl cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  setMobileMenuOpen(false)
                  document.getElementById('info')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Evento
              </a>
              <a
                href="#edicao-anterior"
                className="px-5 py-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] hover:text-[#0a588a] hover:bg-white/20 font-light hover:font-bold transition-all duration-300 rounded-xl cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                Edição Anterior
              </a>
              <a
                href="#duvidas"
                className="px-5 py-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] hover:text-[#0a588a] hover:bg-white/20 font-light hover:font-bold transition-all duration-300 rounded-xl cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dúvidas
              </a>
              <a
                href="#contato"
                className="px-5 py-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] hover:text-[#0a588a] hover:bg-white/20 font-light hover:font-bold transition-all duration-300 rounded-xl cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contato
              </a>
              <div className="mt-2 relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-accent-400 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    navigate('/loginInscricao')
                  }}
                  className="relative w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold py-3 shadow-lg border-0"
                >
                  Inscreva-se
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen text-white pt-20">
        {/* Background Video */}
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            onLoadedMetadata={handleVideoLoad}
            className="w-full h-full object-cover"
          >
            <source src="/HeroMulherCorrendo.mp4" type="video/mp4" />
            Seu navegador não suporta vídeo HTML5.
          </video>
        </div>

        <div className="relative container mx-auto px-4 py-16 md:py-24">

          {/* Mobile hero image */}
          <div className="md:hidden mb-8 relative">
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=600&auto=format&fit=crop"
                alt="Corredor em ação"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-600/80 via-primary-500/40 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                  <p className="text-white font-bold text-sm">5K • 10K • CAMINHADA</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center md:text-left">
              {/* Texto principal do Hero */}
              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[64px] font-extrabold leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.3)]"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontStyle: 'italic',
                  fontWeight: 800
                }}
              >
                II CORRIDA - QUALIDADE EM CADA METRO SAÚDE EM CADA PASSO
              </h1>

              <div className="flex flex-col sm:flex-row gap-4 pt-8 md:pt-12 justify-center md:justify-start">
                <Button
                  size="xl"
                  onClick={() => navigate('/loginInscricao')}
                  className="bg-accent-400 hover:bg-accent-500 text-slate-900 font-bold shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  INSCREVA-SE AGORA
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                  onClick={() => document.getElementById('info')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  SAIBA MAIS
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Info Section */}
      <section id="info" className="py-16 md:py-24 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Informações do Evento
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Confira todos os detalhes sobre a II Corrida e Caminhada da Qualidade FARMACE
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 border-primary-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Data</h3>
                  <p className="text-slate-600">A confirmar</p>
                  <p className="text-sm text-slate-500">Semana da Qualidade 2025</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Clock className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Horário</h3>
                  <p className="text-slate-600">Largada: 7h00</p>
                  <p className="text-sm text-slate-500">Concentração: 6h30</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Local</h3>
                  <p className="text-slate-600">FARMACE</p>
                  <p className="text-sm text-slate-500">Local a confirmar</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-accent-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-accent-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Investimento</h3>
                  <p className="text-slate-600 text-xl font-bold">R$ 35,00</p>
                  <p className="text-sm text-slate-500">Por participante</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-accent-100 rounded-lg">
                  <Award className="w-6 h-6 text-accent-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Modalidades</h3>
                  <p className="text-slate-600">5K e 10K</p>
                  <p className="text-sm text-slate-500">Corrida e Caminhada</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-accent-100 rounded-lg">
                  <Users className="w-6 h-6 text-accent-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Kit do Atleta</h3>
                  <p className="text-slate-600">Camiseta + Número</p>
                  <p className="text-sm text-slate-500">Retirada antecipada</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary-500 to-sky-400 rounded-2xl p-8 md:p-12 text-white text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Garanta sua vaga agora!
          </h3>
          <p className="text-lg md:text-xl mb-8 text-white/90">
            Inscrições limitadas. Não perca essa oportunidade de fazer parte deste evento incrível!
          </p>
          <Button
            size="xl"
            onClick={() => navigate('/loginInscricao')}
            className="bg-accent-400 hover:bg-accent-500 text-slate-900 font-bold shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            FAZER INSCRIÇÃO
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <img
            src="https://farmace.com.br/wp-content/uploads/2023/12/cropped-big-logo-farmace.png"
            alt="Farmace"
            style={{ maxWidth: '150px', paddingInline: '10px', maxHeight: 'inherit' }}
            className="mx-auto mb-4"
          />
          <p className="text-slate-400">
            © 2025 FARMACE - II Corrida e Caminhada da Qualidade
          </p>
        </div>
      </footer>
    </div>
  )
}
