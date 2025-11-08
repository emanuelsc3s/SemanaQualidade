import { pdf } from '@react-pdf/renderer'
import { ReciboDocument } from '@/components/ReciboPDF'
import { ReciboDocumentModerno } from '@/components/ReciboPDFModerno'
import ReciboPDFInter from '@/components/ReciboPDFInter'
import RelatorioDepartamentosPDF from '@/components/RelatorioDepartamentosPDF'
import RelatorioInscritosPDF from '@/components/RelatorioInscritosPDF'
import QRCode from 'qrcode'
import React from 'react'
import type { DadosDepartamento, DadosInscritosPorDepartamento } from '@/services/inscricaoCorridaSupabaseService'

/**
 * Interface para os dados necessários para gerar o recibo em PDF
 */
interface DadosRecibo {
  nome: string
  email: string
  cpf?: string
  whatsapp: string
  numeroParticipante: string
  tipoParticipacao: 'corrida-natal' | 'apenas-natal' | 'retirar-cesta'
  modalidadeCorrida?: string
  tamanho?: string
  whatsappSent?: boolean
}

/**
 * Gera o PDF do recibo de inscrição como Blob
 * 
 * @param dados - Dados do participante para gerar o recibo
 * @returns Promise com o PDF em formato Blob
 */
export async function gerarReciboPDF(dados: DadosRecibo): Promise<Blob> {
  console.log('📄 [PDF Generator] Iniciando geração do PDF do recibo...')
  console.log('📋 [PDF Generator] Dados recebidos:', {
    nome: dados.nome,
    numeroParticipante: dados.numeroParticipante,
    tipoParticipacao: dados.tipoParticipacao,
    modalidadeCorrida: dados.modalidadeCorrida,
    tamanho: dados.tamanho
  })

  try {
    // Formata a data/hora atual no padrão brasileiro
    const dataInscricao = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

    console.log('📅 [PDF Generator] Data da inscrição:', dataInscricao)

    // Cria o componente React-PDF com os dados
    const documento = React.createElement(ReciboDocument, {
      nome: dados.nome,
      email: dados.email,
      whatsapp: dados.whatsapp,
      numeroParticipante: dados.numeroParticipante,
      tipoParticipacao: dados.tipoParticipacao,
      modalidadeCorrida: dados.modalidadeCorrida,
      tamanho: dados.tamanho,
      dataInscricao: dataInscricao,
      whatsappSent: dados.whatsappSent || false
    })

    console.log('🔄 [PDF Generator] Renderizando documento PDF...')

    // Gera o PDF como Blob
    // @ts-expect-error - React.createElement retorna o tipo correto mas TypeScript não infere corretamente
    const blob = await pdf(documento).toBlob()

    console.log('✅ [PDF Generator] PDF gerado com sucesso!')
    console.log('📊 [PDF Generator] Tamanho do arquivo:', (blob.size / 1024).toFixed(2), 'KB')

    return blob

  } catch (error) {
    console.error('❌ [PDF Generator] Erro ao gerar PDF:', error)
    throw new Error(`Falha ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}

/**
 * Gera o PDF do recibo de inscrição em formato Base64
 * Útil para enviar via API (WhatsApp, Email, etc)
 * 
 * @param dados - Dados do participante para gerar o recibo
 * @returns Promise com o PDF em formato Base64 (sem prefixo data:)
 */
export async function gerarReciboPDFBase64(dados: DadosRecibo): Promise<string> {
  console.log('📄 [PDF Generator] Gerando PDF em formato Base64...')

  try {
    // Gera o PDF como Blob
    const blob = await gerarReciboPDF(dados)

    console.log('🔄 [PDF Generator] Convertendo Blob para Base64...')

    // Converte o Blob para Base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onloadend = () => {
        const base64String = reader.result as string
        
        // Remove o prefixo "data:application/pdf;base64," para obter apenas o Base64 puro
        const base64Pure = base64String.split(',')[1]

        console.log('✅ [PDF Generator] Conversão para Base64 concluída!')
        console.log('📊 [PDF Generator] Tamanho do Base64:', (base64Pure.length / 1024).toFixed(2), 'KB')

        resolve(base64Pure)
      }

      reader.onerror = (error) => {
        console.error('❌ [PDF Generator] Erro ao converter para Base64:', error)
        reject(new Error('Falha ao converter PDF para Base64'))
      }

      // Lê o Blob como Data URL (Base64)
      reader.readAsDataURL(blob)
    })

  } catch (error) {
    console.error('❌ [PDF Generator] Erro ao gerar PDF Base64:', error)
    throw error
  }
}

/**
 * Gera o PDF e faz download direto no navegador
 * Útil para testes ou para permitir que o usuário baixe o comprovante
 * 
 * @param dados - Dados do participante para gerar o recibo
 * @param nomeArquivo - Nome do arquivo PDF (opcional)
 */
export async function downloadReciboPDF(
  dados: DadosRecibo,
  nomeArquivo?: string
): Promise<void> {
  console.log('📥 [PDF Generator] Iniciando download do PDF...')

  try {
    // Gera o PDF como Blob
    const blob = await gerarReciboPDF(dados)

    // Define o nome do arquivo
    const fileName = nomeArquivo || `Comprovante_Inscricao_${dados.numeroParticipante}.pdf`

    console.log('💾 [PDF Generator] Nome do arquivo:', fileName)

    // Cria um link temporário para download
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    
    // Adiciona o link ao DOM, clica nele e remove
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Libera a URL do objeto
    URL.revokeObjectURL(url)

    console.log('✅ [PDF Generator] Download iniciado com sucesso!')

  } catch (error) {
    console.error('❌ [PDF Generator] Erro ao fazer download do PDF:', error)
    throw error
  }
}

/**
 * Gera QR Code em formato Data URL (base64)
 *
 * @param dados - Dados do participante para incluir no QR Code
 * @returns Promise com o QR Code em formato Data URL
 */
export async function gerarQRCode(dados: DadosRecibo): Promise<string> {
  console.log('🔲 [QR Code Generator] Gerando QR Code...')

  try {
    // Cria objeto JSON com dados do participante
    const dadosQR = {
      numero: dados.numeroParticipante,
      nome: dados.nome,
      tipo: dados.tipoParticipacao,
      modalidade: dados.modalidadeCorrida || 'N/A',
      validacao: `FARMACE-2025-${dados.numeroParticipante}`
    }

    // Converte para string JSON
    const qrContent = JSON.stringify(dadosQR)

    // Gera QR Code como Data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrContent, {
      width: 300,
      margin: 1,
      color: {
        dark: '#1e293b', // slate-800
        light: '#ffffff'
      }
    })

    console.log('✅ [QR Code Generator] QR Code gerado com sucesso!')
    return qrCodeDataUrl

  } catch (error) {
    console.error('❌ [QR Code Generator] Erro ao gerar QR Code:', error)
    throw error
  }
}

/**
 * Gera o PDF MODERNO do recibo de inscrição como Blob
 *
 * @param dados - Dados do participante para gerar o recibo
 * @returns Promise com o PDF em formato Blob
 */
export async function gerarReciboPDFModerno(dados: DadosRecibo): Promise<Blob> {
  console.log('📄 [PDF Generator Moderno] Iniciando geração do PDF moderno...')
  console.log('📋 [PDF Generator Moderno] Dados recebidos:', {
    nome: dados.nome,
    numeroParticipante: dados.numeroParticipante,
    tipoParticipacao: dados.tipoParticipacao,
    modalidadeCorrida: dados.modalidadeCorrida,
    tamanho: dados.tamanho
  })

  try {
    // Gera QR Code
    const qrCodeDataUrl = await gerarQRCode(dados)

    // Formata a data de inscrição
    const dataInscricao = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })

    // Cria o documento React-PDF usando React.createElement
    const documento = React.createElement(ReciboDocumentModerno, {
      nome: dados.nome,
      email: dados.email,
      whatsapp: dados.whatsapp,
      numeroParticipante: dados.numeroParticipante,
      tipoParticipacao: dados.tipoParticipacao,
      modalidadeCorrida: dados.modalidadeCorrida,
      tamanho: dados.tamanho,
      dataInscricao: dataInscricao,
      whatsappSent: dados.whatsappSent || false,
      qrCodeDataUrl: qrCodeDataUrl
    })

    console.log('🔄 [PDF Generator Moderno] Renderizando documento PDF...')

    // @ts-expect-error - React.createElement retorna o tipo correto mas TypeScript não infere corretamente
    const blob = await pdf(documento).toBlob()

    console.log('✅ [PDF Generator Moderno] PDF gerado com sucesso!')
    console.log('📦 [PDF Generator Moderno] Tamanho do blob:', blob.size, 'bytes')

    return blob

  } catch (error) {
    console.error('❌ [PDF Generator Moderno] Erro ao gerar PDF:', error)
    throw error
  }
}

/**
 * Gera o PDF MODERNO do recibo em formato Base64 (sem prefixo data:)
 * Usado para envio via WhatsApp API
 *
 * @param dados - Dados do participante para gerar o recibo
 * @returns Promise com o PDF em formato Base64 (string)
 */
export async function gerarReciboPDFModernoBase64(dados: DadosRecibo): Promise<string> {
  console.log('📄 [PDF Generator Moderno] Gerando PDF em Base64...')

  try {
    const blob = await gerarReciboPDFModerno(dados)

    // Converte Blob para Base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        // Remove o prefixo "data:application/pdf;base64,"
        const base64String = result.split(',')[1]
        resolve(base64String)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })

    console.log('✅ [PDF Generator Moderno] Base64 gerado com sucesso!')
    console.log('📏 [PDF Generator Moderno] Tamanho do Base64:', base64.length, 'caracteres')

    return base64

  } catch (error) {
    console.error('❌ [PDF Generator Moderno] Erro ao gerar Base64:', error)
    throw error
  }
}

/**
 * Faz download do PDF MODERNO do recibo diretamente no navegador
 *
 * @param dados - Dados do participante para gerar o recibo
 * @param nomeArquivo - Nome do arquivo (opcional, padrão: Comprovante_Inscricao_[numero].pdf)
 */
export async function downloadReciboPDFModerno(
  dados: DadosRecibo,
  nomeArquivo?: string
): Promise<void> {
  console.log('📥 [PDF Generator Moderno] Iniciando download do PDF...')

  try {
    const blob = await gerarReciboPDFModerno(dados)

    // Define nome do arquivo
    const fileName = nomeArquivo || `Comprovante_Moderno_${dados.numeroParticipante}.pdf`

    // Cria URL temporária para o blob
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName

    // Adiciona o link ao DOM, clica nele e remove
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Libera a URL do objeto
    URL.revokeObjectURL(url)

    console.log('✅ [PDF Generator Moderno] Download iniciado com sucesso!')

  } catch (error) {
    console.error('❌ [PDF Generator Moderno] Erro ao fazer download do PDF:', error)
    throw error
  }
}

// ============================================================================
// FUNÇÕES PARA PDF ESTILO INTER
// ============================================================================

/**
 * Gera o PDF do recibo estilo Inter como Blob
 *
 * @param dados - Dados do participante para gerar o recibo
 * @returns Promise com o PDF em formato Blob
 */
export async function gerarReciboPDFInter(dados: DadosRecibo): Promise<Blob> {
  console.log('📄 [PDF Generator Inter] Iniciando geração do PDF estilo Inter...')

  try {
    // Formata a data/hora atual no padrão brasileiro
    const dataInscricao = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })

    // Gera QR Code
    const qrCodeDataUrl = await gerarQRCode(dados)

    // Cria o componente React-PDF com os dados
    const documento = React.createElement(ReciboPDFInter, {
      dados: {
        ...dados,
        dataInscricao,
        qrCodeDataUrl
      }
    })

    console.log('🔄 [PDF Generator Inter] Renderizando documento PDF...')

    // Gera o PDF como Blob
    // @ts-expect-error - React.createElement retorna o tipo correto mas TypeScript não infere corretamente
    const blob = await pdf(documento).toBlob()

    console.log('✅ [PDF Generator Inter] PDF gerado com sucesso!')
    console.log('📦 [PDF Generator Inter] Tamanho do blob:', blob.size, 'bytes')

    return blob

  } catch (error) {
    console.error('❌ [PDF Generator Inter] Erro ao gerar PDF:', error)
    throw error
  }
}

/**
 * Gera o PDF do recibo estilo Inter em formato Base64
 *
 * @param dados - Dados do participante para gerar o recibo
 * @returns Promise com o PDF em formato Base64 (data URL)
 */
export async function gerarReciboPDFInterBase64(dados: DadosRecibo): Promise<string> {
  console.log('📄 [PDF Generator Inter] Iniciando geração do PDF em Base64...')

  try {
    // Gera o PDF como Blob
    const blob = await gerarReciboPDFInter(dados)

    console.log('🔄 [PDF Generator Inter] Convertendo Blob para Base64...')

    // Converte o Blob para Base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        resolve(result)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })

    console.log('✅ [PDF Generator Inter] PDF convertido para Base64 com sucesso!')
    console.log('📏 [PDF Generator Inter] Tamanho do Base64:', base64.length, 'caracteres')

    return base64

  } catch (error) {
    console.error('❌ [PDF Generator Inter] Erro ao gerar PDF em Base64:', error)
    throw error
  }
}

/**
 * Faz o download do PDF do recibo estilo Inter
 *
 * @param dados - Dados do participante para gerar o recibo
 * @param nomeArquivo - Nome do arquivo (opcional, padrão: Comprovante_Inter_[numero].pdf)
 */
export async function downloadReciboPDFInter(
  dados: DadosRecibo,
  nomeArquivo?: string
): Promise<void> {
  console.log('📥 [PDF Generator Inter] Iniciando download do PDF...')

  try {
    // Gera o PDF como Blob
    const blob = await gerarReciboPDFInter(dados)

    // Define o nome do arquivo
    const nome = nomeArquivo || `Comprovante_Inter_${dados.numeroParticipante}.pdf`

    console.log('📝 [PDF Generator Inter] Nome do arquivo:', nome)

    // Cria uma URL temporária para o blob
    const url = URL.createObjectURL(blob)

    // Cria um link temporário e simula o clique para download
    const link = document.createElement('a')
    link.href = url
    link.download = nome

    // Adiciona o link ao DOM, clica nele e remove
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Libera a URL do objeto
    URL.revokeObjectURL(url)

    console.log('✅ [PDF Generator Inter] Download iniciado com sucesso!')

  } catch (error) {
    console.error('❌ [PDF Generator Inter] Erro ao fazer download do PDF:', error)
    throw error
  }
}

// ============================================================================
// FUNÇÕES PARA RELATÓRIO DE DEPARTAMENTOS
// ============================================================================

/**
 * Gera o PDF do relatório de departamentos como Blob
 *
 * @param departamentos - Array com dados de participação por departamento
 * @returns Promise com o PDF em formato Blob
 */
export async function gerarRelatorioDepartamentosPDF(
  departamentos: DadosDepartamento[]
): Promise<Blob> {
  console.log('📄 [PDF Generator Departamentos] Iniciando geração do PDF...')
  console.log(`📊 [PDF Generator Departamentos] ${departamentos.length} departamentos`)

  try {
    // Formata a data/hora atual no padrão brasileiro
    const dataGeracao = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    // Cria o componente React-PDF com os dados
    const documento = React.createElement(RelatorioDepartamentosPDF, {
      dados: {
        departamentos,
        dataGeracao
      }
    })

    console.log('🔄 [PDF Generator Departamentos] Renderizando documento PDF...')

    // Gera o PDF como Blob
    // @ts-expect-error - React.createElement retorna o tipo correto mas TypeScript não infere corretamente
    const blob = await pdf(documento).toBlob()

    console.log('✅ [PDF Generator Departamentos] PDF gerado com sucesso!')
    console.log('📦 [PDF Generator Departamentos] Tamanho do blob:', blob.size, 'bytes')

    return blob

  } catch (error) {
    console.error('❌ [PDF Generator Departamentos] Erro ao gerar PDF:', error)
    throw error
  }
}

/**
 * Gera o PDF do relatório de departamentos em formato Base64
 *
 * @param departamentos - Array com dados de participação por departamento
 * @returns Promise com o PDF em formato Base64 (data URL)
 */
export async function gerarRelatorioDepartamentosPDFBase64(
  departamentos: DadosDepartamento[]
): Promise<string> {
  console.log('📄 [PDF Generator Departamentos] Iniciando geração do PDF em Base64...')

  try {
    // Gera o PDF como Blob
    const blob = await gerarRelatorioDepartamentosPDF(departamentos)

    console.log('🔄 [PDF Generator Departamentos] Convertendo Blob para Base64...')

    // Converte o Blob para Base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        resolve(result)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })

    console.log('✅ [PDF Generator Departamentos] PDF convertido para Base64 com sucesso!')
    console.log('📏 [PDF Generator Departamentos] Tamanho do Base64:', base64.length, 'caracteres')

    return base64

  } catch (error) {
    console.error('❌ [PDF Generator Departamentos] Erro ao gerar PDF em Base64:', error)
    throw error
  }
}

/**
 * Faz o download do PDF do relatório de departamentos
 *
 * @param departamentos - Array com dados de participação por departamento
 * @param nomeArquivo - Nome do arquivo (opcional, padrão: Relatorio_Departamentos_[data].pdf)
 */
export async function downloadRelatorioDepartamentosPDF(
  departamentos: DadosDepartamento[],
  nomeArquivo?: string
): Promise<void> {
  console.log('📥 [PDF Generator Departamentos] Iniciando download do PDF...')

  try {
    // Gera o PDF como Blob
    const blob = await gerarRelatorioDepartamentosPDF(departamentos)

    // Define o nome do arquivo
    const dataAtual = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const nome = nomeArquivo || `Relatorio_Departamentos_${dataAtual}.pdf`

    console.log('📝 [PDF Generator Departamentos] Nome do arquivo:', nome)

    // Cria uma URL temporária para o blob
    const url = URL.createObjectURL(blob)

    // Cria um link temporário e simula o clique para download
    const link = document.createElement('a')
    link.href = url
    link.download = nome

    // Adiciona o link ao DOM, clica nele e remove
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Libera a URL do objeto
    URL.revokeObjectURL(url)

    console.log('✅ [PDF Generator Departamentos] Download iniciado com sucesso!')

  } catch (error) {
    console.error('❌ [PDF Generator Departamentos] Erro ao fazer download do PDF:', error)
    throw error
  }
}

// ============================================================================
// FUNÇÕES PARA RELATÓRIO DE INSCRITOS POR DEPARTAMENTO
// ============================================================================

/**
 * Gera o PDF do relatório de inscritos por departamento como Blob
 *
 * @param inscritos - Array com dados de inscritos por departamento
 * @returns Promise com o PDF em formato Blob
 */
export async function gerarRelatorioInscritosPDF(
  inscritos: DadosInscritosPorDepartamento[]
): Promise<Blob> {
  console.log('📄 [PDF Generator Inscritos] Iniciando geração do PDF...')
  console.log(`📊 [PDF Generator Inscritos] ${inscritos.length} departamentos`)

  try {
    // Formata a data/hora atual no padrão brasileiro
    const dataGeracao = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    // Cria o componente React-PDF com os dados
    const documento = React.createElement(RelatorioInscritosPDF, {
      dados: {
        inscritos,
        dataGeracao
      }
    })

    console.log('🔄 [PDF Generator Inscritos] Renderizando documento PDF...')

    // Gera o PDF como Blob
    // @ts-expect-error - React.createElement retorna o tipo correto mas TypeScript não infere corretamente
    const blob = await pdf(documento).toBlob()

    console.log('✅ [PDF Generator Inscritos] PDF gerado com sucesso!')
    console.log('📦 [PDF Generator Inscritos] Tamanho do blob:', blob.size, 'bytes')

    return blob

  } catch (error) {
    console.error('❌ [PDF Generator Inscritos] Erro ao gerar PDF:', error)
    throw error
  }
}

/**
 * Gera o PDF do relatório de inscritos por departamento em formato Base64
 *
 * @param inscritos - Array com dados de inscritos por departamento
 * @returns Promise com o PDF em formato Base64 (data URL)
 */
export async function gerarRelatorioInscritosPDFBase64(
  inscritos: DadosInscritosPorDepartamento[]
): Promise<string> {
  console.log('📄 [PDF Generator Inscritos] Iniciando geração do PDF em Base64...')

  try {
    // Gera o PDF como Blob
    const blob = await gerarRelatorioInscritosPDF(inscritos)

    console.log('🔄 [PDF Generator Inscritos] Convertendo Blob para Base64...')

    // Converte o Blob para Base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        resolve(result)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })

    console.log('✅ [PDF Generator Inscritos] PDF convertido para Base64 com sucesso!')
    console.log('📏 [PDF Generator Inscritos] Tamanho do Base64:', base64.length, 'caracteres')

    return base64

  } catch (error) {
    console.error('❌ [PDF Generator Inscritos] Erro ao gerar PDF em Base64:', error)
    throw error
  }
}

/**
 * Faz o download do PDF do relatório de inscritos por departamento
 *
 * @param inscritos - Array com dados de inscritos por departamento
 * @param nomeArquivo - Nome do arquivo (opcional, padrão: Relatorio_Inscritos_[data].pdf)
 */
export async function downloadRelatorioInscritosPDF(
  inscritos: DadosInscritosPorDepartamento[],
  nomeArquivo?: string
): Promise<void> {
  console.log('📥 [PDF Generator Inscritos] Iniciando download do PDF...')

  try {
    // Gera o PDF como Blob
    const blob = await gerarRelatorioInscritosPDF(inscritos)

    // Define o nome do arquivo
    const dataAtual = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const nome = nomeArquivo || `Relatorio_Inscritos_${dataAtual}.pdf`

    console.log('📝 [PDF Generator Inscritos] Nome do arquivo:', nome)

    // Cria uma URL temporária para o blob
    const url = URL.createObjectURL(blob)

    // Cria um link temporário e simula o clique para download
    const link = document.createElement('a')
    link.href = url
    link.download = nome

    // Adiciona o link ao DOM, clica nele e remove
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Libera a URL do objeto
    URL.revokeObjectURL(url)

    console.log('✅ [PDF Generator Inscritos] Download iniciado com sucesso!')

  } catch (error) {
    console.error('❌ [PDF Generator Inscritos] Erro ao fazer download do PDF:', error)
    throw error
  }
}

