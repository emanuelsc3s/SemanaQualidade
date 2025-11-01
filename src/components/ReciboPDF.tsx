import { Document, Page, Text, View, StyleSheet, Svg, Path, Image } from '@react-pdf/renderer'

/**
 * Estilos do PDF - Replicando o layout do modal de confirmação
 * Baseado no design do modal (linhas 738-943 do InscricaoWizard.tsx)
 */
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    fontSize: 10
  },
  // Logomarca no topo esquerdo
  logoContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 80,
    height: 80,
    zIndex: 10
  },
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  // Cabeçalho do Recibo
  header: {
    borderBottom: '2 dashed #cbd5e1',
    paddingBottom: 12,
    marginBottom: 12,
    marginTop: 60, // Espaço para a logo
    textAlign: 'center'
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    margin: '0 auto 8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  iconCircleGreen: {
    backgroundColor: '#dcfce7' // green-100
  },
  iconCircleAmber: {
    backgroundColor: '#fef3c7' // amber-100
  },
  iconSvgContainer: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 28,
    height: 28
  },
  iconText: {
    fontSize: 28
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4
  },
  titleGreen: {
    color: '#16a34a' // green-600
  },
  titleAmber: {
    color: '#d97706' // amber-600
  },
  subtitle: {
    fontSize: 9,
    color: '#64748b' // slate-500
  },
  // Status Box
  statusBox: {
    backgroundColor: '#dcfce7', // green-50
    borderLeft: '4 solid #4ade80', // green-400
    padding: 10,
    borderRadius: 4,
    marginBottom: 10
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3
  },
  statusIconContainer: {
    width: 14,
    height: 14,
    position: 'relative'
  },
  statusEmoji: {
    fontSize: 14
  },
  statusTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#166534' // green-800
  },
  statusText: {
    fontSize: 9,
    color: '#16a34a' // green-600
  },
  // Número do Participante
  numeroBox: {
    backgroundColor: '#f0f9ff', // primary-50
    border: '1 solid #bae6fd', // primary-200
    borderRadius: 8,
    padding: 10,
    marginBottom: 10
  },
  numeroLabel: {
    fontSize: 9,
    color: '#475569', // slate-600
    marginBottom: 2
  },
  numeroValor: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0369a1', // primary-700
    letterSpacing: 1.5
  },
  // Dados do Inscrito
  dadosSection: {
    marginTop: 10,
    marginBottom: 10
  },
  dadoItem: {
    borderBottom: '1 solid #e2e8f0', // slate-200
    paddingBottom: 6,
    marginBottom: 6
  },
  dadoLabel: {
    fontSize: 8,
    color: '#64748b', // slate-500
    marginBottom: 2
  },
  dadoValor: {
    fontSize: 10,
    fontWeight: 'semibold',
    color: '#1e293b' // slate-800
  },
  dadoValorDestaque: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0369a1' // primary-700
  },
  dadoValorAmber: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#b45309' // amber-700
  },
  // Grid de 2 colunas
  gridRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6
  },
  gridCol: {
    flex: 1
  },
  gridCol2: {
    flex: 1,
    borderBottom: '1 solid #e2e8f0',
    paddingBottom: 6
  },
  // Grid de 3 colunas
  gridRow3: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6
  },
  gridCol3: {
    flex: 1,
    borderBottom: '1 solid #e2e8f0',
    paddingBottom: 6
  },
  // Info Box para "Retirar Cesta"
  infoBoxAmber: {
    backgroundColor: '#fffbeb', // amber-50
    border: '1 solid #fde68a', // amber-200
    borderRadius: 6,
    padding: 12,
    marginTop: 10,
    marginBottom: 10
  },
  infoBoxHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 6
  },
  infoBoxEmoji: {
    fontSize: 14
  },
  infoBoxTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#78350f', // amber-900
    marginBottom: 6
  },
  infoBoxText: {
    fontSize: 8,
    color: '#92400e', // amber-800
    marginBottom: 3
  },
  infoBoxTextBold: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 2
  },
  infoBoxDivider: {
    borderTop: '1 solid #fcd34d', // amber-300
    marginTop: 6,
    marginBottom: 6,
    paddingTop: 6
  },
  // WhatsApp Box
  whatsappBoxGreen: {
    backgroundColor: '#dcfce7', // green-50
    border: '1 solid #bbf7d0', // green-200
    borderRadius: 6,
    padding: 10,
    marginBottom: 10
  },
  whatsappBoxBlue: {
    backgroundColor: '#dbeafe', // blue-50
    border: '1 solid #bfdbfe', // blue-200
    borderRadius: 6,
    padding: 10,
    marginBottom: 10
  },
  whatsappHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6
  },
  whatsappEmoji: {
    fontSize: 12
  },
  whatsappContent: {
    flex: 1
  },
  whatsappTitle: {
    fontSize: 9,
    fontWeight: 'semibold',
    marginBottom: 2
  },
  whatsappTitleGreen: {
    color: '#166534' // green-800
  },
  whatsappTitleBlue: {
    color: '#1e3a8a' // blue-800
  },
  whatsappText: {
    fontSize: 8
  },
  whatsappTextGreen: {
    color: '#16a34a' // green-600
  },
  whatsappTextBlue: {
    color: '#2563eb' // blue-600
  },
  // Footer
  footer: {
    borderTop: '2 dashed #cbd5e1', // slate-300
    paddingTop: 12,
    marginTop: 12,
    textAlign: 'center'
  },
  footerText: {
    fontSize: 9,
    color: '#94a3b8' // slate-400
  }
})

