# 📊 Estrutura de Tabelas WhatsApp - Supabase

## 🎯 Visão Geral

O sistema utiliza **duas tabelas separadas** no Supabase para gerenciar mensagens WhatsApp:

| Tabela | Propósito | Direção |
|--------|-----------|---------|
| `tbwhatsapp_send` | Fila de mensagens a serem **ENVIADAS** | Saída (Outbound) |
| `tbwhatsapp_receive` | Histórico de mensagens **RECEBIDAS** | Entrada (Inbound) |

---

## 📤 Tabela: `tbwhatsapp_send` (Mensagens ENVIADAS)

### Propósito

Armazena mensagens que **serão enviadas** via WhatsApp. Funciona como uma **fila de processamento** com controle de status, prioridade e tentativas.

### Estrutura Completa

```sql
CREATE TABLE IF NOT EXISTS tbwhatsapp_send (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados da mensagem
  phone_number VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  
  -- Documento anexo (opcional)
  document_base64 TEXT,
  document_filename VARCHAR(255),
  document_mimetype VARCHAR(100) DEFAULT 'application/pdf',
  
  -- Controle de processamento
  status VARCHAR(20) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  priority INTEGER DEFAULT 0,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Controle de tentativas
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_error TEXT,
  
  -- Metadados adicionais
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE
);
```

### Campos Principais

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único da mensagem |
| `phone_number` | VARCHAR(20) | Número do destinatário (ex: 5588996420521) |
| `message` | TEXT | Conteúdo da mensagem de texto |
| `document_base64` | TEXT | PDF em base64 (opcional) |
| `status` | VARCHAR(20) | Status: pending, processing, sent, failed, cancelled |
| `priority` | INTEGER | Prioridade (maior = mais urgente) |
| `scheduled_for` | TIMESTAMP | Quando a mensagem deve ser enviada |
| `attempts` | INTEGER | Número de tentativas de envio |
| `metadata` | JSONB | Dados adicionais (ex: nome do participante, CPF) |

### Índices

```sql
-- Buscar mensagens por status
CREATE INDEX idx_tbwhatsapp_send_status 
  ON tbwhatsapp_send(status);

-- Buscar mensagens agendadas
CREATE INDEX idx_tbwhatsapp_send_scheduled 
  ON tbwhatsapp_send(scheduled_for);

-- Ordenação por prioridade e data
CREATE INDEX idx_tbwhatsapp_send_priority_scheduled 
  ON tbwhatsapp_send(priority DESC, scheduled_for ASC);

-- Buscar por data de criação
CREATE INDEX idx_tbwhatsapp_send_created 
  ON tbwhatsapp_send(created_at DESC);

-- Buscar por telefone
CREATE INDEX idx_tbwhatsapp_send_phone 
  ON tbwhatsapp_send(phone_number);

-- Mensagens processáveis (otimização)
CREATE INDEX idx_tbwhatsapp_send_processable 
  ON tbwhatsapp_send(status, scheduled_for) 
  WHERE status = 'pending';
```

### Políticas RLS (SEM Autenticação)

```sql
ALTER TABLE tbwhatsapp_send ENABLE ROW LEVEL SECURITY;

-- Aplicação React pode inserir mensagens
CREATE POLICY "Allow public insert" 
  ON tbwhatsapp_send FOR INSERT TO public WITH CHECK (true);

-- Edge Function pode ler, atualizar e deletar
CREATE POLICY "Allow select for service role" 
  ON tbwhatsapp_send FOR SELECT TO service_role USING (true);

CREATE POLICY "Allow update for service role" 
  ON tbwhatsapp_send FOR UPDATE TO service_role USING (true);

CREATE POLICY "Allow delete for service role" 
  ON tbwhatsapp_send FOR DELETE TO service_role USING (true);
```

### Fluxo de Vida de uma Mensagem

