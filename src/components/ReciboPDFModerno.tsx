import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

/**
 * Componente de PDF Moderno - Inspirado em Faturas de Cartão de Crédito
 * Layout minimalista, clean e profissional
 */

interface ReciboPDFModernoProps {
  nome: string
  email: string
  whatsapp: string
  numeroParticipante: string
  tipoParticipacao: 'corrida-natal' | 'apenas-natal' | 'retirar-cesta'
  modalidadeCorrida?: string
  tamanho?: string
  dataInscricao?: string
  whatsappSent?: boolean
  qrCodeDataUrl?: string // QR Code em base64
}

/**
 * Estilos modernos inspirados em faturas digitais
 */
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1e293b' // slate-800
  },

  // Header Sofisticado - Inspirado em Faturas Modernas
  header: {
    backgroundColor: '#f8fafc', // slate-50 - fundo sutil
    borderRadius: 12,
    padding: 24,
    marginBottom: 32,
    border: '1 solid #e2e8f0' // slate-200
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  logoContainer: {
    width: 80,
    height: 80
  },
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  headerInfo: {
    flexDirection: 'column',
    gap: 4
  },
  companyTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a', // slate-900
    letterSpacing: 0.5
  },
  companySubtitle: {
    fontSize: 11,
    color: '#64748b', // slate-500
    marginTop: 2
  },
  documentType: {
    fontSize: 9,
    color: '#94a3b8', // slate-400
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4
  },
  headerRight: {
    alignItems: 'flex-end'
  },
  qrContainer: {
    width: 100,
    height: 100,
    padding: 6,
    backgroundColor: '#ffffff',
    border: '2 solid #e2e8f0',
    borderRadius: 8
  },
  qrCode: {
    width: '100%',
    height: '100%'
  },
  qrLabel: {
    fontSize: 7,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    fontFamily: 'Helvetica-Bold'
  },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTop: '1 solid #e2e8f0'
  },
  headerBottomLeft: {
    flexDirection: 'row',
    gap: 24
  },
  infoGroup: {
    flexDirection: 'column',
    gap: 2
  },
  infoLabel: {
    fontSize: 7,
    color: '#94a3b8', // slate-400
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  infoValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b' // slate-800
  },
  statusBadgeHeader: {
    backgroundColor: '#dcfce7', // green-100
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    border: '1 solid #86efac' // green-300
  },
  statusTextHeader: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#16a34a', // green-600
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },

  // Card Principal - Número do Participante
  heroCard: {
    backgroundColor: '#0ea5e9', // primary-500
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  heroCardGreen: {
    backgroundColor: '#10b981' // green-500
  },
  heroCardAmber: {
    backgroundColor: '#f59e0b' // amber-500
  },
  heroTitle: {
    fontSize: 11,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  heroNumber: {
    fontSize: 36,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: 2
  },
  heroSubtitle: {
    fontSize: 9,
    color: '#ffffff',
    opacity: 0.8
  },

  // Grid de Cards
  cardsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24
  },
  card: {
    flex: 1,
    backgroundColor: '#f8fafc', // slate-50
    borderRadius: 8,
    padding: 16,
    border: '1 solid #e2e8f0' // slate-200
  },
  cardTitle: {
    fontSize: 8,
    color: '#64748b', // slate-500
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8
  },
  cardValue: {
    fontSize: 11,
    color: '#1e293b', // slate-800
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4
  },
  cardLabel: {
    fontSize: 8,
    color: '#94a3b8' // slate-400
  },

  // Seção de Informações
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottom: '1 solid #f1f5f9' // slate-100
  },
  rowLabel: {
    fontSize: 9,
    color: '#64748b',
    flex: 1
  },
  rowValue: {
    fontSize: 9,
    color: '#1e293b',
    fontFamily: 'Helvetica-Bold',
    flex: 2,
    textAlign: 'right'
  },

  // Box de Destaque
  highlightBox: {
    backgroundColor: '#eff6ff', // blue-50
    borderLeft: '4 solid #3b82f6', // blue-500
    borderRadius: 4,
    padding: 12,
    marginBottom: 24
  },
  highlightBoxGreen: {
    backgroundColor: '#f0fdf4', // green-50
    borderLeft: '4 solid #22c55e' // green-500
  },
  highlightBoxAmber: {
    backgroundColor: '#fffbeb', // amber-50
    borderLeft: '4 solid #f59e0b' // amber-500
  },
  highlightTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginBottom: 4
  },
  highlightText: {
    fontSize: 8,
    color: '#475569',
    lineHeight: 1.4
  },

  // Footer
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
    borderTop: '1 solid #e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8'
  },
  footerBrand: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0ea5e9'
  }
})

/**
 * Componente ReciboPDFModerno - Retorna apenas <Page>
 */
