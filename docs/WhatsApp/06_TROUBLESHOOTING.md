# 🔧 Troubleshooting - Resolução de Problemas

## 📋 Índice

1. [Problemas Comuns](#1-problemas-comuns)
2. [Mensagens Não Estão Sendo Enviadas](#2-mensagens-não-estão-sendo-enviadas)
3. [Mensagens Falhando](#3-mensagens-falhando)
4. [Edge Function Não Está Executando](#4-edge-function-não-está-executando)
5. [Performance e Lentidão](#5-performance-e-lentidão)
6. [Erros Específicos](#6-erros-específicos)

---

## 1. Problemas Comuns

### Problema 1.1: Mensagens ficam em 'pending' indefinidamente

**Sintomas:**
- Mensagens são adicionadas à fila
- Status permanece 'pending' por muito tempo
- Nenhuma mensagem é enviada

**Diagnóstico:**
```sql
-- Verificar se há mensagens pendentes
SELECT COUNT(*) FROM tbwhatsapp_send WHERE status = 'pending';

-- Verificar última execução da Edge Function
SELECT MAX(processed_at) FROM tbwhatsapp_send;

-- Verificar se Cron Job está ativo
SELECT * FROM cron.job WHERE jobname = 'process-whatsapp-queue';
```

**Soluções:**

1. **Verificar se Cron Job está ativo:**
```sql
-- Recriar Cron Job se necessário
SELECT cron.unschedule('process-whatsapp-queue');

SELECT cron.schedule(
  'process-whatsapp-queue',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://gonbyhpqnqnddqozqvhk.supabase.co/functions/v1/process-whatsapp-queue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    )
  ) as request_id;
  $$
);
```

2. **Executar Edge Function manualmente:**
```bash
supabase functions invoke process-whatsapp-queue
```

3. **Verificar logs da Edge Function:**
```bash
supabase functions logs process-whatsapp-queue --limit 50
```

---

### Problema 1.2: Instância WhatsApp desconectada

**Sintomas:**
- Mensagens mudam para 'processing' mas depois voltam para 'pending' ou 'failed'
- Erro: "Connection Closed"

**Diagnóstico:**
```bash
# Executar script de teste de conexão
node scripts/test-connection.js
```

**Solução:**
1. Acessar painel da Evolution API
2. Reconectar instância "FARMACE"
3. Escanear QR Code
4. Aguardar status "open"
5. Testar novamente

---

### Problema 1.3: Mensagens duplicadas

**Sintomas:**
- Participante recebe a mesma mensagem múltiplas vezes

**Diagnóstico:**
```sql
-- Verificar mensagens duplicadas
SELECT 
  phone_number,
  message,
  COUNT(*) as duplicates
FROM tbwhatsapp_send
WHERE created_at >= NOW() - INTERVAL '1 hour'
GROUP BY phone_number, message
HAVING COUNT(*) > 1;
```

**Solução:**
1. Verificar se há múltiplas chamadas de `addToWhatsAppQueue` no código
2. Adicionar validação para evitar duplicatas:

```typescript
// Antes de adicionar à fila, verificar se já existe
const { data: existing } = await supabase
  .from('tbwhatsapp_send')
  .select('id')
  .eq('phone_number', formattedPhone)
  .eq('metadata->>numeroParticipante', numeroParticipante)
  .eq('metadata->>tipo', 'confirmacao_inscricao')
  .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Últimos 5 min
  .single()

if (existing) {
  console.log('Mensagem já existe na fila, pulando...')
  return { success: true, queueId: existing.id }
}
```

---

## 2. Mensagens Não Estão Sendo Enviadas

### Checklist de Diagnóstico

```sql
-- 1. Há mensagens pendentes?
SELECT COUNT(*) FROM tbwhatsapp_send WHERE status = 'pending';

-- 2. Mensagens estão agendadas para o futuro?
SELECT 
  COUNT(*) as total_pending,
  COUNT(*) FILTER (WHERE scheduled_for <= NOW()) as ready_to_send,
  COUNT(*) FILTER (WHERE scheduled_for > NOW()) as scheduled_future
FROM tbwhatsapp_send
WHERE status = 'pending';

-- 3. Mensagens atingiram max_attempts?
SELECT COUNT(*) 
FROM tbwhatsapp_send 
WHERE status = 'pending' 
  AND attempts >= max_attempts;

-- 4. Edge Function está processando?
SELECT 
  MAX(processed_at) as last_processing,
  NOW() - MAX(processed_at) as time_since_last
FROM tbwhatsapp_send;

-- 5. Há erros recentes?
SELECT 
  last_error,
  COUNT(*) as occurrences
FROM tbwhatsapp_send
WHERE status = 'failed'
  AND created_at >= NOW() - INTERVAL '24 hours'
GROUP BY last_error
ORDER BY occurrences DESC;
```

### Soluções

**Se mensagens estão agendadas para o futuro:**
```sql
-- Reagendar para agora
UPDATE tbwhatsapp_send
SET scheduled_for = NOW()
WHERE status = 'pending'
  AND scheduled_for > NOW();
```

**Se atingiram max_attempts:**
```sql
-- Resetar tentativas
UPDATE tbwhatsapp_send
SET 
  attempts = 0,
  status = 'pending',
  scheduled_for = NOW(),
  last_error = NULL
WHERE status = 'pending'
  AND attempts >= max_attempts;
```

**Se Edge Function não está processando:**
```bash
# Verificar logs
supabase functions logs process-whatsapp-queue --limit 100

# Executar manualmente
supabase functions invoke process-whatsapp-queue
```

---

## 3. Mensagens Falhando

### Diagnóstico de Falhas

```sql
-- Ver mensagens falhadas com detalhes
SELECT 
  id,
  phone_number,
  LEFT(message, 50) || '...' as message_preview,
  attempts,
  last_error,
  created_at,
  metadata
FROM tbwhatsapp_send
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 20;

-- Agrupar por tipo de erro
SELECT 
  last_error,
  COUNT(*) as occurrences,
  MIN(created_at) as first_occurrence,
  MAX(created_at) as last_occurrence
FROM tbwhatsapp_send
WHERE status = 'failed'
GROUP BY last_error
ORDER BY occurrences DESC;
```

### Erros Comuns e Soluções

#### Erro: "Connection Closed"
**Causa:** Instância WhatsApp desconectada  
**Solução:** Reconectar instância (ver Problema 1.2)

#### Erro: "Invalid phone number"
**Causa:** Número de telefone em formato inválido  
**Solução:**
```sql
-- Verificar números inválidos
SELECT DISTINCT phone_number
FROM tbwhatsapp_send
WHERE status = 'failed'
  AND last_error LIKE '%Invalid phone%';

-- Corrigir formato (se possível)
UPDATE tbwhatsapp_send
SET phone_number = '55' || REGEXP_REPLACE(phone_number, '\D', '', 'g')
WHERE status = 'failed'
  AND last_error LIKE '%Invalid phone%'
  AND phone_number NOT LIKE '55%';
```

#### Erro: "Document too large"
**Causa:** PDF muito grande (>16MB)  
**Solução:**
```sql
-- Identificar PDFs grandes
SELECT 
  id,
  phone_number,
  LENGTH(document_base64) / 1024 / 1024 as size_mb,
  document_filename
FROM tbwhatsapp_send
WHERE status = 'failed'
  AND last_error LIKE '%too large%'
ORDER BY size_mb DESC;

-- Marcar como cancelado (não há como reduzir tamanho)
UPDATE tbwhatsapp_send
SET status = 'cancelled'
WHERE status = 'failed'
  AND last_error LIKE '%too large%';
```

---

## 4. Edge Function Não Está Executando

### Diagnóstico

```bash
# 1. Verificar se function existe
supabase functions list

# 2. Ver logs recentes
supabase functions logs process-whatsapp-queue --limit 50

# 3. Verificar secrets
supabase secrets list
```

### Soluções

**Function não aparece na lista:**
```bash
# Fazer deploy novamente
supabase functions deploy process-whatsapp-queue
```

**Secrets não configurados:**
```bash
# Configurar secrets
supabase secrets set EVOLUTION_API_URL=https://evolution-evolution-api.r9ho4z.easypanel.host
supabase secrets set EVOLUTION_API_TOKEN=C13A27923481-43C6-9309-D04172018948
supabase secrets set EVOLUTION_INSTANCE_NAME=FARMACE
```

**Erro de permissão:**
```sql
-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'tbwhatsapp_send';

-- Garantir que service_role tem acesso
ALTER TABLE tbwhatsapp_send ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for service role" 
  ON tbwhatsapp_send
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);
```

---

## 5. Performance e Lentidão

### Diagnóstico

```sql
-- Verificar tamanho da tabela
SELECT 
  pg_size_pretty(pg_total_relation_size('tbwhatsapp_send')) as total_size,
  COUNT(*) as total_rows
FROM tbwhatsapp_send;

-- Verificar índices
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'tbwhatsapp_send';

-- Verificar queries lentas
SELECT 
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
WHERE query LIKE '%tbwhatsapp_send%'
ORDER BY mean_time DESC
LIMIT 10;
```

### Soluções

**Tabela muito grande:**
```sql
-- Limpar mensagens antigas (>30 dias)
SELECT * FROM cleanup_old_messages(30);

-- Ou manualmente:
DELETE FROM tbwhatsapp_send
WHERE status = 'sent'
  AND sent_at < NOW() - INTERVAL '30 days';
```

**Índices faltando:**
```sql
-- Recriar índices (ver arquivo 02_CONFIGURACAO_SUPABASE.md)
CREATE INDEX IF NOT EXISTS idx_tbwhatsapp_status 
  ON tbwhatsapp_send(status);

CREATE INDEX IF NOT EXISTS idx_tbwhatsapp_priority_scheduled 
  ON tbwhatsapp_send(priority DESC, scheduled_for ASC);
```

**Vacuum da tabela:**
```sql
-- Otimizar tabela
VACUUM ANALYZE tbwhatsapp_send;
```

---

## 6. Erros Específicos

### Erro: "RLS policy violation"

**Causa:** Políticas RLS bloqueando acesso  
**Solução:**
```sql
-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'tbwhatsapp_send';

-- Garantir política para service_role
CREATE POLICY "Allow all for service role" 
  ON tbwhatsapp_send
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);
```

### Erro: "Function timeout"

**Causa:** Edge Function excedeu tempo limite (60s)  
**Solução:**
```typescript
// Reduzir BATCH_SIZE no código da Edge Function
const RATE_LIMITS = {
  BATCH_SIZE: 3,  // Reduzir de 5 para 3
  // ...
}
```

### Erro: "Rate limit exceeded"

**Causa:** Muitas requisições para Evolution API  
**Solução:**
```typescript
// Aumentar delays no código da Edge Function
const RATE_LIMITS = {
  DELAY_BETWEEN_MESSAGES: 20000,  // Aumentar de 12s para 20s
  RANDOM_DELAY_MIN: 5000,
  RANDOM_DELAY_MAX: 10000,
  // ...
}
```

---

## 🆘 Comandos de Emergência

### Resetar Tudo

```sql
-- ⚠️ CUIDADO: Isso reseta TODAS as mensagens pendentes/processing

-- Resetar mensagens travadas
UPDATE tbwhatsapp_send
SET 
  status = 'pending',
  attempts = 0,
  scheduled_for = NOW(),
  last_error = NULL
WHERE status IN ('processing', 'failed');

-- Limpar fila completamente (CUIDADO!)
-- DELETE FROM tbwhatsapp_send WHERE status IN ('sent', 'failed', 'cancelled');
```

### Pausar Processamento

```sql
-- Desabilitar Cron Job temporariamente
SELECT cron.unschedule('process-whatsapp-queue');

-- Reabilitar depois
SELECT cron.schedule(
  'process-whatsapp-queue',
  '*/5 * * * *',
  $$ ... $$  -- Ver arquivo 03_EDGE_FUNCTION.md
);
```

### Forçar Reprocessamento

```sql
-- Reprocessar mensagens falhadas
SELECT * FROM retry_failed_messages(24);

-- Ou manualmente:
UPDATE tbwhatsapp_send
SET 
  status = 'pending',
  attempts = 0,
  scheduled_for = NOW(),
  last_error = NULL
WHERE status = 'failed'
  AND created_at >= NOW() - INTERVAL '24 hours';
```

---

## 📞 Suporte

Se nenhuma solução acima resolver o problema:

1. **Coletar informações:**
   - Logs da Edge Function
   - Query de estatísticas
   - Mensagens de erro específicas
   - Screenshots do dashboard

2. **Verificar documentação:**
   - [01_VISAO_GERAL.md](./01_VISAO_GERAL.md)
   - [02_CONFIGURACAO_SUPABASE.md](./02_CONFIGURACAO_SUPABASE.md)
   - [03_EDGE_FUNCTION.md](./03_EDGE_FUNCTION.md)

3. **Consultar comunidade:**
   - Supabase Discord
   - Evolution API GitHub Issues

---

**Próximo arquivo:** [07_MELHORIAS_FUTURAS.md](./07_MELHORIAS_FUTURAS.md)

