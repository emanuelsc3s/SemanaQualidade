import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { DadosInscritosPorDepartamento } from '../services/inscricaoCorridaSupabaseService'

/**
 * Interface de dados para o relatório
 */
interface DadosRelatorio {
  inscritos: DadosInscritosPorDepartamento[]
  dataGeracao?: string
}

/**
 * Estilos inspirados no RelatorioDepartamentosPDF.tsx
 */
const styles = StyleSheet.create({
  page: {
    padding: 0,
    paddingBottom: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333333'
  },

  // Header Azul FARMACE
  header: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 50
  },
  logoContainer: {
    width: 35,
    height: 35,
    alignSelf: 'flex-start'
  },
  logo: {
    width: '90px',
    height: '90px',
    objectFit: 'contain'
  },
  headerTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2
  },
  headerEventName: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#ffffff',
    letterSpacing: 0.3,
    textAlign: 'right'
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    letterSpacing: 0.5,
    textAlign: 'right'
  },

  // SICFAR Header
  sicfarHeader: {
    paddingTop: 6,
    paddingBottom: 8,
    borderTop: '1 solid #e0e0e0',
    textAlign: 'center',
    backgroundColor: '#ffffff'
  },

  // Conteúdo Principal
  content: {
    padding: 24
  },

  // Título do Relatório
  reportTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center'
  },
  reportSubtitle: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center'
  },

  // Tabela
  table: {
    marginTop: 16,
    marginBottom: 16
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0ea5e9',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 4
  },
  tableHeaderCell: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    textAlign: 'center'
  },
  tableHeaderCellLeft: {
    textAlign: 'left'
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottom: '1 solid #e0e0e0'
  },
  tableRowEven: {
    backgroundColor: '#f8fafc'
  },
  tableCell: {
    fontSize: 9,
    color: '#333333',
    textAlign: 'center'
  },
  tableCellLeft: {
    textAlign: 'left',
    fontFamily: 'Helvetica-Bold'
  },
  tableCellNumber: {
    fontFamily: 'Helvetica-Bold',
    color: '#0ea5e9'
  },
  tableCellPercentGreen: {
    fontFamily: 'Helvetica-Bold',
    color: '#16a34a'
  },
  tableCellPercentAmber: {
    fontFamily: 'Helvetica-Bold',
    color: '#d97706'
  },
  tableCellPercentRed: {
    fontFamily: 'Helvetica-Bold',
    color: '#dc2626'
  },

  // Colunas da tabela (larguras)
  colDepartamento: {
    flex: 4
  },
  colFuncionarios: {
    flex: 2
  },
  colSemInscricao: {
    flex: 2
  },
  colPercentual: {
    flex: 2
  },

  // Linha de totais
  tableTotalRow: {
    flexDirection: 'row',
    backgroundColor: '#0369a1',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginTop: 4,
    borderRadius: 4
  },
  tableTotalCell: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    textAlign: 'center'
  },
  tableTotalCellLeft: {
    textAlign: 'left'
  },

  // Resumo
  summary: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderLeft: '4 solid #0ea5e9'
  },
  summaryTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#333333',
    marginBottom: 6
  },
  summaryText: {
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.5
  },

  // Rodapé Superior
  footerTop: {
    marginTop: 12,
    paddingTop: 6,
    borderTop: '1 solid #e0e0e0',
    textAlign: 'center',
    marginBottom: 8
  },
  footerText: {
    fontSize: 7,
    color: '#999999',
    marginBottom: 2
  },

  // Rodapé Inferior (fixo em todas as páginas)
  footerBottom: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingTop: 6,
    paddingBottom: 8,
    borderTop: '1 solid #e0e0e0',
    textAlign: 'center',
    backgroundColor: '#ffffff'
  },
  footerTextBold: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#999999'
  },
  footerTextHighlight: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#0ea5e9'
  }
})

/**
 * Componente RelatorioInscritosPDFPage - Conteúdo do PDF (Page)
 */
