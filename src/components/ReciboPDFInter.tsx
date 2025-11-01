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
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logoContainer: {
    width: 60,
    height: 60
  },
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    letterSpacing: 0.5
  },

  // Conteúdo Principal
  content: {
    padding: 40
  },

  // Saudação Personalizada (inspirado no "Olá, Maria!")
  greeting: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#333333',
    marginBottom: 24
  },

  // Card Principal com Borda Azul (inspirado no card laranja do Inter)
  mainCard: {
    border: '3 solid #0ea5e9', // Borda azul FARMACE
    borderRadius: 16,
    padding: 32,
    marginBottom: 24,
    backgroundColor: '#ffffff'
  },
  mainCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 32
  },
  mainCardLeft: {
    flex: 1
  },
  mainCardRight: {
    flex: 1,
    gap: 16
  },

  // Número do Participante em Destaque (inspirado no R$ 522,82)
  participantLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8
  },
  participantNumber: {
    fontSize: 42, // Grande como o valor da fatura
    fontFamily: 'Helvetica-Bold',
    color: '#0ea5e9', // Azul FARMACE em destaque
    marginBottom: 8,
    letterSpacing: 2
  },
  participantSubtext: {
    fontSize: 10,
    color: '#999999',
    lineHeight: 1.5
  },

  // Info Row com Ícone (lado direito do card)
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8
  },
  iconContainer: {
    width: 16,
    height: 16,
    marginTop: 2
  },
  infoContent: {
    flex: 1
  },
  infoLabel: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 2
  },
  infoValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#333333'
  },

  // Seção de Destaque (inspirado no "Pagamento mínimo")
  highlightSection: {
    marginBottom: 24
  },
  highlightTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#333333'
  },
  highlightValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#0ea5e9'
  },
  highlightText: {
    fontSize: 10,
    color: '#666666',
    marginTop: 8,
    lineHeight: 1.5
  },

  // Tabela de Informações (inspirado na tabela de encargos)
  table: {
    marginBottom: 24
  },
  tableHeader: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderTop: '1 solid #333333',
    borderBottom: '1 solid #e0e0e0'
  },
  tableHeaderText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#333333'
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottom: '1 solid #f1f5f9'
  },
  tableLabel: {
    fontSize: 10,
    color: '#666666',
    flex: 1
  },
  tableValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#333333',
    textAlign: 'right'
  },

  // Seção de Validação (2 colunas - inspirado em Boleto/Pix)
  validationSection: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 24
  },
  validationColumn: {
    flex: 1
  },
  validationTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#333333',
    marginBottom: 8
  },
  validationText: {
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.5,
    marginBottom: 16
  },
  qrContainer: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginTop: 8
  },
  qrCode: {
    width: '100%',
    height: '100%'
  },
  validationCode: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333333',
    textAlign: 'center',
    marginTop: 12,
    letterSpacing: 1
  },
  authText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#16a34a', // Verde (inspirado no texto verde do Inter)
    textAlign: 'center',
    marginTop: 8,
    textTransform: 'uppercase'
  },

  // Rodapé
  footer: {
    marginTop: 32,
    paddingTop: 16,
    borderTop: '1 solid #e0e0e0',
    textAlign: 'center'
  },
  footerText: {
    fontSize: 8,
    color: '#999999'
  }
})

/**
 * Componente de ícone SVG - Calendário
 */
const IconCalendar: React.FC = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24">
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
  <Svg width="16" height="16" viewBox="0 0 24 24">
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
  <Svg width="16" height="16" viewBox="0 0 24 24">
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

          {/* Rodapé */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              FARMACE - II Corrida e Caminhada da Qualidade - 2025
            </Text>
            <Text style={styles.footerText}>
              Este documento é válido como comprovante de inscrição
            </Text>
          </View>
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