```
1. INSERT → status: 'pending'
   ↓
2. Edge Function pega mensagem → status: 'processing'
   ↓
3a. Sucesso → status: 'sent', sent_at: NOW()
   OU
3b. Falha → attempts++, last_error, status: 'pending' (retry)
   OU
3c. Max tentativas → status: 'failed'
```

---

## 📥 Tabela: `tbwhatsapp_receive` (Mensagens RECEBIDAS)

### Propósito

Armazena mensagens **recebidas** via webhook do WhatsApp. Funciona como um **histórico de conversas** e pode ser usado para:
- Chatbot automático
- Respostas automáticas
- Análise de sentimento
- Suporte ao cliente
- Relatórios de engajamento

### Estrutura Completa

```sql
CREATE TABLE IF NOT EXISTS tbwhatsapp_receive (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados da mensagem recebida
  phone_number VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  
  -- Dados do remetente
  sender_name VARCHAR(255),
  sender_profile_pic TEXT,
  
  -- Tipo de mensagem
  message_type VARCHAR(50) DEFAULT 'text'
    CHECK (message_type IN ('text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'sticker')),
  
  -- Mídia (se aplicável)
  media_url TEXT,
  media_mimetype VARCHAR(100),
  media_caption TEXT,
  
  -- Contexto da conversa
  is_reply BOOLEAN DEFAULT false,
  reply_to_message_id UUID,
  
  -- Processamento
  processed BOOLEAN DEFAULT false,
  auto_reply_sent BOOLEAN DEFAULT false,
  
  -- Metadados do webhook
  webhook_data JSONB,
  
  -- Timestamps
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);
```

### Campos Principais

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único da mensagem |
| `phone_number` | VARCHAR(20) | Número do remetente |
| `message` | TEXT | Conteúdo da mensagem |
| `sender_name` | VARCHAR(255) | Nome do contato (se disponível) |
| `message_type` | VARCHAR(50) | Tipo: text, image, video, audio, etc |
| `media_url` | TEXT | URL da mídia (se aplicável) |
| `is_reply` | BOOLEAN | Se é resposta a outra mensagem |
| `processed` | BOOLEAN | Se já foi processada |
| `auto_reply_sent` | BOOLEAN | Se enviou resposta automática |
| `webhook_data` | JSONB | Dados completos do webhook |

### Índices

```sql
-- Buscar mensagens por telefone
CREATE INDEX idx_tbwhatsapp_receive_phone 
  ON tbwhatsapp_receive(phone_number);

-- Buscar mensagens por data
CREATE INDEX idx_tbwhatsapp_receive_date 
  ON tbwhatsapp_receive(received_at DESC);

-- Buscar mensagens não processadas
CREATE INDEX idx_tbwhatsapp_receive_unprocessed 
  ON tbwhatsapp_receive(processed, received_at) 
  WHERE processed = false;

-- Buscar por tipo de mensagem
CREATE INDEX idx_tbwhatsapp_receive_type 
  ON tbwhatsapp_receive(message_type);
```

### Políticas RLS

```sql
ALTER TABLE tbwhatsapp_receive ENABLE ROW LEVEL SECURITY;

-- Webhook pode inserir mensagens recebidas
CREATE POLICY "Allow insert for service role" 
  ON tbwhatsapp_receive FOR INSERT TO service_role WITH CHECK (true);

-- Edge Function pode ler e atualizar
CREATE POLICY "Allow select for service role" 
  ON tbwhatsapp_receive FOR SELECT TO service_role USING (true);

CREATE POLICY "Allow update for service role" 
  ON tbwhatsapp_receive FOR UPDATE TO service_role USING (true);
```

---

## 🔄 Integração entre as Tabelas

### Cenário 1: Resposta Automática

