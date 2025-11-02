# ⚡ Edge Function - Processamento da Fila WhatsApp

## 📋 Índice

1. [Visão Geral](#1-visão-geral)
2. [Instalação do Supabase CLI](#2-instalação-do-supabase-cli)
3. [Criar Edge Function](#3-criar-edge-function)
4. [Implementar Código](#4-implementar-código)
5. [Configurar Variáveis de Ambiente](#5-configurar-variáveis-de-ambiente)
6. [Deploy da Function](#6-deploy-da-function)
7. [Configurar Cron Job](#7-configurar-cron-job)
8. [Testar a Function](#8-testar-a-function)

---

## 1. Visão Geral

### O que é uma Edge Function?

Edge Functions são funções serverless que rodam no Supabase (usando Deno runtime). Elas são perfeitas para:
- Processamento assíncrono
- Tarefas agendadas (Cron Jobs)
- Integração com APIs externas
- Lógica de negócio complexa

### Nossa Edge Function

**Nome:** `process-whatsapp-queue`

**Função:** Processar mensagens pendentes da fila WhatsApp

**Execução:** A cada 5 minutos (via Cron Job)

**Fluxo:**
```
1. Buscar até 5 mensagens pendentes (status='pending')
2. Para cada mensagem:
   a. Marcar como 'processing'
   b. Enviar via Evolution API
   c. Aguardar delay (12-20 segundos)
   d. Marcar como 'sent' ou 'failed'
3. Retornar resultado do processamento
```

---

## 2. Instalação do Supabase CLI

### Passo 2.1: Instalar Supabase CLI

**No Linux/macOS:**
```bash
npm install -g supabase
```

**Ou usando Homebrew (macOS):**
```bash
brew install supabase/tap/supabase
```

### Passo 2.2: Verificar Instalação

```bash
supabase --version
```

Deve retornar algo como: `1.x.x`

### Passo 2.3: Login no Supabase

```bash
supabase login
```

Isso abrirá o navegador para autenticação.

### Passo 2.4: Linkar com seu Projeto

```bash
cd /home/emanuel/SemanaQualidade
supabase link --project-ref dojavjvqvobnumebaouc
```

**Nota:** `dojavjvqvobnumebaouc` é o ID do seu projeto APFAR.

---

## 3. Criar Edge Function

### Passo 3.1: Criar Estrutura da Function

```bash
cd /home/emanuel/SemanaQualidade
supabase functions new process-whatsapp-queue
```

Isso criará:
```
supabase/
└── functions/
    └── process-whatsapp-queue/
        └── index.ts
```

---

## 4. Implementar Código

### Passo 4.1: Código Completo da Edge Function

Abra o arquivo `supabase/functions/process-whatsapp-queue/index.ts` e cole:

```typescript
// ============================================================================
// EDGE FUNCTION: process-whatsapp-queue
// Descrição: Processa mensagens pendentes da fila WhatsApp
// Execução: Cron Job a cada 5 minutos
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ============================================================================
// CONFIGURAÇÕES DE RATE LIMITING
// ============================================================================

const RATE_LIMITS = {
  // Quantas mensagens processar por execução
  BATCH_SIZE: 5,
  
  // Delay fixo entre mensagens (em milissegundos)
  DELAY_BETWEEN_MESSAGES: 12000, // 12 segundos
  
  // Delay aleatório adicional (para parecer mais humano)
  RANDOM_DELAY_MIN: 3000,  // 3 segundos
  RANDOM_DELAY_MAX: 8000,  // 8 segundos
  
  // Timeout para requisições HTTP
  REQUEST_TIMEOUT: 30000   // 30 segundos
}

// ============================================================================
// INTERFACES TYPESCRIPT
// ============================================================================

interface WhatsAppMessage {
  id: string
  phone_number: string
  message: string
  document_base64?: string
  document_filename?: string
  document_mimetype?: string
  priority: number
  scheduled_for: string
  attempts: number
  max_attempts: number
  metadata?: Record<string, any>
}

interface ProcessResult {
  id: string
  status: 'sent' | 'error'
  error?: string
}

// ============================================================================
// FUNÇÃO PRINCIPAL
// ============================================================================

serve(async (req) => {
  const startTime = Date.now()
  
  console.log('🚀 [Edge Function] Iniciando processamento da fila WhatsApp...')
  console.log(`⏰ [Edge Function] Timestamp: ${new Date().toISOString()}`)

  try {
    // ========================================================================
    // 1. CRIAR CLIENTE SUPABASE (com service_role para bypass RLS)
    // ========================================================================
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variáveis de ambiente SUPABASE não configuradas')
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // ========================================================================
    // 2. BUSCAR MENSAGENS PENDENTES
    // ========================================================================
    
    console.log('📋 [Edge Function] Buscando mensagens pendentes...')
    
    const { data: messages, error: fetchError } = await supabaseAdmin
      .from('tbwhatsapp')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .lt('attempts', supabaseAdmin.rpc('max_attempts'))
      .order('priority', { ascending: false })
      .order('scheduled_for', { ascending: true })
      .limit(RATE_LIMITS.BATCH_SIZE)

    if (fetchError) {
      console.error('❌ [Edge Function] Erro ao buscar mensagens:', fetchError)
      throw fetchError
    }

    const messageCount = messages?.length || 0
    console.log(`📊 [Edge Function] Encontradas ${messageCount} mensagens para processar`)

    // Se não há mensagens, retorna sucesso
    if (!messages || messageCount === 0) {
      console.log('✅ [Edge Function] Nenhuma mensagem pendente. Finalizando.')
      return new Response(
        JSON.stringify({ 
          success: true, 
          processed: 0, 
          message: 'Nenhuma mensagem pendente',
          executionTime: Date.now() - startTime
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' } 
        }
      )
    }

    // ========================================================================
    // 3. PROCESSAR CADA MENSAGEM
    // ========================================================================
    
    const results: ProcessResult[] = []
    
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i]
      const msgNumber = i + 1
      
      console.log(`\n${'='.repeat(60)}`)
      console.log(`📤 [Edge Function] Processando mensagem ${msgNumber}/${messageCount}`)
      console.log(`   ID: ${msg.id}`)
      console.log(`   Telefone: ${msg.phone_number}`)
      console.log(`   Prioridade: ${msg.priority}`)
      console.log(`   Tentativa: ${msg.attempts + 1}/${msg.max_attempts}`)
      
      try {
        // --------------------------------------------------------------------
        // 3.1. MARCAR COMO PROCESSANDO
        // --------------------------------------------------------------------
        
        const { error: updateError } = await supabaseAdmin
          .from('tbwhatsapp')
          .update({ 
            status: 'processing',
            processed_at: new Date().toISOString(),
            attempts: msg.attempts + 1
          })
          .eq('id', msg.id)

        if (updateError) {
          console.error(`❌ [Edge Function] Erro ao atualizar status:`, updateError)
          throw updateError
        }

        console.log(`🔄 [Edge Function] Status atualizado para 'processing'`)

        // --------------------------------------------------------------------
        // 3.2. ENVIAR MENSAGEM VIA EVOLUTION API
        // --------------------------------------------------------------------
        
        const sent = await sendWhatsAppMessage(msg)

        if (sent) {
          // ------------------------------------------------------------------
          // 3.3. SUCESSO - MARCAR COMO ENVIADA
          // ------------------------------------------------------------------
          
          const { error: sentError } = await supabaseAdmin
            .from('tbwhatsapp')
            .update({ 
              status: 'sent',
              sent_at: new Date().toISOString()
            })
            .eq('id', msg.id)

          if (sentError) {
            console.error(`⚠️ [Edge Function] Erro ao marcar como enviada:`, sentError)
          }

          results.push({ id: msg.id, status: 'sent' })
          console.log(`✅ [Edge Function] Mensagem enviada com sucesso!`)
          
        } else {
          throw new Error('Falha no envio via Evolution API')
        }

      } catch (error) {
        // --------------------------------------------------------------------
        // 3.4. ERRO - MARCAR COMO FALHA OU RETENTAR
        // --------------------------------------------------------------------
        
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
        const newAttempts = msg.attempts + 1
        const shouldRetry = newAttempts < msg.max_attempts
        const newStatus = shouldRetry ? 'pending' : 'failed'
        
        console.error(`❌ [Edge Function] Erro ao processar mensagem:`, errorMessage)
        console.log(`🔄 [Edge Function] Tentativa ${newAttempts}/${msg.max_attempts}`)
        console.log(`📌 [Edge Function] Novo status: ${newStatus}`)
        
        const { error: failError } = await supabaseAdmin
          .from('tbwhatsapp')
          .update({ 
            status: newStatus,
            last_error: errorMessage,
            // Se vai retentar, agenda para daqui 5 minutos
            scheduled_for: shouldRetry 
              ? new Date(Date.now() + 5 * 60 * 1000).toISOString()
              : msg.scheduled_for
          })
          .eq('id', msg.id)

        if (failError) {
          console.error(`⚠️ [Edge Function] Erro ao atualizar falha:`, failError)
        }

        results.push({ 
          id: msg.id, 
          status: 'error', 
          error: errorMessage 
        })
      }

      // --------------------------------------------------------------------
      // 3.5. DELAY ENTRE MENSAGENS (exceto na última)
      // --------------------------------------------------------------------
      
      if (i < messages.length - 1) {
        const randomDelay = Math.random() * 
          (RATE_LIMITS.RANDOM_DELAY_MAX - RATE_LIMITS.RANDOM_DELAY_MIN) + 
          RATE_LIMITS.RANDOM_DELAY_MIN
        
        const totalDelay = RATE_LIMITS.DELAY_BETWEEN_MESSAGES + randomDelay
        const delaySeconds = (totalDelay / 1000).toFixed(1)
        
        console.log(`⏳ [Edge Function] Aguardando ${delaySeconds}s antes da próxima mensagem...`)
        await new Promise(resolve => setTimeout(resolve, totalDelay))
      }
    }

    // ========================================================================
    // 4. RETORNAR RESULTADO
    // ========================================================================
    
    const executionTime = Date.now() - startTime
    const successCount = results.filter(r => r.status === 'sent').length
    const errorCount = results.filter(r => r.status === 'error').length
    
    console.log(`\n${'='.repeat(60)}`)
    console.log(`✅ [Edge Function] Processamento concluído!`)
    console.log(`   Total processado: ${results.length}`)
    console.log(`   Enviadas: ${successCount}`)
    console.log(`   Erros: ${errorCount}`)
    console.log(`   Tempo de execução: ${(executionTime / 1000).toFixed(2)}s`)
    console.log(`${'='.repeat(60)}\n`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        sent: successCount,
        errors: errorCount,
        results,
        executionTime
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    const executionTime = Date.now() - startTime
    
    console.error('❌ [Edge Function] Erro fatal:', errorMessage)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        executionTime
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
})

// ============================================================================
// FUNÇÃO: sendWhatsAppMessage
// Envia mensagem via Evolution API
// ============================================================================

async function sendWhatsAppMessage(msg: WhatsAppMessage): Promise<boolean> {
  const evolutionUrl = Deno.env.get('EVOLUTION_API_URL')
  const evolutionToken = Deno.env.get('EVOLUTION_API_TOKEN')
  const instanceName = Deno.env.get('EVOLUTION_INSTANCE_NAME')

  if (!evolutionUrl || !evolutionToken || !instanceName) {
    throw new Error('Variáveis de ambiente EVOLUTION_API não configuradas')
  }

  try {
    // Se tem documento, envia como mídia
    if (msg.document_base64) {
      console.log(`📎 [Evolution API] Enviando documento: ${msg.document_filename}`)
      
      const response = await fetch(
        `${evolutionUrl}/message/sendMedia/${instanceName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': evolutionToken
          },
          body: JSON.stringify({
            number: msg.phone_number,
            mediatype: 'document',
            mimetype: msg.document_mimetype || 'application/pdf',
            caption: msg.message,
            fileName: msg.document_filename,
            media: msg.document_base64
          })
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ [Evolution API] Erro ${response.status}:`, errorText)
        throw new Error(`Evolution API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log(`✅ [Evolution API] Documento enviado:`, data)
      return true
      
    } else {
      // Envia apenas texto
      console.log(`💬 [Evolution API] Enviando mensagem de texto`)
      
      const response = await fetch(
        `${evolutionUrl}/message/sendText/${instanceName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': evolutionToken
          },
          body: JSON.stringify({
            number: msg.phone_number,
            text: msg.message
          })
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ [Evolution API] Erro ${response.status}:`, errorText)
        throw new Error(`Evolution API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log(`✅ [Evolution API] Mensagem enviada:`, data)
      return true
    }
    
  } catch (error) {
    console.error(`❌ [Evolution API] Erro ao enviar:`, error)
    throw error
  }
}
```

---

## 5. Configurar Variáveis de Ambiente

### Passo 5.1: Criar arquivo `.env` local (para testes)

Crie o arquivo `supabase/.env`:

```bash
# Supabase (preenchido automaticamente pelo CLI)
SUPABASE_URL=https://gonbyhpqnqnddqozqvhk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=seu-service-role-key-aqui

# Evolution API
EVOLUTION_API_URL=https://evolution-evolution-api.r9ho4z.easypanel.host
EVOLUTION_API_TOKEN=C13A27923481-43C6-9309-D04172018948
EVOLUTION_INSTANCE_NAME=FARMACE
```

### Passo 5.2: Configurar Secrets no Supabase (Produção)

**Via Dashboard:**

1. Acesse: https://supabase.com/dashboard/project/dojavjvqvobnumebaouc/settings/functions
2. Vá em **Edge Functions** → **Secrets**
3. Adicione os seguintes secrets:

```
EVOLUTION_API_URL = https://evolution-evolution-api.r9ho4z.easypanel.host
EVOLUTION_API_TOKEN = C13A27923481-43C6-9309-D04172018948
EVOLUTION_INSTANCE_NAME = FARMACE
```

**Via CLI:**

```bash
# Configurar secrets via CLI
supabase secrets set EVOLUTION_API_URL=https://evolution-evolution-api.r9ho4z.easypanel.host
supabase secrets set EVOLUTION_API_TOKEN=C13A27923481-43C6-9309-D04172018948
supabase secrets set EVOLUTION_INSTANCE_NAME=FARMACE
```

### Passo 5.3: Verificar Secrets

```bash
supabase secrets list
```

---

## 6. Deploy da Function

### Passo 6.1: Testar Localmente (Opcional)

```bash
# Iniciar Supabase local
supabase start

# Servir a function localmente
supabase functions serve process-whatsapp-queue --env-file supabase/.env

# Em outro terminal, testar
curl -i --location --request POST 'http://localhost:54321/functions/v1/process-whatsapp-queue' \
  --header 'Authorization: Bearer YOUR_ANON_KEY'
```

### Passo 6.2: Deploy para Produção

```bash
# Deploy da Edge Function
supabase functions deploy process-whatsapp-queue

# Verificar deploy
supabase functions list
```

### Passo 6.3: Verificar Logs

```bash
# Ver logs em tempo real
supabase functions logs process-whatsapp-queue --follow

# Ver logs das últimas execuções
supabase functions logs process-whatsapp-queue --limit 50
```

---

## 7. Configurar Cron Job

### Passo 7.1: Via Dashboard do Supabase

1. Acesse: https://supabase.com/dashboard/project/dojavjvqvobnumebaouc/database/cron-jobs
2. Clique em **Create a new cron job**
3. Preencha:

```
Name: process-whatsapp-queue
Schedule: */5 * * * *  (a cada 5 minutos)
Command: SELECT net.http_post(
  url := 'https://gonbyhpqnqnddqozqvhk.supabase.co/functions/v1/process-whatsapp-queue',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb
) as request_id;
```

### Passo 7.2: Via SQL

Execute no SQL Editor:

```sql
-- Habilitar extensão pg_cron (se ainda não estiver)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Criar Cron Job
SELECT cron.schedule(
  'process-whatsapp-queue',  -- Nome do job
  '*/5 * * * *',             -- A cada 5 minutos
  $$
  SELECT net.http_post(
    url := 'https://gonbyhpqnqnqnddqozqvhk.supabase.co/functions/v1/process-whatsapp-queue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    )
  ) as request_id;
  $$
);
```

### Passo 7.3: Verificar Cron Jobs

```sql
-- Listar todos os cron jobs
SELECT * FROM cron.job;

-- Ver histórico de execuções
SELECT * FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'process-whatsapp-queue')
ORDER BY start_time DESC
LIMIT 10;
```

### Passo 7.4: Opções de Agendamento

```bash
# A cada 2 minutos (mais agressivo)
*/2 * * * *

# A cada 5 minutos (recomendado)
*/5 * * * *

# A cada 10 minutos (mais conservador)
*/10 * * * *

# A cada hora
0 * * * *

# Apenas em horário comercial (8h-18h, seg-sex)
*/5 8-18 * * 1-5
```

---

## 8. Testar a Function

### Passo 8.1: Adicionar Mensagem de Teste à Fila

```sql
-- Inserir mensagem de teste
INSERT INTO tbwhatsapp (
  phone_number,
  message,
  priority,
  metadata
) VALUES (
  '5588996420521',  -- Seu número de teste
  '🧪 Teste da Edge Function - Sistema de Fila WhatsApp',
  1,
  '{"tipo": "teste_edge_function", "timestamp": "' || NOW() || '"}'::jsonb
);
```

### Passo 8.2: Executar Manualmente

**Via Dashboard:**
1. Acesse: https://supabase.com/dashboard/project/dojavjvqvobnumebaouc/functions
2. Clique em `process-whatsapp-queue`
3. Clique em **Invoke Function**

**Via CLI:**
```bash
supabase functions invoke process-whatsapp-queue
```

**Via cURL:**
```bash
curl -i --location --request POST \
  'https://gonbyhpqnqnddqozqvhk.supabase.co/functions/v1/process-whatsapp-queue' \
  --header 'Authorization: Bearer SEU_ANON_KEY' \
  --header 'Content-Type: application/json'
```

### Passo 8.3: Verificar Resultado

```sql
-- Ver status da mensagem de teste
SELECT
  id,
  phone_number,
  status,
  attempts,
  created_at,
  processed_at,
  sent_at,
  last_error
FROM tbwhatsapp
WHERE phone_number = '5588996420521'
ORDER BY created_at DESC
LIMIT 5;
```

### Passo 8.4: Verificar Logs

```bash
# Ver logs da última execução
supabase functions logs process-whatsapp-queue --limit 100
```

---

## ✅ Checklist de Implementação

- [ ] Supabase CLI instalado
- [ ] Edge Function criada (`supabase/functions/process-whatsapp-queue/index.ts`)
- [ ] Código implementado
- [ ] Variáveis de ambiente configuradas (secrets)
- [ ] Function deployada
- [ ] Cron Job configurado
- [ ] Teste manual realizado
- [ ] Mensagem de teste recebida no WhatsApp
- [ ] Logs verificados

---

## 🔧 Troubleshooting

### Erro: "SUPABASE_URL not found"

**Solução:** Configure os secrets:
```bash
supabase secrets set EVOLUTION_API_URL=...
supabase secrets set EVOLUTION_API_TOKEN=...
supabase secrets set EVOLUTION_INSTANCE_NAME=...
```

### Erro: "Permission denied"

**Solução:** Verifique as políticas RLS da tabela `tbwhatsapp`. A Edge Function usa `service_role` que deve ter acesso total.

### Mensagens não estão sendo processadas

**Verificar:**
1. Cron Job está ativo? `SELECT * FROM cron.job;`
2. Instância WhatsApp está conectada? `node scripts/test-connection.js`
3. Há mensagens pendentes? `SELECT * FROM tbwhatsapp_pending;`
4. Logs da function mostram erros? `supabase functions logs process-whatsapp-queue`

### Delay muito longo entre mensagens

**Ajustar:** Modifique as constantes no código:
```typescript
const RATE_LIMITS = {
  BATCH_SIZE: 10,  // Aumentar para processar mais por vez
  DELAY_BETWEEN_MESSAGES: 8000,  // Reduzir delay
  // ...
}
```

---

**Próximo arquivo:** [04_INTEGRACAO_REACT.md](./04_INTEGRACAO_REACT.md)

