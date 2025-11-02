import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer'

/**
 * Interface de dados para o recibo
 */
interface DadosRecibo {
  nome: string
  email: string
  whatsapp: string
  numeroParticipante: string
  tipoParticipacao: 'corrida-natal' | 'apenas-natal' | 'retirar-cesta'
  modalidadeCorrida?: string
  tamanho?: string
  dataInscricao?: string
  whatsappSent?: boolean
  qrCodeDataUrl?: string
}

/**
 * Estilos inspirados na fatura do Banco Inter
 * Adaptado para o contexto da Corrida FARMACE
 */
const styles = StyleSheet.create({
  page: {
    padding: 0,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333333'
  },

  // Header Azul FARMACE (inspirado no header laranja do Inter)
  header: {
    backgroundColor: '#0ea5e9', // Azul FARMACE (substitui laranja Inter)
    padding: 16, // Reduzido de 24 para 16
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logoContainer: {
    width: 45, // Reduzido de 60 para 45
    height: 45 // Reduzido de 60 para 45
  },
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  headerTitle: {
    fontSize: 14, // Reduzido de 16 para 14
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    letterSpacing: 0.5
  },

  // Conteúdo Principal
  content: {
    padding: 24 // Reduzido de 40 para 24
  },

  // Saudação Personalizada (inspirado no "Olá, Maria!")
  greeting: {
    fontSize: 15, // Reduzido de 18 para 15
    fontFamily: 'Helvetica-Bold',
    color: '#333333',
    marginBottom: 16 // Reduzido de 24 para 16
  },

  // Card Principal com Borda Azul (inspirado no card laranja do Inter)
  mainCard: {
    border: '2 solid #0ea5e9', // Borda reduzida de 3 para 2
    borderRadius: 12, // Reduzido de 16 para 12
    padding: 20, // Reduzido de 32 para 20
    marginBottom: 16, // Reduzido de 24 para 16
    backgroundColor: '#ffffff'
  },
  mainCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20 // Reduzido de 32 para 20
  },
  mainCardLeft: {
    flex: 1
  },
  mainCardRight: {
    flex: 1,
    gap: 10 // Reduzido de 16 para 10
  },

  // Número do Participante em Destaque (inspirado no R$ 522,82)
  participantLabel: {
    fontSize: 10, // Reduzido de 12 para 10
    color: '#666666',
    marginBottom: 4 // Reduzido de 8 para 4
  },
  participantNumber: {
    fontSize: 32, // Reduzido de 42 para 32
    fontFamily: 'Helvetica-Bold',
    color: '#0ea5e9', // Azul FARMACE em destaque
    marginBottom: 4, // Reduzido de 8 para 4
    letterSpacing: 1.5 // Reduzido de 2 para 1.5
  },
  participantSubtext: {
    fontSize: 9, // Reduzido de 10 para 9
    color: '#999999',
    lineHeight: 1.4 // Reduzido de 1.5 para 1.4
  },

  // Info Row com Ícone (lado direito do card)
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6 // Reduzido de 8 para 6
  },
  iconContainer: {
    width: 14, // Reduzido de 16 para 14
    height: 14, // Reduzido de 16 para 14
    marginTop: 1 // Reduzido de 2 para 1
  },
  infoContent: {
    flex: 1
  },
  infoLabel: {
    fontSize: 9, // Reduzido de 10 para 9
    color: '#666666',
    marginBottom: 1 // Reduzido de 2 para 1
  },
  infoValue: {
    fontSize: 10, // Reduzido de 12 para 10
    fontFamily: 'Helvetica-Bold',
    color: '#333333'
  },

  // Seção de Destaque (inspirado no "Pagamento mínimo")
  highlightSection: {
    marginBottom: 12 // Reduzido de 24 para 12
  },
  highlightTitle: {
    fontSize: 12, // Reduzido de 14 para 12
    fontFamily: 'Helvetica-Bold',
    color: '#333333'
  },
  highlightValue: {
    fontSize: 12, // Reduzido de 14 para 12
    fontFamily: 'Helvetica-Bold',
    color: '#0ea5e9'
  },
  highlightText: {
    fontSize: 9, // Reduzido de 10 para 9
    color: '#666666',
    marginTop: 4, // Reduzido de 8 para 4
    lineHeight: 1.4 // Reduzido de 1.5 para 1.4
  },

  // Tabela de Informações (inspirado na tabela de encargos)
  table: {
    marginBottom: 12 // Reduzido de 24 para 12
  },
  tableHeader: {
    backgroundColor: '#f8fafc',
    padding: 8, // Reduzido de 12 para 8
    borderTop: '1 solid #333333',
    borderBottom: '1 solid #e0e0e0'
  },
  tableHeaderText: {
    fontSize: 10, // Reduzido de 11 para 10
    fontFamily: 'Helvetica-Bold',
    color: '#333333'
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6, // Reduzido de 10 para 6
    paddingHorizontal: 8, // Reduzido de 12 para 8
    borderBottom: '1 solid #f1f5f9'
  },
  tableLabel: {
    fontSize: 9, // Reduzido de 10 para 9
    color: '#666666',
    flex: 1
  },
  tableValue: {
    fontSize: 9, // Reduzido de 10 para 9
    fontFamily: 'Helvetica-Bold',
    color: '#333333',
    textAlign: 'right'
  },

  // Seção de Validação (2 colunas - inspirado em Boleto/Pix)
  validationSection: {
    flexDirection: 'row',
    gap: 16, // Reduzido de 24 para 16
    marginTop: 12 // Reduzido de 24 para 12
  },
  validationColumn: {
    flex: 1
  },
  validationTitle: {
    fontSize: 10, // Reduzido de 12 para 10
    fontFamily: 'Helvetica-Bold',
    color: '#333333',
    marginBottom: 4 // Reduzido de 8 para 4
  },
  validationText: {
    fontSize: 8, // Reduzido de 9 para 8
    color: '#666666',
    lineHeight: 1.4, // Reduzido de 1.5 para 1.4
    marginBottom: 8 // Reduzido de 16 para 8
  },
  qrContainer: {
    width: 90, // Reduzido de 120 para 90
    height: 90, // Reduzido de 120 para 90
    alignSelf: 'center',
    marginTop: 4 // Reduzido de 8 para 4
  },
  qrCode: {
    width: '100%',
    height: '100%'
  },
  validationCode: {
    fontSize: 9, // Reduzido de 10 para 9
    fontFamily: 'Helvetica',
    color: '#333333',
    textAlign: 'center',
    marginTop: 6, // Reduzido de 12 para 6
    letterSpacing: 0.8 // Reduzido de 1 para 0.8
  },
  authText: {
    fontSize: 7, // Reduzido de 8 para 7
    fontFamily: 'Helvetica-Bold',
    color: '#16a34a', // Verde (inspirado no texto verde do Inter)
    textAlign: 'center',
    marginTop: 4, // Reduzido de 8 para 4
    textTransform: 'uppercase'
  },

  // Rodapé Superior (informações do evento)
  footerTop: {
    marginTop: 12,
    paddingTop: 6,
    borderTop: '1 solid #e0e0e0',
    textAlign: 'center',
    marginBottom: 8 // Espaço entre rodapé superior e inferior
  },
  footerText: {
    fontSize: 7,
    color: '#999999',
    marginBottom: 2 // Espaçamento entre linhas
  },

  // Rodapé Inferior (copyright SICFAR) - Posicionado no final absoluto da página
  footerBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 6,
    paddingBottom: 8,
    borderTop: '1 solid #e0e0e0', // Linha divisória
    textAlign: 'center',
    backgroundColor: '#ffffff' // Fundo branco para cobrir qualquer conteúdo abaixo
  },
  footerTextBold: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#999999'
  },
  footerTextHighlight: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#0ea5e9' // Cor primária azul FARMACE
  }
})

