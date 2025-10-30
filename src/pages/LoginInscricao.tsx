import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { ArrowLeft, Mail, Lock } from "lucide-react"

export default function LoginInscricao() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: "",
    senha: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aqui você pode adicionar a lógica de autenticação
    console.log("Login:", formData)
    // Após autenticação bem-sucedida, redirecionar para a página de inscrição
    navigate('/inscricao')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen flex">
      {/* Seção Esquerda - Vídeo de Branding - Proporção 9:16 (Story Instagram) */}
      <div className="hidden lg:flex lg:w-[56.25vh] lg:max-w-[40%] relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/0104.mp4" type="video/mp4" />
          Seu navegador não suporta vídeos HTML5.
        </video>
        
        {/* Overlay com gradiente para melhor legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        
        {/* Logo e Texto sobre o vídeo */}
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <img
            src="https://farmace.com.br/wp-content/uploads/2023/12/cropped-big-logo-farmace.png"
            alt="Farmace"
            className="h-16 w-auto mb-8 drop-shadow-2xl"
          />
          <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">
            II Corrida e Caminhada da Qualidade
          </h1>
          <p className="text-xl text-white/90 drop-shadow-md">
            Faça seu login para realizar a inscrição
          </p>
        </div>
      </div>

      {/* Seção Direita - Formulário de Login */}
      <div className="w-full lg:flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-sky-50">
        <div className="w-full max-w-md">
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
            <h2 className="text-2xl font-bold text-slate-800">
              II Corrida e Caminhada da Qualidade
            </h2>
          </div>

          {/* Card de Login */}
          <Card className="shadow-xl border-2 border-primary-100">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center text-slate-800">
                Login
              </CardTitle>
              <p className="text-center text-slate-600">
                Entre com suas credenciais para continuar
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Campo Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    E-mail
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
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

                {/* Botão de Login */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Entrar
                </Button>

                {/* Divisor */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-500">
                      Não tem uma conta?
                    </span>
                  </div>
                </div>

                {/* Botão Criar Conta */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-2 border-primary-500 text-primary-600 hover:bg-primary-50 font-semibold text-lg"
                  onClick={() => navigate('/inscricao')}
                >
                  Criar Conta
                </Button>
              </form>
            </CardContent>
          </Card>

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

