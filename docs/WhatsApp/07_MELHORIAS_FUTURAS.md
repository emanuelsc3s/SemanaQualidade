# 🚀 Melhorias Futuras - Roadmap

## 📋 Índice

1. [Melhorias de Curto Prazo](#1-melhorias-de-curto-prazo)
2. [Melhorias de Médio Prazo](#2-melhorias-de-médio-prazo)
3. [Melhorias de Longo Prazo](#3-melhorias-de-longo-prazo)
4. [Recursos Avançados](#4-recursos-avançados)
5. [Otimizações de Performance](#5-otimizações-de-performance)

---

## 1. Melhorias de Curto Prazo

### 1.1. Webhook de Confirmação de Entrega

**Objetivo:** Receber confirmação da Evolution API quando mensagem for entregue/lida

**Benefícios:**
- Saber exatamente quando mensagem foi entregue
- Detectar números inválidos automaticamente
- Melhorar precisão das estatísticas

**Implementação:**

```typescript
// 1. Criar endpoint para receber webhook
// supabase/functions/whatsapp-webhook/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const webhook = await req.json()
  
  console.log('📥 Webhook recebido:', webhook)

  // Atualizar status baseado no webhook
  if (webhook.event === 'messages.upsert') {
    const messageId = webhook.data.key.id
    const status = webhook.data.status // 'delivered', 'read', 'failed'
    
    // Atualizar na fila (precisa armazenar messageId ao enviar)
    await supabase
      .from('tbwhatsapp')
      .update({ 
        delivery_status: status,
        delivered_at: status === 'delivered' ? new Date().toISOString() : null,
        read_at: status === 'read' ? new Date().toISOString() : null
      })
      .eq('evolution_message_id', messageId)
  }

  return new Response('OK', { status: 200 })
})
```

```sql
-- Adicionar colunas na tabela
ALTER TABLE tbwhatsapp
ADD COLUMN evolution_message_id VARCHAR(255),
ADD COLUMN delivery_status VARCHAR(20),
ADD COLUMN delivered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX idx_tbwhatsapp_evolution_message_id 
  ON tbwhatsapp(evolution_message_id);
```

**Configurar webhook na Evolution API:**
```bash
curl -X POST https://evolution-evolution-api.r9ho4z.easypanel.host/webhook/set/FARMACE \
  -H "apikey: C13A27923481-43C6-9309-D04172018948" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://gonbyhpqnqnddqozqvhk.supabase.co/functions/v1/whatsapp-webhook",
    "webhook_by_events": true,
    "events": ["messages.upsert", "messages.update"]
  }'
```

---

### 1.2. Notificações em Tempo Real (Supabase Realtime)

**Objetivo:** Notificar usuário quando mensagem for enviada

**Benefícios:**
- Feedback instantâneo ao usuário
- Melhor experiência do usuário
- Reduz ansiedade de espera

**Implementação:**

```typescript
// No componente React (InscricaoWizard.tsx)
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

function InscricaoWizard() {
  const [queueId, setQueueId] = useState<string | null>(null)
  const [messageStatus, setMessageStatus] = useState<string>('pending')

  useEffect(() => {
    if (!queueId) return

    // Inscrever-se em mudanças na fila
    const channel = supabase
      .channel('whatsapp-queue-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tbwhatsapp',
          filter: `id=eq.${queueId}`
        },
        (payload) => {
          console.log('📡 Status atualizado:', payload.new.status)
          setMessageStatus(payload.new.status)
          
          if (payload.new.status === 'sent') {
            // Mostrar notificação de sucesso
            toast.success('✅ Mensagem enviada com sucesso!')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queueId])

  // ... resto do código
}
```

---

### 1.3. Dashboard de Monitoramento React

**Objetivo:** Criar página de admin para monitorar fila em tempo real

**Implementação:**

```typescript
// src/pages/AdminWhatsAppQueue.tsx

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface QueueStats {
  pending_count: number
  processing_count: number
  sent_today: number
  failed_count: number
  success_rate_24h: number
}

export function AdminWhatsAppQueue() {
  const [stats, setStats] = useState<QueueStats | null>(null)
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    loadStats()
    loadMessages()

    // Atualizar a cada 30 segundos
    const interval = setInterval(() => {
      loadStats()
      loadMessages()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  async function loadStats() {
    const { data } = await supabase
      .from('tbwhatsapp_dashboard')
      .select('*')
      .single()
    
    setStats(data)
  }

  async function loadMessages() {
    const { data } = await supabase
      .from('tbwhatsapp')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    setMessages(data || [])
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Fila WhatsApp - Dashboard</h1>
      
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Pendentes" 
          value={stats?.pending_count || 0} 
          color="yellow" 
        />
        <StatCard 
          title="Processando" 
          value={stats?.processing_count || 0} 
          color="blue" 
        />
        <StatCard 
          title="Enviadas Hoje" 
          value={stats?.sent_today || 0} 
          color="green" 
        />
        <StatCard 
          title="Falhadas" 
          value={stats?.failed_count || 0} 
          color="red" 
        />
      </div>

      {/* Taxa de Sucesso */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Taxa de Sucesso (24h)</h2>
        <div className="text-4xl font-bold text-green-600">
          {stats?.success_rate_24h?.toFixed(2)}%
        </div>
      </div>

      {/* Tabela de Mensagens */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-6 py-3 text-left">Telefone</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Tipo</th>
              <th className="px-6 py-3 text-left">Criado</th>
              <th className="px-6 py-3 text-left">Tentativas</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg) => (
              <tr key={msg.id} className="border-t">
                <td className="px-6 py-4">{msg.phone_number}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={msg.status} />
                </td>
                <td className="px-6 py-4">{msg.metadata?.tipo}</td>
                <td className="px-6 py-4">
                  {new Date(msg.created_at).toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4">{msg.attempts}/{msg.max_attempts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

---

## 2. Melhorias de Médio Prazo

### 2.1. Agendamento Inteligente

**Objetivo:** Enviar mensagens em horários otimizados

**Implementação:**

```typescript
// Função para calcular melhor horário de envio
function calculateOptimalSendTime(currentTime: Date): Date {
  const hour = currentTime.getHours()
  
  // Se for fora do horário comercial, agendar para próximo dia útil às 9h
  if (hour < 8 || hour >= 18) {
    const nextDay = new Date(currentTime)
    nextDay.setDate(nextDay.getDate() + 1)
    nextDay.setHours(9, 0, 0, 0)
    return nextDay
  }
  
  // Se for fim de semana, agendar para segunda-feira
  const dayOfWeek = currentTime.getDay()
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 2
    const monday = new Date(currentTime)
    monday.setDate(monday.getDate() + daysUntilMonday)
    monday.setHours(9, 0, 0, 0)
    return monday
  }
  
  // Horário comercial, enviar imediatamente
  return currentTime
}

// Usar ao adicionar à fila
const optimalTime = calculateOptimalSendTime(new Date())
await addToWhatsAppQueue({
  // ...
  scheduledFor: optimalTime
})
```

---

### 2.2. A/B Testing de Mensagens

**Objetivo:** Testar diferentes versões de mensagens

**Implementação:**

```sql
-- Adicionar coluna de variante
ALTER TABLE tbwhatsapp
ADD COLUMN message_variant VARCHAR(10);

-- Criar tabela de templates
CREATE TABLE whatsapp_message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  variant VARCHAR(10) NOT NULL,
  template TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir templates de teste
INSERT INTO whatsapp_message_templates (name, variant, template) VALUES
('confirmacao_inscricao', 'A', '✅ Olá {nome}! Sua inscrição #{numero} foi confirmada...'),
('confirmacao_inscricao', 'B', '🎉 Parabéns {nome}! Você está inscrito! Número: {numero}...');

-- View de performance por variante
CREATE VIEW whatsapp_ab_test_results AS
SELECT 
  metadata->>'tipo' as tipo,
  message_variant,
  COUNT(*) as total_sent,
  AVG(EXTRACT(EPOCH FROM (delivered_at - sent_at))) as avg_delivery_time,
  COUNT(*) FILTER (WHERE read_at IS NOT NULL) as read_count,
  ROUND(100.0 * COUNT(*) FILTER (WHERE read_at IS NOT NULL) / COUNT(*), 2) as read_rate
FROM tbwhatsapp
WHERE status = 'sent'
  AND message_variant IS NOT NULL
GROUP BY metadata->>'tipo', message_variant;
```

---

### 2.3. Retry Inteligente com Backoff Exponencial

**Objetivo:** Aumentar intervalo entre tentativas progressivamente

**Implementação:**

```typescript
// Na Edge Function
function calculateRetryDelay(attempts: number): number {
  // Backoff exponencial: 5min, 15min, 45min, 2h, 6h
  const delays = [5, 15, 45, 120, 360] // minutos
  const delayMinutes = delays[Math.min(attempts, delays.length - 1)]
  return delayMinutes * 60 * 1000 // converter para ms
}

// Ao falhar, agendar próxima tentativa
const retryDelay = calculateRetryDelay(msg.attempts)
const nextAttempt = new Date(Date.now() + retryDelay)

await supabaseAdmin
  .from('tbwhatsapp')
  .update({ 
    status: 'pending',
    scheduled_for: nextAttempt.toISOString(),
    last_error: errorMessage
  })
  .eq('id', msg.id)
```

---

## 3. Melhorias de Longo Prazo

### 3.1. Machine Learning para Otimização

**Objetivo:** Usar ML para prever melhor horário de envio

**Conceito:**
- Coletar dados de taxa de leitura por horário
- Treinar modelo para prever melhor horário
- Ajustar agendamento automaticamente

---

### 3.2. Multi-Canal (SMS, Email, Push)

**Objetivo:** Suportar múltiplos canais de comunicação

**Implementação:**

```sql
-- Generalizar tabela para multi-canal
CREATE TABLE message_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel VARCHAR(20) NOT NULL, -- 'whatsapp', 'sms', 'email', 'push'
  recipient VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  -- ... resto dos campos
);
```

---

### 3.3. Segmentação Avançada

**Objetivo:** Enviar mensagens personalizadas por segmento

**Implementação:**

```sql
-- Tabela de segmentos
CREATE TABLE user_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  criteria JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exemplo de critério
INSERT INTO user_segments (name, criteria) VALUES
('Corredores 5K', '{"modalidade": "5K"}'::jsonb),
('Primeira Inscrição', '{"primeira_vez": true}'::jsonb);

-- Enviar mensagem para segmento
INSERT INTO tbwhatsapp (phone_number, message, metadata)
SELECT 
  whatsapp,
  'Mensagem personalizada para corredores 5K...',
  jsonb_build_object('segment', 'Corredores 5K')
FROM inscricoes
WHERE modalidade = '5K';
```

---

## 4. Recursos Avançados

### 4.1. Chatbot Interativo

**Objetivo:** Responder perguntas automaticamente

**Implementação:**
- Usar webhook para receber mensagens
- Processar com NLP (OpenAI, Dialogflow)
- Responder automaticamente

---

### 4.2. Campanha de Remarketing

**Objetivo:** Reengajar participantes que não completaram inscrição

**Implementação:**

```sql
-- Identificar inscrições incompletas
CREATE VIEW incomplete_registrations AS
SELECT 
  nome,
  whatsapp,
  created_at,
  NOW() - created_at as time_since_start
FROM inscricoes_temp
WHERE status = 'incomplete'
  AND created_at >= NOW() - INTERVAL '24 hours';

-- Agendar mensagem de remarketing
INSERT INTO tbwhatsapp (phone_number, message, scheduled_for, metadata)
SELECT 
  whatsapp,
  'Olá! Notamos que você começou sua inscrição mas não finalizou. Podemos ajudar?',
  NOW() + INTERVAL '2 hours',
  jsonb_build_object('tipo', 'remarketing', 'nome', nome)
FROM incomplete_registrations;
```

---

### 4.3. Integração com CRM

**Objetivo:** Sincronizar com sistema de CRM

**Implementação:**
- Webhook para enviar dados ao CRM
- Sincronização bidirecional
- Histórico unificado de comunicação

---

## 5. Otimizações de Performance

### 5.1. Particionamento de Tabela

**Objetivo:** Melhorar performance com grande volume de dados

**Implementação:**

```sql
-- Particionar por mês
CREATE TABLE tbwhatsapp_2025_11 PARTITION OF tbwhatsapp
FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

CREATE TABLE tbwhatsapp_2025_12 PARTITION OF tbwhatsapp
FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');
```

---

### 5.2. Cache de Estatísticas

**Objetivo:** Reduzir carga no banco

**Implementação:**

```sql
-- Tabela materializada para estatísticas
CREATE MATERIALIZED VIEW tbwhatsapp_stats_cached AS
SELECT * FROM tbwhatsapp_stats;

-- Atualizar a cada 5 minutos
CREATE OR REPLACE FUNCTION refresh_stats_cache()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW tbwhatsapp_stats_cached;
END;
$$ LANGUAGE plpgsql;

-- Cron para atualizar cache
SELECT cron.schedule(
  'refresh-whatsapp-stats',
  '*/5 * * * *',
  'SELECT refresh_stats_cache()'
);
```

---

### 5.3. Compressão de PDFs

**Objetivo:** Reduzir tamanho de PDFs armazenados

**Implementação:**

```typescript
// Comprimir PDF antes de armazenar
import { compress } from 'compress-pdf'

async function compressPDF(base64: string): Promise<string> {
  const buffer = Buffer.from(base64, 'base64')
  const compressed = await compress(buffer, { quality: 0.7 })
  return compressed.toString('base64')
}
```

---

## ✅ Roadmap Sugerido

### Fase 1 (1-2 semanas)
- [x] Sistema básico de fila ✅
- [ ] Webhook de confirmação
- [ ] Notificações em tempo real
- [ ] Dashboard de monitoramento

### Fase 2 (1 mês)
- [ ] Agendamento inteligente
- [ ] A/B Testing
- [ ] Retry com backoff exponencial

### Fase 3 (3 meses)
- [ ] Multi-canal
- [ ] Segmentação avançada
- [ ] Chatbot básico

### Fase 4 (6 meses)
- [ ] Machine Learning
- [ ] Integração CRM
- [ ] Campanha de remarketing

---

**Fim da Documentação** 🎉

Todos os arquivos de documentação foram criados com sucesso!