```sql
-- Quando recebe mensagem, pode criar resposta automática
INSERT INTO tbwhatsapp_send (phone_number, message, priority, metadata)
SELECT 
  phone_number,
  'Obrigado pela sua mensagem! Em breve retornaremos.' as message,
  1 as priority,
  jsonb_build_object('reply_to', id) as metadata
FROM tbwhatsapp_receive
WHERE processed = false
  AND auto_reply_sent = false;

-- Marcar como processada
UPDATE tbwhatsapp_receive 
SET processed = true, auto_reply_sent = true, processed_at = NOW()
WHERE processed = false;
```

### Cenário 2: Análise de Conversas

```sql
-- Ver histórico completo de uma conversa
SELECT 
  'sent' as direction,
  phone_number,
  message,
  created_at as timestamp
FROM tbwhatsapp_send
WHERE phone_number = '5588996420521'
  AND status = 'sent'

UNION ALL

SELECT 
  'received' as direction,
  phone_number,
  message,
  received_at as timestamp
FROM tbwhatsapp_receive
WHERE phone_number = '5588996420521'

ORDER BY timestamp DESC;
```

---

## 📊 Views de Monitoramento

### View: Estatísticas de Envio

```sql
CREATE OR REPLACE VIEW vw_whatsapp_send_stats AS
SELECT 
  status,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 hour') as last_hour,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as last_24h,
  AVG(attempts) as avg_attempts
FROM tbwhatsapp_send
GROUP BY status;
```

### View: Estatísticas de Recebimento

```sql
CREATE OR REPLACE VIEW vw_whatsapp_receive_stats AS
SELECT 
  message_type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE received_at >= NOW() - INTERVAL '1 hour') as last_hour,
  COUNT(*) FILTER (WHERE received_at >= NOW() - INTERVAL '24 hours') as last_24h,
  COUNT(*) FILTER (WHERE processed = false) as unprocessed
FROM tbwhatsapp_receive
GROUP BY message_type;
```

### View: Conversas Ativas

```sql
CREATE OR REPLACE VIEW vw_whatsapp_active_conversations AS
SELECT 
  phone_number,
  MAX(last_interaction) as last_message,
  COUNT(*) as message_count,
  SUM(sent_count) as sent_count,
  SUM(received_count) as received_count
FROM (
  SELECT 
    phone_number,
    created_at as last_interaction,
    1 as sent_count,
    0 as received_count
  FROM tbwhatsapp_send
  WHERE created_at >= NOW() - INTERVAL '7 days'
  
  UNION ALL
  
  SELECT 
    phone_number,
    received_at as last_interaction,
    0 as sent_count,
    1 as received_count
  FROM tbwhatsapp_receive
  WHERE received_at >= NOW() - INTERVAL '7 days'
) conversations
GROUP BY phone_number
ORDER BY last_message DESC;
```

---

## 🎯 Casos de Uso

### 1. Sistema de Fila (tbwhatsapp_send)

✅ Enviar confirmação de inscrição  
✅ Enviar recibo em PDF  
✅ Enviar lembretes do evento  
✅ Enviar comunicados em massa (com rate limiting)  

### 2. Sistema de Recebimento (tbwhatsapp_receive)

✅ Receber dúvidas dos participantes  
✅ Responder automaticamente FAQs  
✅ Coletar feedback pós-evento  
✅ Suporte ao cliente  

---

## 🔐 Segurança

### tbwhatsapp_send
- ⚠️ INSERT público (validar no frontend)
- ✅ SELECT/UPDATE/DELETE apenas service_role

### tbwhatsapp_receive
- ✅ INSERT apenas service_role (webhook)
- ✅ SELECT/UPDATE apenas service_role

---

## 📚 Próximos Passos

1. **Implementar tbwhatsapp_send:** Siga `INICIO_RAPIDO.md`
2. **Implementar tbwhatsapp_receive:** Criar webhook para receber mensagens
3. **Integrar as duas:** Criar sistema de resposta automática

---

**Versão:** 2.1.0  
**Última atualização:** 2025-11-02

