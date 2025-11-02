# ⚛️ Integração React - Modificar Aplicação

## 📋 Índice

1. [Criar Serviço de Fila](#1-criar-serviço-de-fila)
2. [Modificar InscricaoWizard](#2-modificar-inscricaowizard)
3. [Atualizar Mensagens de Confirmação](#3-atualizar-mensagens-de-confirmação)
4. [Criar Hook de Monitoramento (Opcional)](#4-criar-hook-de-monitoramento-opcional)
5. [Testar Integração](#5-testar-integração)

---

## 1. Criar Serviço de Fila

### Passo 1.1: Criar arquivo `whatsappQueueService.ts`

Crie o arquivo: `src/services/whatsappQueueService.ts`

```typescript
/**
 * Serviço de Fila de Mensagens WhatsApp
 * Adiciona mensagens à fila do Supabase para envio controlado
 */

import { supabase } from '@/lib/supabaseClient'

// ============================================================================
// INTERFACES
// ============================================================================

interface QueueMessageParams {
  phoneNumber: string
  message: string
  documentBase64?: string
  documentFilename?: string
  documentMimetype?: string
  priority?: number
  scheduledFor?: Date
  metadata?: Record<string, any>
}

interface QueueMessageResponse {
  success: boolean
  queueId?: string
  error?: string
}

interface QueueStatusResponse {
  success: boolean
  status?: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled'
  sentAt?: string
  error?: string
}

// ============================================================================
// FUNÇÕES PRINCIPAIS
// ============================================================================

/**
 * Adiciona uma mensagem à fila de envio WhatsApp
 * 
 * @param params - Parâmetros da mensagem
 * @returns Promise com resultado da operação
 */
export async function addToWhatsAppQueue({
  phoneNumber,
  message,
  documentBase64,
  documentFilename,
  documentMimetype = 'application/pdf',
  priority = 0,
  scheduledFor,
  metadata
}: QueueMessageParams): Promise<QueueMessageResponse> {
  try {
    console.log('📥 [WhatsApp Queue] Adicionando mensagem à fila...')
    console.log('📱 [WhatsApp Queue] Telefone:', phoneNumber)
    console.log('📝 [WhatsApp Queue] Prioridade:', priority)
    console.log('📊 [WhatsApp Queue] Metadata:', metadata)

    // Formata o número de telefone (remove caracteres especiais)
    const formattedPhone = formatPhoneNumber(phoneNumber)

    // Prepara os dados para inserção
    const queueData = {
      phone_number: formattedPhone,
      message,
      document_base64: documentBase64,
      document_filename: documentFilename,
      document_mimetype: documentMimetype,
      priority,
      scheduled_for: scheduledFor?.toISOString() || new Date().toISOString(),
      metadata,
      status: 'pending' as const
    }

    // Insere na tabela tbwhatsapp
    const { data, error } = await supabase
      .from('tbwhatsapp')
      .insert(queueData)
      .select()
      .single()

    if (error) {
      console.error('❌ [WhatsApp Queue] Erro ao adicionar à fila:', error)
      throw error
    }

    console.log('✅ [WhatsApp Queue] Mensagem adicionada com sucesso!')
    console.log('🆔 [WhatsApp Queue] ID da fila:', data.id)

    return { 
      success: true, 
      queueId: data.id 
    }

  } catch (error) {
    console.error('❌ [WhatsApp Queue] Erro:', error)
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido ao adicionar à fila'
    }
  }
}

/**
 * Consulta o status de uma mensagem na fila
 * 
 * @param queueId - ID da mensagem na fila
 * @returns Promise com status da mensagem
 */
export async function getQueueMessageStatus(queueId: string): Promise<QueueStatusResponse> {
  try {
    console.log('🔍 [WhatsApp Queue] Consultando status da mensagem:', queueId)

    const { data, error } = await supabase
      .from('tbwhatsapp')
      .select('status, sent_at, last_error')
      .eq('id', queueId)
      .single()

    if (error) {
      console.error('❌ [WhatsApp Queue] Erro ao consultar status:', error)
      throw error
    }

    console.log('✅ [WhatsApp Queue] Status:', data.status)

    return {
      success: true,
      status: data.status,
      sentAt: data.sent_at,
      error: data.last_error
    }

  } catch (error) {
    console.error('❌ [WhatsApp Queue] Erro:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao consultar status'
    }
  }
}

/**
 * Consulta estatísticas da fila
 * 
 * @returns Promise com estatísticas
 */
export async function getQueueStats() {
  try {
    console.log('📊 [WhatsApp Queue] Consultando estatísticas...')

    const { data, error } = await supabase
      .from('tbwhatsapp_stats')
      .select('*')

    if (error) {
      console.error('❌ [WhatsApp Queue] Erro ao consultar estatísticas:', error)
      throw error
    }

    console.log('✅ [WhatsApp Queue] Estatísticas:', data)

    return {
      success: true,
      stats: data
    }

  } catch (error) {
    console.error('❌ [WhatsApp Queue] Erro:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao consultar estatísticas'
    }
  }
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Formata o número de telefone para o padrão internacional
 * 
 * @param phone - Número de telefone formatado (ex: "(88) 99642-0521")
 * @returns Número no formato internacional (ex: "5588996420521")
 */
function formatPhoneNumber(phone: string): string {
  // Remove todos os caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '')
  
  // Se já tem código do país (55), retorna como está
  if (cleanPhone.startsWith('55')) {
    return cleanPhone
  }
  
  // Adiciona código do país Brasil (55)
  return `55${cleanPhone}`
}

/**
 * Gera mensagem de confirmação para o usuário
 * Informa que a mensagem será enviada em breve
 */
export function getQueueConfirmationMessage(tipo: 'confirmacao' | 'pdf'): string {
  if (tipo === 'confirmacao') {
    return '✅ Sua inscrição foi registrada com sucesso! Você receberá a confirmação via WhatsApp em breve (até 10 minutos).'
  } else {
    return '📄 O comprovante em PDF será enviado para seu WhatsApp em breve (até 15 minutos).'
  }
}
```

---

## 2. Modificar InscricaoWizard

### Passo 2.1: Importar o novo serviço

No arquivo `src/pages/InscricaoWizard.tsx`, adicione a importação:

```typescript
// Substituir esta linha:
// import { sendWhatsAppMessage, sendWhatsAppDocument, ... } from '@/services/whatsappService'

// Por estas linhas:
import { gerarMensagemConfirmacao, gerarMensagemRetirarCesta, gerarMensagemApenasNatal } from '@/services/whatsappService'
import { addToWhatsAppQueue, getQueueConfirmationMessage } from '@/services/whatsappQueueService'
```

### Passo 2.2: Modificar função `handleSubmit` (Corrida + Natal)

Localize a função `handleSubmit` (linha ~640) e modifique:

```typescript
// ANTES (envio direto):
const resultado = await sendWhatsAppMessage({
  phoneNumber: formData.whatsapp,
  message: mensagem
})

// DEPOIS (adicionar à fila):
const resultado = await addToWhatsAppQueue({
  phoneNumber: formData.whatsapp,
  message: mensagem,
  priority: 1, // Alta prioridade para confirmação
  metadata: {
    tipo: 'confirmacao_inscricao',
    numeroParticipante: numeroParticipanteRetornado,
    nome: formData.nome,
    modalidade: formData.modalidadeCorrida
  }
})
```

### Passo 2.3: Modificar envio de PDF

Localize o envio do PDF (linha ~739) e modifique:

```typescript
// ANTES (envio direto):
const resultadoPDF = await sendWhatsAppDocument({
  phoneNumber: formData.whatsapp,
  message: '📋 Aqui está o comprovante da sua inscrição em PDF!',
  documentBase64: pdfBase64,
  fileName: `Comprovante_Inscricao_${numeroParticipanteRetornado}.pdf`,
  mimeType: 'application/pdf'
})

// DEPOIS (adicionar à fila):
const resultadoPDF = await addToWhatsAppQueue({
  phoneNumber: formData.whatsapp,
  message: '📋 Aqui está o comprovante da sua inscrição em PDF!',
  documentBase64: pdfBase64,
  documentFilename: `Comprovante_Inscricao_${numeroParticipanteRetornado}.pdf`,
  documentMimetype: 'application/pdf',
  priority: 2, // Prioridade maior para PDF
  metadata: {
    tipo: 'comprovante_pdf',
    numeroParticipante: numeroParticipanteRetornado,
    nome: formData.nome
  }
})
```

### Passo 2.4: Modificar função `handleSubmitApenasNatal`

Localize a função `handleSubmitApenasNatal` (linha ~340) e modifique:

```typescript
// Mensagem de confirmação
const resultado = await addToWhatsAppQueue({
  phoneNumber: formData.whatsapp,
  message: gerarMensagemApenasNatal(formData.nome, numeroParticipanteRetornado, formData.tamanho),
  priority: 1,
  metadata: {
    tipo: 'confirmacao_apenas_natal',
    numeroParticipante: numeroParticipanteRetornado,
    nome: formData.nome
  }
})

// PDF
const resultadoPDF = await addToWhatsAppQueue({
  phoneNumber: formData.whatsapp,
  message: '📋 Comprovante de participação na Confraternização',
  documentBase64: pdfBase64,
  documentFilename: `Comprovante_Natal_${numeroParticipanteRetornado}.pdf`,
  documentMimetype: 'application/pdf',
  priority: 2,
  metadata: {
    tipo: 'comprovante_natal_pdf',
    numeroParticipante: numeroParticipanteRetornado
  }
})
```

### Passo 2.5: Modificar função `handleSubmitRetirarCesta`

Localize a função `handleSubmitRetirarCesta` (linha ~500) e modifique:

```typescript
// Mensagem de confirmação
const resultado = await addToWhatsAppQueue({
  phoneNumber: formData.whatsapp,
  message: gerarMensagemRetirarCesta(formData.nome, numeroParticipanteRetornado),
  priority: 1,
  metadata: {
    tipo: 'confirmacao_retirar_cesta',
    numeroParticipante: numeroParticipanteRetornado,
    nome: formData.nome
  }
})

// PDF
const resultadoPDF = await addToWhatsAppQueue({
  phoneNumber: formData.whatsapp,
  message: '📋 Comprovante de retirada de cesta natalina',
  documentBase64: pdfBase64,
  documentFilename: `Comprovante_Cesta_${numeroParticipanteRetornado}.pdf`,
  documentMimetype: 'application/pdf',
  priority: 2,
  metadata: {
    tipo: 'comprovante_cesta_pdf',
    numeroParticipante: numeroParticipanteRetornado
  }
})
```

---

## 3. Atualizar Mensagens de Confirmação

### Passo 3.1: Modificar mensagem de sucesso no modal

Localize o modal de confirmação e atualize a mensagem:

```typescript
// ANTES:
<p className="text-slate-600">
  Você receberá uma mensagem de confirmação no WhatsApp em instantes.
</p>

// DEPOIS:
<p className="text-slate-600">
  {getQueueConfirmationMessage('confirmacao')}
</p>
<p className="text-slate-500 text-sm mt-2">
  💡 As mensagens são enviadas gradualmente para garantir a entrega.
</p>
```

---

## 4. Criar Hook de Monitoramento (Opcional)

### Passo 4.1: Criar `useQueueStatus.ts`

Crie o arquivo: `src/hooks/useQueueStatus.ts`

```typescript
import { useState, useEffect } from 'react'
import { getQueueMessageStatus } from '@/services/whatsappQueueService'

export function useQueueStatus(queueId: string | null) {
  const [status, setStatus] = useState<'pending' | 'processing' | 'sent' | 'failed' | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!queueId) return

    const checkStatus = async () => {
      setLoading(true)
      const result = await getQueueMessageStatus(queueId)
      if (result.success && result.status) {
        setStatus(result.status)
      }
      setLoading(false)
    }

    // Verifica imediatamente
    checkStatus()

    // Verifica a cada 30 segundos até ser enviada
    const interval = setInterval(() => {
      if (status !== 'sent' && status !== 'failed') {
        checkStatus()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [queueId, status])

  return { status, loading }
}
```

### Passo 4.2: Usar o hook no InscricaoWizard

```typescript
// No componente InscricaoWizard
const [queueId, setQueueId] = useState<string | null>(null)
const { status: queueStatus } = useQueueStatus(queueId)

// Ao adicionar à fila
const resultado = await addToWhatsAppQueue({ ... })
if (resultado.success && resultado.queueId) {
  setQueueId(resultado.queueId)
}

// Exibir status no modal
{queueStatus === 'sent' && (
  <div className="text-green-600 text-sm">
    ✅ Mensagem enviada com sucesso!
  </div>
)}
{queueStatus === 'pending' && (
  <div className="text-amber-600 text-sm">
    ⏳ Aguardando envio...
  </div>
)}
```

---

## 5. Testar Integração

### Passo 5.1: Teste Local

```bash
# Iniciar aplicação
npm run dev

# Acessar
http://localhost:5173/inscricao
```

### Passo 5.2: Fazer Inscrição de Teste

1. Preencha o formulário com seus dados
2. Use seu número de WhatsApp real
3. Confirme a inscrição
4. Verifique se aparece a mensagem: "Você receberá a confirmação via WhatsApp em breve"

### Passo 5.3: Verificar no Supabase

```sql
-- Ver mensagens na fila
SELECT * FROM tbwhatsapp 
WHERE phone_number = '5588996420521' 
ORDER BY created_at DESC;

-- Ver estatísticas
SELECT * FROM tbwhatsapp_stats;
```

### Passo 5.4: Aguardar Processamento

- Aguarde até 5 minutos (intervalo do Cron Job)
- Verifique se recebeu a mensagem no WhatsApp
- Verifique se o status mudou para 'sent'

---

## ✅ Checklist de Integração

- [ ] Arquivo `whatsappQueueService.ts` criado
- [ ] Importações atualizadas no `InscricaoWizard.tsx`
- [ ] Função `handleSubmit` modificada
- [ ] Função `handleSubmitApenasNatal` modificada
- [ ] Função `handleSubmitRetirarCesta` modificada
- [ ] Mensagens de confirmação atualizadas
- [ ] Teste local realizado
- [ ] Mensagem adicionada à fila com sucesso
- [ ] Mensagem recebida no WhatsApp

---

**Próximo arquivo:** [05_MONITORAMENTO.md](./05_MONITORAMENTO.md)