export const ReciboPDFModerno = ({
  nome,
  email,
  whatsapp,
  numeroParticipante,
  tipoParticipacao,
  modalidadeCorrida,
  tamanho,
  dataInscricao,
  qrCodeDataUrl
}: ReciboPDFModernoProps) => {
  const isRetirarCesta = tipoParticipacao === 'retirar-cesta'
  const isApenasNatal = tipoParticipacao === 'apenas-natal'
  const isCorridaNatal = tipoParticipacao === 'corrida-natal'

  // Determina cores do tema
  const heroCardStyle = isRetirarCesta
    ? [styles.heroCard, styles.heroCardAmber]
    : isApenasNatal
    ? [styles.heroCard, styles.heroCardGreen]
    : styles.heroCard

  const highlightBoxStyle = isRetirarCesta
    ? [styles.highlightBox, styles.highlightBoxAmber]
    : isApenasNatal
    ? [styles.highlightBox, styles.highlightBoxGreen]
    : styles.highlightBox

  // Gera código de validação único
  const codigoValidacao = `VAL-2025-${numeroParticipante}`

  return (
    <Page size="A4" style={styles.page}>
      {/* Header Sofisticado - 3 Colunas */}
      <View style={styles.header}>
        {/* Linha Superior: Logo + Info Institucional + QR Code */}
        <View style={styles.headerTop}>
          {/* Coluna Esquerda: Logo + Título */}
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Image src="/logomarca.png" style={styles.logo} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.companyTitle}>FARMACE</Text>
              <Text style={styles.companySubtitle}>
                II Corrida e Caminhada da Qualidade
              </Text>
              <Text style={styles.documentType}>Comprovante de Inscrição</Text>
            </View>
          </View>

          {/* Coluna Direita: QR Code */}
          {qrCodeDataUrl && (
            <View style={styles.headerRight}>
              <View style={styles.qrContainer}>
                <Image src={qrCodeDataUrl} style={styles.qrCode} />
              </View>
              <Text style={styles.qrLabel}>VALIDAR</Text>
            </View>
          )}
        </View>

        {/* Linha Inferior: Informações de Validação + Status */}
        <View style={styles.headerBottom}>
          <View style={styles.headerBottomLeft}>
            {/* Data de Emissão */}
            <View style={styles.infoGroup}>
              <Text style={styles.infoLabel}>Emitido em</Text>
              <Text style={styles.infoValue}>
                {dataInscricao || new Date().toLocaleDateString('pt-BR')}
              </Text>
            </View>

            {/* Código de Validação */}
            <View style={styles.infoGroup}>
              <Text style={styles.infoLabel}>Código</Text>
              <Text style={styles.infoValue}>{codigoValidacao}</Text>
            </View>

            {/* Número do Participante */}
            <View style={styles.infoGroup}>
              <Text style={styles.infoLabel}>Nº Participante</Text>
              <Text style={styles.infoValue}>#{numeroParticipante}</Text>
            </View>
          </View>

          {/* Status Badge */}
          <View style={styles.statusBadgeHeader}>
            <Text style={styles.statusTextHeader}>✓ Confirmado</Text>
          </View>
        </View>
      </View>

      {/* Hero Card - Número do Participante */}
      <View style={heroCardStyle}>
        <Text style={styles.heroTitle}>
          {isRetirarCesta
            ? 'Retirada de Cesta'
            : isApenasNatal
            ? 'Comemoração de Natal'
            : 'Inscrição na Corrida'}
        </Text>
        <Text style={styles.heroNumber}>#{numeroParticipante}</Text>
        <Text style={styles.heroSubtitle}>Número do Participante</Text>
      </View>

      {/* Grid de Cards - Informações Principais */}
      <View style={styles.cardsGrid}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Participante</Text>
          <Text style={styles.cardValue}>{nome.split(' ')[0]}</Text>
          <Text style={styles.cardLabel}>{nome}</Text>
        </View>
        {isCorridaNatal && modalidadeCorrida && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Modalidade</Text>
            <Text style={styles.cardValue}>{modalidadeCorrida}</Text>
            <Text style={styles.cardLabel}>Corrida</Text>
          </View>
        )}
        {tamanho && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Camiseta</Text>
            <Text style={styles.cardValue}>{tamanho}</Text>
            <Text style={styles.cardLabel}>Tamanho</Text>
          </View>
        )}
      </View>

      {/* Seção: Dados de Contato */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados de Contato</Text>
        <View style={styles.infoRow}>
          <Text style={styles.rowLabel}>Email</Text>
          <Text style={styles.rowValue}>{email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.rowLabel}>WhatsApp</Text>
          <Text style={styles.rowValue}>{whatsapp}</Text>
        </View>
        {dataInscricao && (
          <View style={styles.infoRow}>
            <Text style={styles.rowLabel}>Data de Inscrição</Text>
            <Text style={styles.rowValue}>{dataInscricao}</Text>
          </View>
        )}
      </View>

      {/* Box de Destaque - Informações Específicas */}
      <View style={highlightBoxStyle}>
        <Text style={styles.highlightTitle}>
          {isRetirarCesta
            ? '🎁 Informações sobre a Retirada'
            : isApenasNatal
            ? '🎄 Informações sobre a Comemoração'
            : '🏃 Informações sobre a Corrida'}
        </Text>
        <Text style={styles.highlightText}>
          {isRetirarCesta
            ? 'Sua cesta natalina estará disponível para retirada nos dias 23 e 24 de dezembro de 2025, das 8h às 17h, no RH da FARMACE.'
            : isApenasNatal
            ? 'A comemoração de Natal acontecerá no dia 20 de dezembro de 2025. Mais informações serão enviadas por WhatsApp.'
            : 'A corrida acontecerá no dia 15 de dezembro de 2025, com largada às 7h00. Concentração a partir das 6h30. Local: FARMACE.'}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {dataInscricao || new Date().toLocaleDateString('pt-BR')}
        </Text>
        <Text style={styles.footerBrand}>
          CONFRATERNIZAÇÃO E II Corrida FARMACE - 2025
        </Text>
      </View>
    </Page>
  )
}

/**
 * Componente ReciboDocumentModerno - Wrapper com <Document>
 */
export const ReciboDocumentModerno = (props: ReciboPDFModernoProps) => (
  <Document>
    <ReciboPDFModerno {...props} />
  </Document>
)

