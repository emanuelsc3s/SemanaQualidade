# 📄 Geração de PDF - Recibo de Inscrição

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Componente ReciboPDFInter](#componente-recibopdfinter)
3. [Bibliotecas Utilizadas](#bibliotecas-utilizadas)
4. [Estrutura de Dados](#estrutura-de-dados)
5. [Processo de Geração](#processo-de-geração)
6. [Exemplo de Implementação](#exemplo-de-implementação)
7. [Observações Importantes](#observações-importantes)

---

## Visão Geral

O sistema de geração de PDF utiliza a biblioteca **@react-pdf/renderer** para criar recibos de inscrição profissionais no estilo de fatura do Banco Inter, adaptado para o contexto da II Corrida FARMACE.

### Características Principais

- ✅ **Design Profissional**: Inspirado na fatura do Banco Inter
- ✅ **Responsivo**: Layout adaptado para impressão A4
- ✅ **Segurança**: Dados sensíveis (CPF, email) são ocultados parcialmente
- ✅ **QR Code**: Validação digital da inscrição
- ✅ **Múltiplos Formatos**: Blob, Base64, Download direto

---

## Componente ReciboPDFInter

### Localização
```
src/components/ReciboPDFInter.tsx
```

### Estrutura do Componente

O componente é dividido em duas partes principais:

1. **ReciboPDFInterPage**: Componente que renderiza o conteúdo da página
2. **ReciboPDFInter**: Wrapper Document que encapsula a página

### Interface de Dados

```typescript
interface DadosRecibo {
  nome: string
  email: string
  cpf?: string
  whatsapp: string
  numeroParticipante: string
  tipoParticipacao: 'corrida-natal' | 'apenas-natal' | 'retirar-cesta'
  modalidadeCorrida?: string
  tamanho?: string
  dataInscricao?: string
  whatsappSent?: boolean
  qrCodeDataUrl?: string
}
```

### Elementos Visuais

#### 1. Header Azul FARMACE
- Cor de fundo: `#0ea5e9` (azul FARMACE)
- Logo da FARMACE (90x90px)
- Título do evento
- Tipo de comprovante

#### 2. SICFAR Header
- Branding da plataforma de gestão
- Posicionado logo após o header azul

#### 3. Card Principal
Layout em 3 colunas:
- **Coluna 1 (Esquerda)**: Número do participante em destaque
- **Coluna 2 (Centro)**: Modalidade e tamanho da camiseta
- **Coluna 3 (Direita)**: Datas (inscrição e evento)

#### 4. Seção de Destaque
- Status da inscrição (sempre "Confirmado")
- Mensagem personalizada por tipo de participação

#### 5. Tabela de Informações
- Nome completo
- CPF (parcialmente oculto)
- Email (parcialmente oculto)
- WhatsApp

#### 6. Seção de Validação (2 colunas)
- **Coluna Esquerda**: Código de validação alfanumérico
- **Coluna Direita**: QR Code para validação digital

#### 7. Rodapés
- **Rodapé Superior**: Informações do evento
- **Rodapé Inferior**: Copyright SICFAR (posição absoluta no final da página)

---

## Bibliotecas Utilizadas

### 1. @react-pdf/renderer

**Versão**: Verificar em `package.json`

**Instalação**:
```bash
npm install @react-pdf/renderer
```

**Uso Principal**:
- Criação de documentos PDF usando componentes React
- Estilização com StyleSheet (similar ao React Native)
- Renderização de elementos: `Document`, `Page`, `View`, `Text`, `Image`

### 2. qrcode

**Versão**: Verificar em `package.json`

**Instalação**:
```bash
npm install qrcode
npm install --save-dev @types/qrcode
```

**Uso Principal**:
- Geração de QR Codes em formato Data URL (base64)
- Configuração de cores, tamanho e margem

---

## Estrutura de Dados

### Dados Obrigatórios

```typescript
{
  nome: "João Silva",
  email: "joao.silva@farmace.com.br",
  whatsapp: "(88) 99642-0521",
  numeroParticipante: "000123",
  tipoParticipacao: "corrida-natal"
}
```

### Dados Opcionais

```typescript
{
  cpf: "123.456.789-10",
  modalidadeCorrida: "5km",
  tamanho: "M",
  dataInscricao: "10/12/2025",
  whatsappSent: true,
  qrCodeDataUrl: "data:image/png;base64,..."
}
```

### Funções de Ocultação de Dados Sensíveis

#### Ocultar CPF
```typescript
const ocultarCPF = (cpf: string): string => {
  // Entrada: "123.456.789-10"
  // Saída: "123.456.789-**"
  const cpfNumeros = cpf.replace(/\D/g, '')
  return `${cpfNumeros.slice(0, 3)}.${cpfNumeros.slice(3, 6)}.${cpfNumeros.slice(6, 9)}-**`
}
```

#### Ocultar Email
```typescript
const ocultarEmail = (email: string): string => {
  // Entrada: "joao.silva@farmace.com.br"
  // Saída: "joa*****@farmace.com.br"
  const [usuario, dominio] = email.split('@')
  const usuarioOculto = usuario.slice(0, 3) + '*****'
  return `${usuarioOculto}@${dominio}`
}
```

---

## Processo de Geração

### Fluxo Completo

```
1. Receber dados do participante
   ↓
2. Gerar QR Code (opcional)
   ↓
3. Criar componente ReciboPDFInter com dados
   ↓
4. Renderizar PDF usando @react-pdf/renderer
   ↓
5. Converter para formato desejado (Blob, Base64, Download)
```

### Funções Disponíveis (src/utils/pdfGenerator.ts)

#### 1. gerarReciboPDFInter(dados)
Gera o PDF como **Blob**

```typescript
const blob = await gerarReciboPDFInter({
  nome: "João Silva",
  email: "joao@farmace.com.br",
  whatsapp: "(88) 99642-0521",
  numeroParticipante: "000123",
  tipoParticipacao: "corrida-natal",
  modalidadeCorrida: "5km",
  tamanho: "M"
})
```

#### 2. gerarReciboPDFInterBase64(dados)
Gera o PDF como **Base64** (data URL completo)

```typescript
const base64 = await gerarReciboPDFInterBase64({
  nome: "João Silva",
  // ... outros dados
})
// Retorna: "data:application/pdf;base64,JVBERi0xLjMKJf..."
```

#### 3. downloadReciboPDFInter(dados, nomeArquivo?)
Faz **download direto** no navegador

```typescript
await downloadReciboPDFInter(
  {
    nome: "João Silva",
    // ... outros dados
  },
  "Comprovante_Inscricao_000123.pdf" // opcional
)
```

#### 4. gerarQRCode(dados)
Gera apenas o **QR Code** em Data URL

```typescript
const qrCodeDataUrl = await gerarQRCode({
  nome: "João Silva",
  numeroParticipante: "000123",
  tipoParticipacao: "corrida-natal",
  modalidadeCorrida: "5km"
})
// Retorna: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
```

---

## Exemplo de Implementação

### Cenário: Gerar e Enviar PDF via WhatsApp

```typescript
import { gerarReciboPDFInterBase64 } from '@/utils/pdfGenerator'
import { sendWhatsAppDocument } from '@/services/whatsappService'

async function enviarReciboPorWhatsApp(dadosParticipante) {
  try {
    // 1. Gerar PDF em Base64
    console.log('📄 Gerando PDF do recibo...')
    const pdfBase64String = await gerarReciboPDFInterBase64({
      nome: dadosParticipante.nome,
      email: dadosParticipante.email,
      cpf: dadosParticipante.cpf,
      whatsapp: dadosParticipante.whatsapp,
      numeroParticipante: dadosParticipante.numeroParticipante,
      tipoParticipacao: dadosParticipante.tipoParticipacao,
      modalidadeCorrida: dadosParticipante.modalidadeCorrida,
      tamanho: dadosParticipante.tamanho,
      whatsappSent: true
    })

    // 2. Remover prefixo "data:application/pdf;base64," se existir
    const pdfBase64 = pdfBase64String.includes(',')
      ? pdfBase64String.split(',')[1]
      : pdfBase64String

    console.log('✅ PDF gerado com sucesso!')

    // 3. Enviar via WhatsApp
    console.log('📤 Enviando PDF via WhatsApp...')
    const resultado = await sendWhatsAppDocument({
      phoneNumber: dadosParticipante.whatsapp,
      message: '📋 Aqui está o comprovante da sua inscrição em PDF!',
      documentBase64: pdfBase64,
      fileName: `Comprovante_Inscricao_${dadosParticipante.numeroParticipante}.pdf`,
      mimeType: 'application/pdf'
    })

    if (resultado.success) {
      console.log('✅ PDF enviado via WhatsApp com sucesso!')
      return { success: true }
    } else {
      console.error('❌ Erro ao enviar PDF:', resultado.error)
      return { success: false, error: resultado.error }
    }

  } catch (error) {
    console.error('❌ Erro ao processar PDF:', error)
    return { success: false, error: 'Erro ao gerar/enviar PDF' }
  }
}
```

---

## Observações Importantes

### 1. Segurança e LGPD

⚠️ **Dados Sensíveis Sempre Ocultos no PDF**:
- CPF: Mostra apenas `XXX.XXX.XXX-**` (últimos 2 dígitos ocultos)
- Email: Mostra apenas `xxx*****@dominio.com.br` (primeiros 3 caracteres + domínio)

### 2. Performance

- **Geração de QR Code**: Adiciona ~200-500ms ao tempo de geração
- **Tamanho do PDF**: Aproximadamente 50-150 KB (dependendo do QR Code)
- **Conversão para Base64**: Aumenta o tamanho em ~33%

### 3. Compatibilidade

✅ **Navegadores Suportados**:
- Chrome/Edge (Chromium) 90+
- Firefox 88+
- Safari 14+

❌ **Limitações**:
- Não funciona em Internet Explorer
- Requer JavaScript habilitado

### 4. Estilização

O componente usa **StyleSheet** do @react-pdf/renderer, que é similar ao React Native:

```typescript
const styles = StyleSheet.create({
  page: {
    padding: 0,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    fontSize: 10
  },
  header: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 10,
    paddingHorizontal: 20
  }
  // ... outros estilos
})
```

**Diferenças do CSS Web**:
- Usa `paddingVertical` e `paddingHorizontal` ao invés de `padding-top`, `padding-bottom`
- Usa `flexDirection: 'row'` ao invés de `flex-direction: row`
- Não suporta todas as propriedades CSS (ex: `box-shadow`, `transform`)

### 5. Fontes Disponíveis

Fontes padrão do @react-pdf/renderer:
- `Helvetica` (padrão)
- `Helvetica-Bold`
- `Helvetica-Oblique`
- `Helvetica-BoldOblique`
- `Times-Roman`
- `Courier`

Para usar fontes customizadas, é necessário registrá-las com `Font.register()`.

### 6. Debugging

Para debugar o PDF durante o desenvolvimento:

```typescript
// Fazer download do PDF para visualizar
await downloadReciboPDFInter(dados, 'teste.pdf')

// Ou abrir em nova aba (usando Blob URL)
const blob = await gerarReciboPDFInter(dados)
const url = URL.createObjectURL(blob)
window.open(url, '_blank')
```

---

## 🔗 Referências

- [Documentação @react-pdf/renderer](https://react-pdf.org/)
- [Exemplos de Layouts](https://react-pdf.org/examples)
- [API Reference](https://react-pdf.org/components)
- [QRCode.js Documentation](https://github.com/soldair/node-qrcode)

---

**Última atualização**: 2025-11-02  
**Versão**: 1.0.0  
**Autor**: Sistema SICFAR - FARMACE

