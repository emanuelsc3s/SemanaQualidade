import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Calendar, MapPin, Award, Users, Clock, DollarSign, Menu, X, Volume2, VolumeX } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"

export default function Home() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hasUnmutedRef = useRef(false)

  // Scroll para o topo quando a página é carregada
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
                    INSCREVA-SE
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

      {/* Hero Section - Mobile-First Optimized for Small Screens */}
      <section className="hero-section-short relative overflow-hidden h-screen max-[639px]:!min-h-[600px] max-[639px]:!h-[100svh] sm:max-h-none sm:min-h-screen text-white max-[639px]:!pt-20 pt-24 sm:pt-20 md:pt-24 flex items-center justify-center">
        {/* Background Video */}
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            onLoadedMetadata={handleVideoLoad}
            className="hero-video-short w-full h-full object-cover"
          >
            <source src="/HeroMulherCorrendo.mp4" type="video/mp4" />
            Seu navegador não suporta vídeo HTML5.
          </video>
          {/* Overlay escuro para melhorar legibilidade em mobile */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50 max-[639px]:!from-black/50 max-[639px]:!via-black/40 max-[639px]:!to-black/60"></div>
        </div>

        <div className="hero-container-short relative container mx-auto px-4 max-[639px]:!px-3 sm:px-4 py-2 max-[639px]:!py-4 sm:py-6 md:py-10 lg:py-16 h-full flex items-center">
          <div className="hero-grid-short grid lg:grid-cols-2 gap-3 max-[639px]:!gap-4 sm:gap-6 md:gap-10 lg:gap-12 items-center w-full">
            <div className="hero-content-short space-y-2 max-[639px]:!space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 text-center md:text-left max-[767px]:!pl-0 max-[767px]:!pr-0 md:pl-8 lg:pl-16">
              {/* Texto principal do Hero - Mobile First - COMPACTO */}
              <h1 className="hero-title-short text-[1.4rem] leading-[1.2] max-[639px]:!text-[1.75rem] max-[639px]:!leading-[1.15] xs:text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl sm:leading-tight font-extrabold drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] max-[639px]:!drop-shadow-[0_3px_15px_rgba(0,0,0,0.7)]">
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontStyle: 'normal' }}>
                  <span style={{ fontWeight: 800 }}>CONFRATERNIZAÇÃO</span> <span style={{ fontWeight: 200 }}>E</span>
                </span>
                <br />
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontStyle: 'normal' }}>II CORRIDA</span>
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 200, fontStyle: 'normal' }}> FARMACE</span>
                <br />
                <span
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontStyle: 'normal', display: 'inline-block' }}
                  className="text-accent-400 mt-2 max-[639px]:!mt-1 sm:mt-6 md:mt-10 lg:mt-14"
                >
                  QUALIDADE
                </span>
                <br />
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 200, fontStyle: 'normal' }}>EM CADA METRO</span>
                <br />
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontStyle: 'normal' }} className="text-accent-400">SAÚDE</span>
                <br />
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 200, fontStyle: 'normal' }}>EM CADA PASSO</span>
              </h1>

              <div className="hero-buttons-short flex flex-col sm:flex-row gap-2 max-[639px]:!gap-3 sm:gap-4 pt-3 max-[639px]:!pt-4 sm:pt-6 md:pt-8 lg:pt-10 justify-center md:justify-start w-full sm:w-auto">
                <Button
                  onClick={() => navigate('/loginInscricao')}
                  className="hero-button-short h-11 max-[639px]:!min-h-[48px] max-[639px]:!h-12 sm:h-14 md:h-16 px-5 max-[639px]:!px-6 sm:px-8 md:px-12 text-sm max-[639px]:!text-base sm:text-lg md:text-xl bg-accent-400 hover:bg-accent-500 text-slate-900 font-bold shadow-2xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                >
                  INSCREVA-SE AGORA
                </Button>
                <Button
                  variant="outline"
                  className="hero-button-short h-11 max-[639px]:!min-h-[48px] max-[639px]:!h-12 sm:h-14 md:h-16 px-5 max-[639px]:!px-6 sm:px-8 md:px-12 text-sm max-[639px]:!text-base sm:text-lg md:text-xl bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 w-full sm:w-auto"
                  onClick={() => setModalOpen(true)}
                >
                  SAIBA MAIS
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal "Saiba Mais" */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="w-[90vw] sm:w-[85vw] md:w-[75vw] lg:w-[70vw] max-w-5xl overflow-hidden bg-white/95 backdrop-blur-xl border-2 border-primary-200/50 shadow-2xl rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col max-h-[90vh]">
          <DialogHeader className="flex-shrink-0 space-y-1 sm:space-y-2">
            <DialogTitle className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500 text-center sm:text-left leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              II Corrida Farmace - 2025
            </DialogTitle>
          </DialogHeader>

          <DialogDescription className="flex-1 overflow-y-auto text-xs sm:text-sm md:text-base text-slate-700 leading-relaxed space-y-2 sm:space-y-3 pr-2 scrollbar-thin scrollbar-thumb-primary-300 scrollbar-track-transparent">
            <p className="font-semibold text-primary-700 text-sm sm:text-base md:text-lg">
              Prepare-se para encerrar o ano de 2025 com muita energia, alegria e espírito de equipe!
            </p>

            <p>
              No dia <span className="font-bold text-primary-600">21 de dezembro</span>, vamos celebrar juntos esse momento especial com a <span className="font-bold">II Corrida Farmace</span>. Um evento feito para movimentar o corpo, o coração e fortalecer nossos laços!
            </p>

            <div className="bg-gradient-to-r from-accent-50 to-primary-50 border-l-4 border-accent-400 p-2 sm:p-3 rounded-lg shadow-sm">
              <p className="font-semibold text-slate-800 text-xs sm:text-sm">
                E tem mais: nesse mesmo dia, teremos a <span className="text-accent-700">entrega das cestas natalinas</span> e o <span className="text-accent-700">sorteio de brindes incríveis</span>, deixando nossa comemoração ainda mais especial!
              </p>
            </div>

            <p>
              As inscrições acontecem de <span className="font-bold text-primary-600">31/10 a 10/11</span>. Garanta sua vaga e venha fazer parte dessa grande festa que celebra um ano de conquistas!
            </p>

            <div className="bg-gradient-to-br from-primary-600 to-primary-500 text-white p-2 sm:p-3 md:p-4 rounded-xl shadow-lg">
              <p className="font-bold text-sm sm:text-base md:text-lg mb-1 sm:mb-2">
                🎄 II Cantata de Natal
              </p>
              <p className="text-xs sm:text-sm leading-relaxed">
                E para fechar com chave de ouro, a Farmace convida toda a região do Cariri para a <span className="font-bold">II Cantata de Natal</span>, um espetáculo de encanto e emoção que acontecerá nos dias <span className="font-bold">17, 18 e 19 de dezembro</span>, no <span className="font-bold">Casarão de Dr. Lívio</span>, no centro histórico de Barbalha.
              </p>
              <p className="text-xs sm:text-sm mt-1 sm:mt-2 italic">
                Este será um presente da Farmace para região do Cariri.
              </p>
            </div>

            <p className="text-center font-bold text-sm sm:text-base md:text-lg text-primary-700 pt-2 sm:pt-3 border-t-2 border-primary-200">
              Vamos juntos celebrar a vida, a união e o espírito natalino! 🎉
            </p>
          </DialogDescription>

          <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-200">
            <Button
              onClick={() => {
                setModalOpen(false)
                navigate('/loginInscricao')
              }}
              className="w-full sm:flex-1 h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg bg-gradient-to-r from-accent-400 to-accent-500 hover:from-accent-500 hover:to-accent-600 text-slate-900 font-bold shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              INSCREVA-SE AGORA
            </Button>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 text-sm sm:text-base md:text-lg border-2 border-primary-300 text-primary-700 hover:bg-primary-50 font-semibold"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Info Section */}
      <section id="info" className="py-16 md:py-24 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Informações do Evento
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Confira todos os detalhes sobre a Confraternização e II Corrida
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
                  <p className="text-slate-600"><strong>21 de Dezembro</strong></p>
                  <p className="text-sm text-slate-500">Corrida e Caminhada</p>
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
                  <p className="text-slate-600"><strong>Concentração: 6h30</strong></p>
                  <p className="text-sm text-slate-500"><strong>Largada: 7h00</strong></p>
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
                  <p className="text-slate-600"><strong>FARMACE</strong></p>
                  <p className="text-sm text-slate-500">AV DOUTOR ANTONIO LYRIO CALLOU,S/N, KM 02</p>
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
                  <p className="text-slate-600 text-xl font-bold"><strong>GRATUITO</strong></p>
                  <p className="text-sm text-slate-500">Para Colaboradores</p>
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
                  <p className="text-slate-600"><strong>3KM, 5KM e 10KM</strong></p>
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
                  <p className="text-slate-600"><strong>Camiseta + Número</strong></p>
                  <p className="text-sm text-slate-500">Gratuito</p>
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