/**
 * Interface para os dados do recibo
 */
interface ReciboPDFProps {
  nome: string
  email: string
  whatsapp: string
  numeroParticipante: string
  tipoParticipacao: string
  modalidadeCorrida?: string
  tamanho?: string
  dataInscricao: string
  whatsappSent: boolean
}

/**
 * Componente de PDF - Recibo de Inscrição
 * Replica o layout do modal de confirmação (InscricaoWizard.tsx linhas 738-943)
 */
export const ReciboPDF = ({
  nome,
  email,
  whatsapp,
  numeroParticipante,
  tipoParticipacao,
  modalidadeCorrida,
  tamanho,
  dataInscricao,
  whatsappSent
}: ReciboPDFProps) => {
  const isRetirarCesta = tipoParticipacao === 'retirar-cesta'
  const isCorridaNatal = tipoParticipacao === 'corrida-natal'

  return (
    <Page size="A4" style={styles.page}>
        {/* Logomarca no topo esquerdo */}
        <View style={styles.logoContainer}>
          <Image
            src="/logomarca.png"
            style={styles.logo}
          />
        </View>

        {/* Cabeçalho do Recibo */}
        <View style={styles.header}>
          <View style={[
            styles.iconCircle,
            isRetirarCesta ? styles.iconCircleAmber : styles.iconCircleGreen
          ]}>
            {isRetirarCesta ? (
              <Text style={styles.iconText}>🎁</Text>
            ) : (
              <View style={styles.iconSvgContainer}>
                <Svg viewBox="0 0 24 24" width="28" height="28">
                  <Path
                    d="M20 6 9 17l-5-5"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            )}
          </View>
          <Text style={[
            styles.title,
            isRetirarCesta ? styles.titleAmber : styles.titleGreen
          ]}>
            {isRetirarCesta ? 'Solicitação Registrada!' : 'Inscrição Realizada!'}
          </Text>
          <Text style={styles.subtitle}>
            {isRetirarCesta
              ? 'Comprovante de Retirada de Cesta Natalina'
              : 'Comprovante de Inscrição'}
          </Text>
        </View>

        {/* Status - Confirmado */}
        <View style={styles.statusBox}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIconContainer}>
              <Svg viewBox="0 0 24 24" width="14" height="14">
                <Path
                  d="M20 6 9 17l-5-5"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <Text style={styles.statusTitle}>Status: Confirmado</Text>
          </View>
          <Text style={styles.statusText}>
            {isRetirarCesta
              ? 'Sua cesta estará disponível para retirada'
              : 'Sua inscrição foi confirmada com sucesso!'}
          </Text>
        </View>

        {/* Número do Participante/Registro */}
        <View style={styles.numeroBox}>
          <Text style={styles.numeroLabel}>
            {isRetirarCesta ? 'Número de Registro' : 'Número do Participante'}
          </Text>
          <Text style={styles.numeroValor}>#{numeroParticipante}</Text>
        </View>

        {/* Dados do Inscrito */}
        <View style={styles.dadosSection}>
          {/* Nome */}
          <View style={styles.dadoItem}>
            <Text style={styles.dadoLabel}>Nome</Text>
            <Text style={styles.dadoValor}>{nome}</Text>
          </View>

          {/* E-mail */}
          <View style={styles.dadoItem}>
            <Text style={styles.dadoLabel}>E-mail</Text>
            <Text style={styles.dadoValor}>{email}</Text>
          </View>

          {/* WhatsApp, Categoria e Camiseta - Layout condicional */}
          {isRetirarCesta ? (
            // Layout para "Retirar Cesta" - Sem camiseta (2 colunas)
            <View style={styles.gridRow}>
              <View style={styles.gridCol2}>
                <Text style={styles.dadoLabel}>WhatsApp</Text>
                <Text style={styles.dadoValor}>{whatsapp}</Text>
              </View>
              <View style={styles.gridCol2}>
                <Text style={styles.dadoLabel}>Opção Escolhida</Text>
                <Text style={styles.dadoValorAmber}>RETIRAR CESTA</Text>
              </View>
            </View>
          ) : (
            // Layout padrão - Com camiseta (3 colunas)
            <View style={styles.gridRow3}>
              <View style={styles.gridCol3}>
                <Text style={styles.dadoLabel}>WhatsApp</Text>
                <Text style={styles.dadoValor}>{whatsapp}</Text>
              </View>
              <View style={styles.gridCol3}>
                <Text style={styles.dadoLabel}>Participação</Text>
                <Text style={styles.dadoValorDestaque}>
                  {isCorridaNatal
                    ? modalidadeCorrida?.toUpperCase()
                    : 'APENAS NATAL'}
                </Text>
              </View>
              <View style={styles.gridCol3}>
                <Text style={styles.dadoLabel}>Camiseta</Text>
                <Text style={styles.dadoValorDestaque}>{tamanho}</Text>
              </View>
            </View>
          )}

          {/* Data da Inscrição */}
          <View style={[styles.dadoItem, { borderTop: '1 solid #e2e8f0', paddingTop: 6 }]}>
            <Text style={styles.dadoLabel}>
              {isRetirarCesta ? 'Data do Registro' : 'Data da Inscrição'}
            </Text>
            <Text style={styles.dadoValor}>{dataInscricao}</Text>
          </View>
        </View>

        {/* Informações específicas para "Retirar Cesta" */}
        {isRetirarCesta && (
          <View style={styles.infoBoxAmber}>
            <View style={styles.infoBoxHeader}>
              <Text style={styles.infoBoxEmoji}>📍</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoBoxTitle}>Informações Importantes:</Text>
              </View>
            </View>
            <Text style={styles.infoBoxText}>❌ Você NÃO participará da II Corrida FARMACE</Text>
            <Text style={styles.infoBoxText}>❌ Você NÃO participará do evento de comemoração de Natal</Text>
            <View style={styles.infoBoxDivider}>
              <Text style={styles.infoBoxText}>
                ✅ Sua cesta natalina estará disponível para retirada presencial na FARMACE nos dias:
              </Text>
              <Text style={styles.infoBoxTextBold}>• 22 de Dezembro de 2025</Text>
              <Text style={styles.infoBoxTextBold}>• 23 de Dezembro de 2025</Text>
              <Text style={[styles.infoBoxText, { marginTop: 4 }]}>
                🕐 Horário: Das 8h às 17h
              </Text>
            </View>
          </View>
        )}

        {/* Aviso WhatsApp */}
        {whatsappSent ? (
          <View style={styles.whatsappBoxGreen}>
            <View style={styles.whatsappHeader}>
              <Text style={styles.whatsappEmoji}>✅</Text>
              <View style={styles.whatsappContent}>
                <Text style={[styles.whatsappTitle, styles.whatsappTitleGreen]}>
                  Mensagem enviada para seu WhatsApp!
                </Text>
                <Text style={[styles.whatsappText, styles.whatsappTextGreen]}>
                  Você receberá atualizações sobre sua inscrição via WhatsApp.
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.whatsappBoxBlue}>
            <View style={styles.whatsappHeader}>
              <Text style={styles.whatsappEmoji}>📱</Text>
              <View style={styles.whatsappContent}>
                <Text style={[styles.whatsappTitle, styles.whatsappTitleBlue]}>
                  Fique atento ao seu WhatsApp!
                </Text>
                <Text style={[styles.whatsappText, styles.whatsappTextBlue]}>
                  Você receberá atualizações importantes sobre o evento via WhatsApp.
                </Text>
              </View>
            </View>
          </View>
        )}

      {/* Rodapé do Recibo */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>CONFRATERNIZAÇÃO E II CORRIDA FARMACE - 2025</Text>
      </View>
    </Page>
  )
}

/**
 * Componente Document completo - Wrapper para o ReciboPDF
 */
export const ReciboDocument = (props: ReciboPDFProps) => (
  <Document>
    <ReciboPDF {...props} />
  </Document>
)

