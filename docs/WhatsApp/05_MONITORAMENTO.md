# 📊 Monitoramento da Fila WhatsApp

## 📋 Índice

1. [Queries Úteis](#1-queries-úteis)
2. [Dashboard no Supabase](#2-dashboard-no-supabase)
3. [Alertas e Notificações](#3-alertas-e-notificações)
4. [Métricas Importantes](#4-métricas-importantes)
5. [Logs e Debugging](#5-logs-e-debugging)

---

## 1. Queries Úteis

### 1.1. Visão Geral da Fila

```sql
-- Estatísticas gerais
SELECT * FROM tbwhatsapp_stats;

-- Resultado esperado:
-- status     | total | oldest_message       | newest_message       | avg_attempts
-- -----------|-------|----------------------|----------------------|-------------
-- pending    | 45    | 2025-11-02 10:00:00  | 2025-11-02 10:30:00  | 0.0
-- processing | 2     | 2025-11-02 10:25:00  | 2025-11-02 10:26:00  | 1.0
-- sent       | 638   | 2025-11-01 08:00:00  | 2025-11-02 10:20:00  | 1.2
-- failed     | 4     | 2025-11-02 09:00:00  | 2025-11-02 09:30:00  | 3.0
```

### 1.2. Mensagens Pendentes

```sql
-- Ver mensagens aguardando envio
SELECT 
  id,
  phone_number,
  LEFT(message, 50) || '...' as message_preview,
  priority,
  scheduled_for,
  attempts,
  created_at,
  metadata->>'tipo' as tipo,
  metadata->>'numeroParticipante' as numero_participante
FROM tbwhatsapp
WHERE status = 'pending'
  AND scheduled_for <= NOW()
ORDER BY priority DESC, scheduled_for ASC
LIMIT 20;
```

### 1.3. Mensagens Falhadas

```sql
-- Ver mensagens que falharam
SELECT 
  id,
  phone_number,
  LEFT(message, 50) || '...' as message_preview,
  attempts,
  max_attempts,
  last_error,
  created_at,
  metadata->>'tipo' as tipo
FROM tbwhatsapp
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 20;
```

### 1.4. Taxa de Sucesso por Dia

```sql
-- Estatísticas diárias
SELECT * FROM tbwhatsapp_daily_stats
ORDER BY date DESC
LIMIT 7;

-- Resultado esperado:
-- date       | total_messages | sent | failed | pending | success_rate_percent
-- -----------|----------------|------|--------|---------|---------------------
-- 2025-11-02 | 150            | 145  | 3      | 2       | 96.67
-- 2025-11-01 | 684            | 680  | 4      | 0       | 99.42
```

### 1.5. Mensagens por Tipo

```sql
-- Agrupar por tipo de mensagem
SELECT 
  metadata->>'tipo' as tipo,
  status,
  COUNT(*) as total
FROM tbwhatsapp
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY metadata->>'tipo', status
ORDER BY tipo, status;

-- Resultado esperado:
-- tipo                      | status     | total
-- --------------------------|------------|------
-- confirmacao_inscricao     | sent       | 340
-- confirmacao_inscricao     | failed     | 2
-- comprovante_pdf           | sent       | 338
-- comprovante_pdf           | pending    | 4
-- confirmacao_apenas_natal  | sent       | 150
```

### 1.6. Tempo Médio de Processamento

```sql
-- Calcular tempo médio entre criação e envio
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_sent,
  AVG(EXTRACT(EPOCH FROM (sent_at - created_at))) / 60 as avg_minutes,
  MIN(EXTRACT(EPOCH FROM (sent_at - created_at))) / 60 as min_minutes,
  MAX(EXTRACT(EPOCH FROM (sent_at - created_at))) / 60 as max_minutes
FROM tbwhatsapp
WHERE status = 'sent'
  AND sent_at IS NOT NULL
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Resultado esperado:
-- date       | total_sent | avg_minutes | min_minutes | max_minutes
-- -----------|------------|-------------|-------------|------------
-- 2025-11-02 | 145        | 8.5         | 2.3         | 15.7
-- 2025-11-01 | 680        | 12.3        | 1.8         | 45.2
```

### 1.7. Mensagens de um Participante Específico

```sql
-- Ver histórico de mensagens de um participante
SELECT 
  id,
  status,
  LEFT(message, 50) || '...' as message_preview,
  document_filename,
  created_at,
  sent_at,
  attempts,
  last_error,
  metadata
FROM tbwhatsapp
WHERE metadata->>'numeroParticipante' = '0123'
ORDER BY created_at DESC;
```

### 1.8. Mensagens Atrasadas

```sql
-- Mensagens que deveriam ter sido enviadas mas ainda estão pendentes
SELECT 
  id,
  phone_number,
  LEFT(message, 50) || '...' as message_preview,
  scheduled_for,
  created_at,
  NOW() - scheduled_for as atraso,
  attempts,
  metadata->>'tipo' as tipo
FROM tbwhatsapp
WHERE status = 'pending'
  AND scheduled_for < NOW() - INTERVAL '30 minutes'
ORDER BY scheduled_for ASC;
```

---

## 2. Dashboard no Supabase

### 2.1. Criar View de Dashboard

```sql
-- View consolidada para dashboard
CREATE OR REPLACE VIEW tbwhatsapp_dashboard AS
SELECT 
  -- Estatísticas gerais
  (SELECT COUNT(*) FROM tbwhatsapp WHERE status = 'pending') as pending_count,
  (SELECT COUNT(*) FROM tbwhatsapp WHERE status = 'processing') as processing_count,
  (SELECT COUNT(*) FROM tbwhatsapp WHERE status = 'sent' AND sent_at >= NOW() - INTERVAL '24 hours') as sent_today,
  (SELECT COUNT(*) FROM tbwhatsapp WHERE status = 'failed') as failed_count,
  
  -- Tempo médio de processamento (últimas 24h)
  (SELECT AVG(EXTRACT(EPOCH FROM (sent_at - created_at))) / 60 
   FROM tbwhatsapp 
   WHERE status = 'sent' 
     AND sent_at >= NOW() - INTERVAL '24 hours') as avg_processing_minutes,
  
  -- Taxa de sucesso (últimas 24h)
  (SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'sent') / NULLIF(COUNT(*), 0), 2)
   FROM tbwhatsapp 
   WHERE created_at >= NOW() - INTERVAL '24 hours') as success_rate_24h,
  
  -- Mensagens atrasadas
  (SELECT COUNT(*) 
   FROM tbwhatsapp 
   WHERE status = 'pending' 
     AND scheduled_for < NOW() - INTERVAL '30 minutes') as delayed_count,
  
  -- Última execução da Edge Function (aproximado)
  (SELECT MAX(processed_at) FROM tbwhatsapp) as last_processing;

-- Usar:
SELECT * FROM tbwhatsapp_dashboard;
```

### 2.2. Criar Gráfico de Envios por Hora

```sql
-- Mensagens enviadas por hora (últimas 24h)
SELECT 
  DATE_TRUNC('hour', sent_at) as hour,
  COUNT(*) as messages_sent
FROM tbwhatsapp
WHERE status = 'sent'
  AND sent_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', sent_at)
ORDER BY hour DESC;
```

---

## 3. Alertas e Notificações

### 3.1. Função para Detectar Problemas

```sql
-- Função que retorna alertas se houver problemas
CREATE OR REPLACE FUNCTION check_tbwhatsapp_health()
RETURNS TABLE(
  alert_type TEXT,
  severity TEXT,
  message TEXT,
  count BIGINT
) AS $$
BEGIN
  -- Alerta 1: Muitas mensagens falhadas
  RETURN QUERY
  SELECT 
    'failed_messages'::TEXT,
    'high'::TEXT,
    'Há muitas mensagens falhadas'::TEXT,
    COUNT(*)
  FROM tbwhatsapp
  WHERE status = 'failed'
  HAVING COUNT(*) > 10;
  
  -- Alerta 2: Mensagens atrasadas
  RETURN QUERY
  SELECT 
    'delayed_messages'::TEXT,
    'medium'::TEXT,
    'Há mensagens atrasadas há mais de 1 hora'::TEXT,
    COUNT(*)
  FROM tbwhatsapp
  WHERE status = 'pending'
    AND scheduled_for < NOW() - INTERVAL '1 hour'
  HAVING COUNT(*) > 0;
  
  -- Alerta 3: Fila muito grande
  RETURN QUERY
  SELECT 
    'large_queue'::TEXT,
    'low'::TEXT,
    'Fila de mensagens pendentes está grande'::TEXT,
    COUNT(*)
  FROM tbwhatsapp
  WHERE status = 'pending'
  HAVING COUNT(*) > 100;
  
  -- Alerta 4: Edge Function não está processando
  RETURN QUERY
  SELECT 
    'stalled_processing'::TEXT,
    'high'::TEXT,
    'Edge Function pode estar parada (sem processamento há mais de 15 min)'::TEXT,
    1::BIGINT
  WHERE (SELECT MAX(processed_at) FROM tbwhatsapp) < NOW() - INTERVAL '15 minutes'
    AND (SELECT COUNT(*) FROM tbwhatsapp WHERE status = 'pending') > 0;
END;
$$ LANGUAGE plpgsql;

-- Usar:
SELECT * FROM check_tbwhatsapp_health();
```

### 3.2. Criar Trigger para Alertas (Opcional)

```sql
-- Função que envia notificação quando há muitas falhas
CREATE OR REPLACE FUNCTION notify_on_failures()
RETURNS TRIGGER AS $$
DECLARE
  failed_count INTEGER;
BEGIN
  -- Conta mensagens falhadas nas últimas 24h
  SELECT COUNT(*) INTO failed_count
  FROM tbwhatsapp
  WHERE status = 'failed'
    AND created_at >= NOW() - INTERVAL '24 hours';
  
  -- Se houver mais de 10 falhas, notifica
  IF failed_count > 10 THEN
    PERFORM pg_notify(
      'tbwhatsapp_alert',
      json_build_object(
        'type', 'high_failure_rate',
        'count', failed_count,
        'timestamp', NOW()
      )::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
CREATE TRIGGER trigger_notify_failures
AFTER UPDATE ON tbwhatsapp
FOR EACH ROW
WHEN (NEW.status = 'failed')
EXECUTE FUNCTION notify_on_failures();
```

---

## 4. Métricas Importantes

### 4.1. KPIs Principais

```sql
-- KPIs consolidados
SELECT 
  -- Total de mensagens
  COUNT(*) as total_messages,
  
  -- Taxa de sucesso geral
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'sent') / NULLIF(COUNT(*), 0), 2) as success_rate,
  
  -- Tempo médio de processamento
  ROUND(AVG(EXTRACT(EPOCH FROM (sent_at - created_at))) / 60, 2) as avg_processing_minutes,
  
  -- Mensagens por dia (média)
  ROUND(COUNT(*) / NULLIF(DATE_PART('day', MAX(created_at) - MIN(created_at)), 0), 0) as avg_messages_per_day,
  
  -- Taxa de retry (mensagens que precisaram de mais de 1 tentativa)
  ROUND(100.0 * COUNT(*) FILTER (WHERE attempts > 1) / NULLIF(COUNT(*), 0), 2) as retry_rate
FROM tbwhatsapp
WHERE created_at >= NOW() - INTERVAL '30 days';
```

### 4.2. Métricas por Período

```sql
-- Comparação semanal
SELECT 
  DATE_TRUNC('week', created_at) as week,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'sent') as sent,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'sent') / NULLIF(COUNT(*), 0), 2) as success_rate
FROM tbwhatsapp
WHERE created_at >= NOW() - INTERVAL '8 weeks'
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week DESC;
```

---

## 5. Logs e Debugging

### 5.1. Ver Logs da Edge Function

```bash
# Logs em tempo real
supabase functions logs process-whatsapp-queue --follow

# Últimos 100 logs
supabase functions logs process-whatsapp-queue --limit 100

# Filtrar por erro
supabase functions logs process-whatsapp-queue | grep "ERROR"
```

### 5.2. Queries de Debug

```sql
-- Ver última execução da Edge Function
SELECT 
  MAX(processed_at) as last_execution,
  NOW() - MAX(processed_at) as time_since_last_execution,
  COUNT(*) FILTER (WHERE processed_at >= NOW() - INTERVAL '5 minutes') as processed_last_5min
FROM tbwhatsapp;

-- Ver mensagens que estão travadas em 'processing'
SELECT 
  id,
  phone_number,
  processed_at,
  NOW() - processed_at as stuck_for,
  attempts,
  metadata
FROM tbwhatsapp
WHERE status = 'processing'
  AND processed_at < NOW() - INTERVAL '10 minutes';

-- Resetar mensagens travadas (se necessário)
UPDATE tbwhatsapp
SET 
  status = 'pending',
  scheduled_for = NOW()
WHERE status = 'processing'
  AND processed_at < NOW() - INTERVAL '10 minutes';
```

### 5.3. Exportar Relatório

```sql
-- Relatório completo para análise
COPY (
  SELECT 
    id,
    phone_number,
    status,
    priority,
    attempts,
    created_at,
    processed_at,
    sent_at,
    EXTRACT(EPOCH FROM (sent_at - created_at)) / 60 as processing_minutes,
    metadata->>'tipo' as tipo,
    metadata->>'numeroParticipante' as numero_participante,
    last_error
  FROM tbwhatsapp
  WHERE created_at >= NOW() - INTERVAL '7 days'
  ORDER BY created_at DESC
) TO '/tmp/tbwhatsapp_report.csv' WITH CSV HEADER;
```

---

## ✅ Checklist de Monitoramento

### Diário
- [ ] Verificar estatísticas gerais (`tbwhatsapp_stats`)
- [ ] Verificar mensagens falhadas
- [ ] Verificar mensagens atrasadas
- [ ] Verificar logs da Edge Function

### Semanal
- [ ] Analisar taxa de sucesso semanal
- [ ] Revisar tempo médio de processamento
- [ ] Limpar mensagens antigas (>30 dias)
- [ ] Verificar alertas de saúde do sistema

### Mensal
- [ ] Gerar relatório completo
- [ ] Analisar tendências
- [ ] Ajustar rate limits se necessário
- [ ] Revisar e otimizar queries

---

**Próximo arquivo:** [06_TROUBLESHOOTING.md](./06_TROUBLESHOOTING.md)

