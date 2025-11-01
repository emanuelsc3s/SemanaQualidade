import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Download, FileText, Loader2, Sparkles } from 'lucide-react'
import {
  gerarReciboPDF,
  downloadReciboPDF,
  gerarReciboPDFModerno,
  downloadReciboPDFModerno,
  gerarReciboPDFInter,
  downloadReciboPDFInter
} from '@/utils/pdfGenerator'

/**
 * Página de Teste - Geração de PDF
 * Permite testar a geração do PDF com dados de exemplo
 */
export default function TestePDF() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  // Dados de exemplo para teste
  const dadosExemplo = {
    nome: 'João Silva Santos',
    email: 'joao.silva@farmace.com.br',
    whatsapp: '(85) 98765-4321',
    numeroParticipante: '0042',
    tipoParticipacao: 'corrida-natal' as const,
    modalidadeCorrida: '5K',
    tamanho: 'M',
    whatsappSent: true
  }

  const dadosExemploApenasNatal = {
    nome: 'Maria Oliveira Costa',
    email: 'maria.oliveira@farmace.com.br',
    whatsapp: '(85) 99876-5432',
    numeroParticipante: '0043',
    tipoParticipacao: 'apenas-natal' as const,
    tamanho: 'G',
    whatsappSent: true
  }

  const dadosExemploRetirarCesta = {
    nome: 'Pedro Henrique Alves',
    email: 'pedro.alves@farmace.com.br',
    whatsapp: '(85) 97654-3210',
    numeroParticipante: '0044',
    tipoParticipacao: 'retirar-cesta' as const,
    whatsappSent: true
  }

  const handleGerarPDF = async (tipo: 'corrida' | 'natal' | 'cesta') => {
    setIsGenerating(true)
    setPdfUrl(null)

    try {
      console.log('🚀 Gerando PDF de teste...')

      let dados

      switch (tipo) {
        case 'corrida':
          dados = dadosExemplo
          break
        case 'natal':
          dados = dadosExemploApenasNatal
          break
        case 'cesta':
          dados = dadosExemploRetirarCesta
          break
      }

      // Gera o PDF como Blob
      const blob = await gerarReciboPDF(dados)

      // Cria URL temporária para preview
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)

      console.log('✅ PDF gerado com sucesso!')
      console.log('📄 URL temporária criada:', url)

    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF. Verifique o console.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPDF = async (tipo: 'corrida' | 'natal' | 'cesta') => {
    setIsGenerating(true)

    try {
      console.log('📥 Baixando PDF...')

      let dados
      let nomeArquivo

      switch (tipo) {
        case 'corrida':
          dados = dadosExemplo
          nomeArquivo = 'Teste_Comprovante_Corrida.pdf'
          break
        case 'natal':
          dados = dadosExemploApenasNatal
          nomeArquivo = 'Teste_Comprovante_Natal.pdf'
          break
        case 'cesta':
          dados = dadosExemploRetirarCesta
          nomeArquivo = 'Teste_Comprovante_Cesta.pdf'
          break
      }

      await downloadReciboPDF(dados, nomeArquivo)

      console.log('✅ Download iniciado!')

    } catch (error) {
      console.error('❌ Erro ao baixar PDF:', error)
      alert('Erro ao baixar PDF. Verifique o console.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGerarPDFModerno = async (tipo: 'corrida' | 'natal' | 'cesta') => {
    setIsGenerating(true)
    setPdfUrl(null)

    try {
      console.log('🚀 Gerando PDF MODERNO de teste...')

      let dados

      switch (tipo) {
        case 'corrida':
          dados = dadosExemplo
          break
        case 'natal':
          dados = dadosExemploApenasNatal
          break
        case 'cesta':
          dados = dadosExemploRetirarCesta
          break
      }

      // Gera o PDF moderno como Blob
      const blob = await gerarReciboPDFModerno(dados)

      // Cria URL temporária para preview
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)

      console.log('✅ PDF MODERNO gerado com sucesso!')
      console.log('📄 URL temporária criada:', url)

    } catch (error) {
      console.error('❌ Erro ao gerar PDF MODERNO:', error)
      alert('Erro ao gerar PDF moderno. Verifique o console.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPDFModerno = async (tipo: 'corrida' | 'natal' | 'cesta') => {
    setIsGenerating(true)

    try {
      console.log('📥 Baixando PDF MODERNO...')

      let dados
      let nomeArquivo

      switch (tipo) {
        case 'corrida':
          dados = dadosExemplo
          nomeArquivo = 'Teste_Comprovante_Moderno_Corrida.pdf'
          break
        case 'natal':
          dados = dadosExemploApenasNatal
          nomeArquivo = 'Teste_Comprovante_Moderno_Natal.pdf'
          break
        case 'cesta':
          dados = dadosExemploRetirarCesta
          nomeArquivo = 'Teste_Comprovante_Moderno_Cesta.pdf'
          break
      }

      await downloadReciboPDFModerno(dados, nomeArquivo)

      console.log('✅ Download MODERNO iniciado!')

    } catch (error) {
      console.error('❌ Erro ao baixar PDF MODERNO:', error)
      alert('Erro ao baixar PDF moderno. Verifique o console.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGerarPDFInter = async (tipo: 'corrida' | 'natal' | 'cesta') => {
    setIsGenerating(true)
    setPdfUrl(null)

    try {
      console.log('🚀 Gerando PDF INTER STYLE de teste...')

      let dados

      switch (tipo) {
        case 'corrida':
          dados = dadosExemplo
          break
        case 'natal':
          dados = dadosExemploApenasNatal
          break
        case 'cesta':
          dados = dadosExemploRetirarCesta
          break
      }

      // Gera o PDF Inter como Blob
      const blob = await gerarReciboPDFInter(dados)

      // Cria uma URL temporária para o blob
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)

      console.log('✅ PDF INTER STYLE gerado com sucesso!')

    } catch (error) {
      console.error('❌ Erro ao gerar PDF INTER STYLE:', error)
      alert('Erro ao gerar PDF Inter Style. Verifique o console.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPDFInter = async (tipo: 'corrida' | 'natal' | 'cesta') => {
    setIsGenerating(true)

    try {
      console.log('📥 Baixando PDF INTER STYLE...')

      let dados
      let nomeArquivo

      switch (tipo) {
        case 'corrida':
          dados = dadosExemplo
          nomeArquivo = 'Teste_Comprovante_Inter_Corrida.pdf'
          break
        case 'natal':
          dados = dadosExemploApenasNatal
          nomeArquivo = 'Teste_Comprovante_Inter_Natal.pdf'
          break
        case 'cesta':
          dados = dadosExemploRetirarCesta
          nomeArquivo = 'Teste_Comprovante_Inter_Cesta.pdf'
          break
      }

      await downloadReciboPDFInter(dados, nomeArquivo)

      console.log('✅ Download INTER STYLE iniciado!')

    } catch (error) {
      console.error('❌ Erro ao baixar PDF INTER STYLE:', error)
      alert('Erro ao baixar PDF Inter Style. Verifique o console.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-green-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-700 mb-2">
            🧪 Teste de Geração de PDF
          </h1>
          <p className="text-slate-600">
            Gere PDFs de exemplo para visualizar o layout e a logomarca
          </p>
        </div>

        {/* Cards de Teste */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Corrida + Natal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" />
                Corrida + Natal
              </CardTitle>
              <CardDescription>
                Inscrição completa na corrida e comemoração
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-slate-600 space-y-1">
                <p><strong>Nome:</strong> {dadosExemplo.nome}</p>
                <p><strong>Modalidade:</strong> {dadosExemplo.modalidadeCorrida}</p>
                <p><strong>Camiseta:</strong> {dadosExemplo.tamanho}</p>
                <p><strong>Nº:</strong> {dadosExemplo.numeroParticipante}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleGerarPDF('corrida')}
                  disabled={isGenerating}
                  className="flex-1"
                  size="sm"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Visualizar'
                  )}
                </Button>
                <Button
                  onClick={() => handleDownloadPDF('corrida')}
                  disabled={isGenerating}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Apenas Natal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Apenas Natal
              </CardTitle>
              <CardDescription>
                Participação apenas na comemoração
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-slate-600 space-y-1">
                <p><strong>Nome:</strong> {dadosExemploApenasNatal.nome}</p>
                <p><strong>Camiseta:</strong> {dadosExemploApenasNatal.tamanho}</p>
                <p><strong>Nº:</strong> {dadosExemploApenasNatal.numeroParticipante}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleGerarPDF('natal')}
                  disabled={isGenerating}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Visualizar'
                  )}
                </Button>
                <Button
                  onClick={() => handleDownloadPDF('natal')}
                  disabled={isGenerating}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Retirar Cesta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                Retirar Cesta
              </CardTitle>
              <CardDescription>
                Apenas retirada da cesta natalina
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-slate-600 space-y-1">
                <p><strong>Nome:</strong> {dadosExemploRetirarCesta.nome}</p>
                <p><strong>Nº:</strong> {dadosExemploRetirarCesta.numeroParticipante}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleGerarPDF('cesta')}
                  disabled={isGenerating}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                  size="sm"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Visualizar'
                  )}
                </Button>
                <Button
                  onClick={() => handleDownloadPDF('cesta')}
                  disabled={isGenerating}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção: PDF Moderno (Layout Alternativo) */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-slate-800">
              Layout Moderno com QR Code
            </h2>
          </div>
          <p className="text-slate-600 mb-6">
            Layout alternativo inspirado em faturas de cartão de crédito (Nubank, Inter, C6 Bank).
            Inclui QR Code para validação e design minimalista.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* PDF Moderno - Corrida + Natal */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Moderno - Corrida
                </CardTitle>
                <CardDescription>
                  Layout moderno com QR Code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-slate-600 space-y-1">
                  <p><strong>Nome:</strong> {dadosExemplo.nome}</p>
                  <p><strong>Modalidade:</strong> {dadosExemplo.modalidadeCorrida}</p>
                  <p><strong>Nº:</strong> {dadosExemplo.numeroParticipante}</p>
                  <p className="text-purple-600 font-semibold">✨ Com QR Code</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleGerarPDFModerno('corrida')}
                    disabled={isGenerating}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    size="sm"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Visualizar'
                    )}
                  </Button>
                  <Button
                    onClick={() => handleDownloadPDFModerno('corrida')}
                    disabled={isGenerating}
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    size="sm"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* PDF Moderno - Apenas Natal */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Moderno - Natal
                </CardTitle>
                <CardDescription>
                  Layout moderno com QR Code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-slate-600 space-y-1">
                  <p><strong>Nome:</strong> {dadosExemploApenasNatal.nome}</p>
                  <p><strong>Camiseta:</strong> {dadosExemploApenasNatal.tamanho}</p>
                  <p><strong>Nº:</strong> {dadosExemploApenasNatal.numeroParticipante}</p>
                  <p className="text-purple-600 font-semibold">✨ Com QR Code</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleGerarPDFModerno('natal')}
                    disabled={isGenerating}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    size="sm"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Visualizar'
                    )}
                  </Button>
                  <Button
                    onClick={() => handleDownloadPDFModerno('natal')}
                    disabled={isGenerating}
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    size="sm"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* PDF Moderno - Retirar Cesta */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Moderno - Cesta
                </CardTitle>
                <CardDescription>
                  Layout moderno com QR Code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-slate-600 space-y-1">
                  <p><strong>Nome:</strong> {dadosExemploRetirarCesta.nome}</p>
                  <p><strong>Nº:</strong> {dadosExemploRetirarCesta.numeroParticipante}</p>
                  <p className="text-purple-600 font-semibold">✨ Com QR Code</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleGerarPDFModerno('cesta')}
                    disabled={isGenerating}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    size="sm"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Visualizar'
                    )}
                  </Button>
                  <Button
                    onClick={() => handleDownloadPDFModerno('cesta')}
                    disabled={isGenerating}
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    size="sm"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview do PDF */}
        {pdfUrl && (
          <Card>
            <CardHeader>
              <CardTitle>📄 Preview do PDF</CardTitle>
              <CardDescription>
                Visualize o PDF gerado abaixo (pode levar alguns segundos para carregar)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <iframe
                src={pdfUrl}
                className="w-full h-[800px] border border-slate-200 rounded-lg"
                title="Preview do PDF"
              />
            </CardContent>
          </Card>
        )}

        {/* Informações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="text-blue-600 mt-1">ℹ️</div>
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-2">Layout Clássico:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Design tradicional de recibo</li>
                    <li>Logomarca FARMACE no topo esquerdo</li>
                    <li>Ícone de check SVG (não emoji)</li>
                    <li>Layout vertical com seções bem definidas</li>
                    <li>Ideal para impressão e arquivamento</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="text-purple-600 mt-1">✨</div>
                <div className="text-sm text-purple-900">
                  <p className="font-semibold mb-2">Layout Moderno:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Design inspirado em faturas digitais</li>
                    <li><strong>QR Code</strong> para validação rápida</li>
                    <li>Cards e grid layout minimalista</li>
                    <li>Número do participante em destaque</li>
                    <li>Visual clean e profissional</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ============================================ */}
        {/* SEÇÃO 3: LAYOUT INTER STYLE (NOVO) */}
        {/* ============================================ */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              🎨 Layout Inter Style (Novo)
            </h2>
            <p className="text-slate-600">
              Design inspirado na fatura do Banco Inter - Header azul, card com borda, número em destaque
            </p>
          </div>

          {/* Cards de Teste - Inter Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Card 1: Corrida + Natal */}
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-300 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-indigo-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Corrida + Natal
                </CardTitle>
                <CardDescription className="text-indigo-700">
                  Participante: João Silva Santos
                  <br />
                  Modalidade: 5K | Camiseta: M
                  <br />
                  Número: 0042
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => handleGerarPDFInter('corrida')}
                  disabled={isGenerating}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Visualizar
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleDownloadPDFInter('corrida')}
                  variant="outline"
                  className="w-full border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </CardContent>
            </Card>

            {/* Card 2: Apenas Natal */}
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-300 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-emerald-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Apenas Natal
                </CardTitle>
                <CardDescription className="text-emerald-700">
                  Participante: Maria Oliveira Costa
                  <br />
                  Camiseta: G
                  <br />
                  Número: 0043
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => handleGerarPDFInter('natal')}
                  disabled={isGenerating}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Visualizar
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleDownloadPDFInter('natal')}
                  variant="outline"
                  className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </CardContent>
            </Card>

            {/* Card 3: Retirar Cesta */}
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-amber-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Retirar Cesta
                </CardTitle>
                <CardDescription className="text-amber-700">
                  Participante: Pedro Henrique Alves
                  <br />
                  Apenas retirada de cesta
                  <br />
                  Número: 0044
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => handleGerarPDFInter('cesta')}
                  disabled={isGenerating}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Visualizar
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleDownloadPDFInter('cesta')}
                  variant="outline"
                  className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Card de Informação - Inter Style */}
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="text-indigo-600 mt-1 text-2xl">🏦</div>
                <div className="text-sm text-indigo-900">
                  <p className="font-semibold mb-2">Layout Inter Style:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Header azul FARMACE</strong> com logo branca (inspirado no header laranja do Inter)</li>
                    <li><strong>Card com borda azul</strong> de 3px e cantos arredondados (16px)</li>
                    <li><strong>Número do participante em destaque</strong> - 42pt, azul, bold (como o R$ 522,82 da fatura)</li>
                    <li><strong>Layout em 2 colunas</strong> - Número à esquerda, informações à direita</li>
                    <li><strong>Ícones outline SVG</strong> ao lado das informações</li>
                    <li><strong>QR Code</strong> para validação digital</li>
                    <li><strong>Código de validação</strong> estilo autenticação bancária</li>
                    <li><strong>Tipografia hierárquica</strong> com 5 níveis de tamanho/peso</li>
                    <li><strong>Espaçamento generoso</strong> - Padding de 32px nos cards</li>
                    <li>Visual moderno e profissional inspirado em fintechs</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