const RelatorioInscritosPDFPage: React.FC<{ dados: DadosRelatorio }> = ({ dados }) => {
  const { inscritos, dataGeracao } = dados

  // Calcula totais gerais
  const totalFuncionarios = inscritos.reduce((sum, d) => sum + d.total_funcionarios, 0)
  const totalInscritos = inscritos.reduce((sum, d) => sum + d.total_inscritos, 0)
  const totalSemInscricao = inscritos.reduce((sum, d) => sum + d.sem_inscricao, 0)
  const percentualGeralAdesao = totalFuncionarios > 0
    ? ((totalInscritos / totalFuncionarios) * 100)
    : 0

  const dataExibicao = dataGeracao || new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  // Função para determinar estilo do percentual
  const getPercentualStyle = (percentual: number) => {
    if (percentual === 100) return styles.tableCellPercentGreen
    if (percentual >= 50) return styles.tableCellPercentAmber
    return styles.tableCellPercentRed
  }

  return (
    <Page size="A4" style={styles.page}>
      {/* Header Azul FARMACE - Fixo em todas as páginas */}
      <View style={styles.header} fixed>
        <View style={styles.logoContainer}>
          <Image src="/logomarca.png" style={styles.logo} />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerEventName}>CONFRATERNIZAÇÃO E II CORRIDA DA QUALIDADE - 2025</Text>
          <Text style={styles.headerTitle}>Relatório de Inscritos por Departamento</Text>
        </View>
      </View>

      {/* SICFAR Header - Fixo em todas as páginas */}
      <View style={styles.sicfarHeader} fixed>
        <Text style={styles.footerTextBold}>
          <Text style={styles.footerTextHighlight}>SICFAR</Text>
          <Text> Manager - Plataforma de Gestão Computacional </Text>
          <Text style={styles.footerTextHighlight}>FARMACE</Text>
        </Text>
      </View>

      {/* Conteúdo Principal */}
      <View style={styles.content}>
        {/* Título do Relatório */}
        <Text style={styles.reportTitle}>Inscritos por Departamento - II Corrida da Qualidade</Text>
        <Text style={styles.reportSubtitle}>
          Gerado em: {dataExibicao} | Total de Funcionários: {totalFuncionarios} | Total de Inscritos: {totalInscritos} | Adesão Geral: {percentualGeralAdesao.toFixed(1)}%
        </Text>

        {/* Tabela */}
        <View style={styles.table}>
          {/* Cabeçalho */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.tableHeaderCellLeft, styles.colDepartamento]}>
              Departamento
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colFuncionarios]}>Total Func.</Text>
            <Text style={[styles.tableHeaderCell, styles.colSemInscricao]}>Sem Inscrição</Text>
            <Text style={[styles.tableHeaderCell, styles.colPercentual]}>% Adesão</Text>
          </View>

          {/* Linhas de dados - wrap={false} evita quebra no meio do registro */}
          {inscritos.map((dept, index) => (
            <View
              key={index}
              wrap={false}
              style={[
                styles.tableRow,
                index % 2 === 0 ? styles.tableRowEven : {}
              ]}
            >
              <Text style={[styles.tableCell, styles.tableCellLeft, styles.colDepartamento]}>
                {dept.lotacao}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellNumber, styles.colFuncionarios]}>
                {dept.total_funcionarios}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellNumber, styles.colSemInscricao]}>
                {dept.sem_inscricao}
              </Text>
              <Text style={[styles.tableCell, getPercentualStyle(dept.percentual_adesao), styles.colPercentual]}>
                {dept.percentual_adesao.toFixed(1)}%
              </Text>
            </View>
          ))}

          {/* Linha de totais */}
          <View style={styles.tableTotalRow}>
            <Text style={[styles.tableTotalCell, styles.tableTotalCellLeft, styles.colDepartamento]}>
              TOTAL GERAL
            </Text>
            <Text style={[styles.tableTotalCell, styles.colFuncionarios]}>{totalFuncionarios}</Text>
            <Text style={[styles.tableTotalCell, styles.colSemInscricao]}>{totalSemInscricao}</Text>
            <Text style={[styles.tableTotalCell, styles.colPercentual]}>{percentualGeralAdesao.toFixed(1)}%</Text>
          </View>
        </View>

        {/* Resumo */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Resumo do Relatório</Text>
          <Text style={styles.summaryText}>
            • Total de departamentos: {inscritos.length}
          </Text>
          <Text style={styles.summaryText}>
            • Total de funcionários registrados: {totalFuncionarios}
          </Text>
          <Text style={styles.summaryText}>
            • Total de funcionários com inscrição: {totalInscritos}
          </Text>
          <Text style={styles.summaryText}>
            • Total de funcionários sem inscrição: {totalSemInscricao}
          </Text>
          <Text style={styles.summaryText}>
            • Percentual geral de adesão: {percentualGeralAdesao.toFixed(1)}%
          </Text>
          {inscritos.length > 0 && (
            <Text style={styles.summaryText}>
              • Departamento com maior adesão: {inscritos[0].lotacao} ({inscritos[0].percentual_adesao.toFixed(1)}%)
            </Text>
          )}
        </View>

        {/* Rodapé Superior */}
        <View style={styles.footerTop}>
          <Text style={styles.footerText}>
            Este relatório apresenta o percentual de adesão de cada departamento na II Corrida da Qualidade FARMACE
          </Text>
          <Text style={styles.footerText}>
            Dados extraídos do sistema em {dataExibicao}
          </Text>
        </View>
      </View>

      {/* Rodapé Inferior - Fixo em todas as páginas */}
      <View style={styles.footerBottom} fixed>
        <Text style={styles.footerTextBold}>
          <Text style={styles.footerTextHighlight}>SICFAR</Text>
          <Text> Manager - Plataforma de Gestão Computacional </Text>
          <Text style={styles.footerTextHighlight}>FARMACE</Text>
        </Text>
      </View>
    </Page>
  )
}

/**
 * Componente Document completo - Wrapper para o RelatorioInscritosPDFPage
 */
export const RelatorioInscritosPDF: React.FC<{ dados: DadosRelatorio }> = (props) => (
  <Document>
    <RelatorioInscritosPDFPage {...props} />
  </Document>
)

export default RelatorioInscritosPDF
