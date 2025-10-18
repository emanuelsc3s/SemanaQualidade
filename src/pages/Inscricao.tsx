import { useState, FormEvent, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Upload, Check, User, Mail, Phone, CreditCard, MapPin, Shirt } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface FormData {
  nome: string
  email: string
  telefone: string
  cpf: string
  dataNascimento: string
  cep: string
  endereco: string
  cidade: string
  estado: string
  modalidade: string
  tamanho: string
  foto: string
}

interface FormErrors {
  [key: string]: string
}

export default function Inscricao() {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    dataNascimento: '',
    cep: '',
    endereco: '',
    cidade: '',
    estado: '',
    modalidade: '5k',
    tamanho: 'M',
    foto: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [photoPreview, setPhotoPreview] = useState<string>('')

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

  const validateForm = (): boolean => {
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
    if (!formData.foto) newErrors.foto = 'Foto é obrigatória'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (validateForm()) {
      const inscricoes = JSON.parse(localStorage.getItem('inscricoes') || '[]')
      const novaInscricao = {
        ...formData,
        id: Date.now(),
        dataInscricao: new Date().toISOString(),
        numeroParticipante: (inscricoes.length + 1).toString().padStart(4, '0')
      }
      inscricoes.push(novaInscricao)
      localStorage.setItem('inscricoes', JSON.stringify(inscricoes))
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 flex items-center justify-center p-4">
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
                #{(JSON.parse(localStorage.getItem('inscricoes') || '[]').length).toString().padStart(4, '0')}
              </p>
            </div>
            <div className="bg-accent-50 border-2 border-accent-200 p-4 rounded-lg">
              <p className="text-sm font-semibold text-slate-900 mb-2">Valor da Inscrição</p>
              <p className="text-2xl font-bold text-accent-700">R$ 35,00</p>
              <p className="text-xs text-slate-600 mt-2">
                Em breve você receberá as instruções de pagamento no e-mail cadastrado.
              </p>
            </div>
            <p className="text-sm text-slate-600 text-center">
              Enviamos um e-mail de confirmação para <strong>{formData.email}</strong> com todas as informações.
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Pessoais */}
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
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    name="telefone"
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

          {/* Informações da Corrida */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shirt className="w-5 h-5" />
                Informações da Corrida
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="modalidade">Modalidade *</Label>
                  <select
                    id="modalidade"
                    name="modalidade"
                    value={formData.modalidade}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="5k">5K - Corrida</option>
                    <option value="5k-caminhada">5K - Caminhada</option>
                    <option value="10k">10K - Corrida</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="tamanho">Tamanho da Camiseta *</Label>
                  <select
                    id="tamanho"
                    name="tamanho"
                    value={formData.tamanho}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="PP">PP</option>
                    <option value="P">P</option>
                    <option value="M">M</option>
                    <option value="G">G</option>
                    <option value="GG">GG</option>
                    <option value="XG">XG</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload de Foto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Foto do Participante
              </CardTitle>
              <CardDescription>
                Envie uma foto recente para identificação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label
                  htmlFor="foto"
                  className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 ${
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
                      <p className="mb-2 text-sm text-slate-600">
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
                {errors.foto && <p className="text-sm text-red-600">{errors.foto}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Pagamento Info */}
          <Card className="bg-accent-50 border-2 border-accent-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent-900">
                <CreditCard className="w-5 h-5" />
                Valor da Inscrição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-4xl font-bold text-accent-700 mb-2">R$ 35,00</p>
                <p className="text-sm text-slate-600">
                  Após confirmar a inscrição, você receberá as instruções de pagamento por e-mail.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold"
          >
            Confirmar Inscrição
          </Button>

          <p className="text-center text-sm text-slate-500">
            * Campos obrigatórios
          </p>
        </form>
      </div>
    </div>
  )
}