/**
 * Componente de ícone SVG - Calendário
 */
const IconCalendar: React.FC = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24">
    <Path
      d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"
      fill="none"
      stroke="#666666"
      strokeWidth="1.5"
    />
  </Svg>
)

/**
 * Componente de ícone SVG - Camiseta
 */
const IconShirt: React.FC = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24">
    <Path
      d="M16 4l1.29 1.29c.63.63 1.71.18 1.71-.71V2H5v2.58c0 .89 1.08 1.34 1.71.71L8 4l4-2 4 2zm0 2v14H8V6h8z"
      fill="none"
      stroke="#666666"
      strokeWidth="1.5"
    />
  </Svg>
)

/**
 * Componente de ícone SVG - Corrida
 */
const IconRun: React.FC = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24">
    <Path
      d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"
      fill="none"
      stroke="#666666"
      strokeWidth="1.5"
    />
  </Svg>
)

/**
 * Componente ReciboPDFInter - Conteúdo do PDF (Page)
 * Inspirado na fatura do Banco Inter
 */
const ReciboPDFInterPage: React.FC<{ dados: DadosRecibo }> = ({ dados }) => {
  const {
    nome,
    email,
    whatsapp,
    numeroParticipante,
    tipoParticipacao,
    modalidadeCorrida,
    tamanho,
    dataInscricao,
    qrCodeDataUrl
  } = dados

  // Determina textos baseados no tipo de participação
  const isCorridaNatal = tipoParticipacao === 'corrida-natal'
  const isApenasNatal = tipoParticipacao === 'apenas-natal'
  const isRetirarCesta = tipoParticipacao === 'retirar-cesta'

  const primeiroNome = nome.split(' ')[0]
  const saudacao = isRetirarCesta
    ? `Olá, ${primeiroNome}! Sua retirada de cesta foi confirmada!`
    : isApenasNatal
    ? `Olá, ${primeiroNome}! Sua participação no Natal foi confirmada!`
    : `Olá, ${primeiroNome}! Sua inscrição foi confirmada!`

  const participantSubtext = isRetirarCesta
    ? 'Este é o seu número para retirada da cesta de Natal'
    : isApenasNatal
    ? 'Este é o seu número de participante para a comemoração de Natal'
    : 'Este é o seu número de peito para a corrida'

  const codigoValidacao = `FARMACE-2025-${numeroParticipante}`

  return (
    <Page size="A4" style={styles.page}>
        {/* Header Azul FARMACE */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image src="/logomarca.png" style={styles.logo} />
          </View>
          <Text style={styles.headerTitle}>Comprovante de Inscrição</Text>
        </View>

        {/* Conteúdo Principal */}
        <View style={styles.content}>
          {/* Saudação Personalizada */}
          <Text style={styles.greeting}>{saudacao}</Text>

          {/* Card Principal com Borda Azul */}
          <View style={styles.mainCard}>
            <View style={styles.mainCardContent}>
              {/* Coluna Esquerda: Número em Destaque */}
              <View style={styles.mainCardLeft}>
                <Text style={styles.participantLabel}>
                  {isRetirarCesta
                    ? 'Número de Retirada'
                    : isApenasNatal
                    ? 'Número do Participante'
                    : 'Número do Peito'}
                </Text>
                <Text style={styles.participantNumber}>#{numeroParticipante}</Text>
                <Text style={styles.participantSubtext}>{participantSubtext}</Text>
              </View>

              {/* Coluna Direita: Informações com Ícones */}
              <View style={styles.mainCardRight}>
                {/* Modalidade (apenas para corrida) */}
                {isCorridaNatal && modalidadeCorrida && (
                  <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                      <IconRun />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Modalidade</Text>
                      <Text style={styles.infoValue}>{modalidadeCorrida}</Text>
                    </View>
                  </View>
                )}

                {/* Tamanho da Camiseta */}
                {tamanho && !isRetirarCesta && (
                  <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                      <IconShirt />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Tamanho da Camiseta</Text>
                      <Text style={styles.infoValue}>{tamanho}</Text>
                    </View>
                  </View>
                )}

                {/* Data de Inscrição */}
                <View style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <IconCalendar />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Data de Inscrição</Text>
                    <Text style={styles.infoValue}>
                      {dataInscricao || new Date().toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Seção de Destaque */}
          <View style={styles.highlightSection}>
            <Text style={styles.highlightTitle}>
              Status da Inscrição: <Text style={styles.highlightValue}>✓ Confirmado</Text>
            </Text>
            <Text style={styles.highlightText}>
              {isRetirarCesta
                ? 'Sua retirada de cesta está confirmada. Apresente este comprovante no dia da retirada.'
                : isApenasNatal
                ? 'Sua participação na comemoração de Natal está confirmada. Aguarde mais informações sobre o evento.'
                : 'Sua inscrição na corrida está confirmada. Não esqueça de retirar seu kit do atleta antes do evento.'}
            </Text>
          </View>

          {/* Tabela de Informações */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Dados do Participante</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Nome Completo</Text>
              <Text style={styles.tableValue}>{nome}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Email</Text>
              <Text style={styles.tableValue}>{email}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>WhatsApp</Text>
              <Text style={styles.tableValue}>{whatsapp}</Text>
            </View>
          </View>

          {/* Seção de Validação (2 colunas) */}
          <View style={styles.validationSection}>
            {/* Coluna Esquerda: Código de Validação */}
            <View style={styles.validationColumn}>
              <Text style={styles.validationTitle}>Código de Validação</Text>
              <Text style={styles.validationText}>
                Use este código para validar sua inscrição ou para consultas futuras.
              </Text>
              <Text style={styles.validationCode}>{codigoValidacao}</Text>
              <Text style={styles.authText}>Autenticação FARMACE - Válido</Text>
            </View>

            {/* Coluna Direita: QR Code */}
            {qrCodeDataUrl && (
              <View style={styles.validationColumn}>
                <Text style={styles.validationTitle}>Validação via QR Code</Text>
                <Text style={styles.validationText}>
                  Escaneie o QR Code abaixo para validar sua inscrição digitalmente.
                </Text>
                <View style={styles.qrContainer}>
                  <Image src={qrCodeDataUrl} style={styles.qrCode} />
                </View>
              </View>
            )}
          </View>

          {/* Rodapé Superior - Informações do Evento */}
          <View style={styles.footerTop}>
            <Text style={styles.footerText}>
              FARMACE - II Corrida e Caminhada da Qualidade - 2025
            </Text>
            <Text style={styles.footerText}>
              Este documento é válido como comprovante de inscrição
            </Text>
          </View>
        </View>

        {/* Rodapé Inferior - Copyright SICFAR (Posicionado no final absoluto da página) */}
        <View style={styles.footerBottom}>
          <Text style={styles.footerTextBold}>
            <Text style={styles.footerTextHighlight}>SICFAR</Text>
            <Text> Manager - Plataforma Computacional </Text>
            <Text style={styles.footerTextHighlight}>FARMACE</Text>
          </Text>
        </View>
      </Page>
  )
}

/**
 * Componente Document completo - Wrapper para o ReciboPDFInterPage
 */
export const ReciboPDFInter: React.FC<{ dados: DadosRecibo }> = (props) => (
  <Document>
    <ReciboPDFInterPage {...props} />
  </Document>
)

export default ReciboPDFInter

