# 🗄️ Configuração do Supabase - Tabela de Fila WhatsApp

## 📋 Índice

1. [Criar Tabela tbwhatsapp](#1-criar-tabela-tbwhatsapp)
2. [Configurar Índices](#2-configurar-índices)
3. [Configurar Row Level Security (RLS)](#3-configurar-row-level-security-rls)
4. [Criar Views de Monitoramento](#4-criar-views-de-monitoramento)
5. [Criar Funções Auxiliares](#5-criar-funções-auxiliares)
6. [Testar a Configuração](#6-testar-a-configuração)

---

## 1. Criar Tabela `tbwhatsapp`

### Passo 1.1: Acessar o SQL Editor do Supabase

1. Acesse o dashboard do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto: **APFAR**
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**

### Passo 1.2: Executar Script de Criação da Tabela

Cole e execute o seguinte SQL:

```sql
-- ============================================================================
-- TABELA: tbwhatsapp
-- Descrição: Fila de mensagens WhatsApp para envio controlado
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbwhatsapp (
  -- Identificador único
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- ========================================================================
  -- DADOS DA MENSAGEM
  -- ========================================================================
  
  -- Número de telefone no formato internacional (ex: 5588996420521)
  phone_number VARCHAR(20) NOT NULL,
  
  -- Texto da mensagem a ser enviada
  message TEXT NOT NULL,
  
  -- ========================================================================
  -- DADOS DO DOCUMENTO (OPCIONAL - para PDFs, imagens, etc)
  -- ========================================================================
  
  -- PDF/Imagem em Base64 (sem prefixo data:)
  document_base64 TEXT,
  
  -- Nome do arquivo (ex: Comprovante_0123.pdf)
  document_filename VARCHAR(255),
  
  -- Tipo MIME (ex: application/pdf, image/jpeg)
  document_mimetype VARCHAR(100) DEFAULT 'application/pdf',
  
  -- ========================================================================
  -- CONTROLE DE ENVIO
  -- ========================================================================
  
  -- Status da mensagem
  status VARCHAR(20) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  
  -- Prioridade (maior número = maior prioridade)
  -- 0 = normal, 1 = alta, 2 = urgente
  priority INTEGER DEFAULT 0,
  
  -- ========================================================================
  -- AGENDAMENTO
  -- ========================================================================
  
  -- Data/hora para enviar a mensagem
  -- Por padrão, envia imediatamente (NOW())
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- ========================================================================
  -- TENTATIVAS E ERROS
  -- ========================================================================
  
  -- Número de tentativas de envio realizadas
  attempts INTEGER DEFAULT 0,
  
  -- Número máximo de tentativas permitidas
  max_attempts INTEGER DEFAULT 3,
  
  -- Última mensagem de erro (se houver)
  last_error TEXT,
  
  -- ========================================================================
  -- METADADOS (JSON flexível para dados extras)
  -- ========================================================================
  
  -- Dados adicionais em formato JSON
  -- Exemplos:
  -- { "tipo": "confirmacao_inscricao", "numeroParticipante": "0123" }
  -- { "tipo": "comprovante_pdf", "nome": "João Silva" }
  metadata JSONB,
  
  -- ========================================================================
  -- TIMESTAMPS (Rastreamento de datas)
  -- ========================================================================
  
  -- Data/hora de criação do registro
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Data/hora em que começou a processar
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Data/hora em que foi enviada com sucesso
  sent_at TIMESTAMP WITH TIME ZONE,
  
  -- ========================================================================
  -- CONSTRAINTS (Validações)
  -- ========================================================================
  
  -- Garante que attempts não ultrapasse max_attempts
  CONSTRAINT valid_attempts CHECK (attempts <= max_attempts),
  
  -- Garante que phone_number não seja vazio
  CONSTRAINT valid_phone CHECK (phone_number <> ''),
  
  -- Garante que message não seja vazio
  CONSTRAINT valid_message CHECK (message <> '')
);

-- ============================================================================
-- COMENTÁRIOS NA TABELA (Documentação)
-- ============================================================================

COMMENT ON TABLE tbwhatsapp IS 
  'Fila de mensagens WhatsApp para envio controlado e escalonado';

COMMENT ON COLUMN tbwhatsapp.id IS 
  'Identificador único da mensagem (UUID)';

COMMENT ON COLUMN tbwhatsapp.phone_number IS 
  'Número de telefone no formato internacional (ex: 5588996420521)';

COMMENT ON COLUMN tbwhatsapp.message IS 
  'Texto da mensagem a ser enviada via WhatsApp';

COMMENT ON COLUMN tbwhatsapp.document_base64 IS 
  'Documento em Base64 (PDF, imagem, etc) - opcional';

COMMENT ON COLUMN tbwhatsapp.status IS 
  'Status: pending (aguardando), processing (enviando), sent (enviado), failed (falhou), cancelled (cancelado)';

COMMENT ON COLUMN tbwhatsapp.priority IS 
  'Prioridade de envio: 0=normal, 1=alta, 2=urgente. Maior número = enviado primeiro';

COMMENT ON COLUMN tbwhatsapp.scheduled_for IS 
  'Data/hora agendada para envio. Mensagens só são processadas após este horário';

COMMENT ON COLUMN tbwhatsapp.attempts IS 
  'Número de tentativas de envio já realizadas';

COMMENT ON COLUMN tbwhatsapp.max_attempts IS 
  'Número máximo de tentativas permitidas antes de marcar como failed';

COMMENT ON COLUMN tbwhatsapp.metadata IS 
  'Dados adicionais em JSON (tipo, nome, número participante, etc)';
```

### Passo 1.3: Verificar Criação

Execute para confirmar:

```sql
-- Verificar se a tabela foi criada
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name = 'tbwhatsapp';

-- Ver estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'tbwhatsapp'
ORDER BY ordinal_position;
```

---

## 2. Configurar Índices

### Por que Índices são Importantes?

Índices aceleram as consultas ao banco de dados. Sem índices, o Supabase precisa varrer toda a tabela para encontrar registros.

### Passo 2.1: Criar Índices de Performance

```sql
-- ============================================================================
-- ÍNDICES PARA OTIMIZAÇÃO DE QUERIES
-- ============================================================================

-- Índice para buscar mensagens por status
-- Usado pela Edge Function para pegar mensagens 'pending'
CREATE INDEX IF NOT EXISTS idx_tbwhatsapp_status 
  ON tbwhatsapp(status);

-- Índice para buscar mensagens agendadas
-- Usado para filtrar mensagens que já podem ser enviadas
CREATE INDEX IF NOT EXISTS idx_tbwhatsapp_scheduled 
  ON tbwhatsapp(scheduled_for);

-- Índice composto para ordenação por prioridade e data
-- Usado para pegar mensagens na ordem correta (prioridade DESC, data ASC)
CREATE INDEX IF NOT EXISTS idx_tbwhatsapp_priority_scheduled 
  ON tbwhatsapp(priority DESC, scheduled_for ASC);

-- Índice para buscar por data de criação
-- Útil para relatórios e monitoramento
CREATE INDEX IF NOT EXISTS idx_tbwhatsapp_created 
  ON tbwhatsapp(created_at DESC);

-- Índice para buscar por número de telefone
-- Útil para ver histórico de mensagens de um participante
CREATE INDEX IF NOT EXISTS idx_tbwhatsapp_phone 
  ON tbwhatsapp(phone_number);

-- Índice para buscar mensagens pendentes que podem ser processadas
-- Combina status='pending' + scheduled_for <= NOW()
CREATE INDEX IF NOT EXISTS idx_tbwhatsapp_processable 
  ON tbwhatsapp(status, scheduled_for) 
  WHERE status = 'pending';
```

### Passo 2.2: Verificar Índices Criados

```sql
-- Listar todos os índices da tabela tbwhatsapp
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'tbwhatsapp'
ORDER BY indexname;
```

---

## 3. Configurar Row Level Security (RLS)

### O que é RLS?

Row Level Security (RLS) controla quem pode acessar quais linhas da tabela. É essencial para segurança.

**⚠️ IMPORTANTE:** Como você **não usa autenticação do Supabase** (sem `auth.users`), vamos configurar RLS de forma simplificada, permitindo acesso público controlado apenas pela `service_role` da Edge Function.

### Passo 3.1: Habilitar RLS

```sql
-- ============================================================================
-- HABILITAR ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE tbwhatsapp ENABLE ROW LEVEL SECURITY;
```

### Passo 3.2: Criar Políticas de Acesso (SEM Autenticação)

Como você **não usa autenticação do Supabase**, vamos criar políticas que permitem:
- ✅ **Aplicação React** pode inserir mensagens (acesso público controlado)
- ✅ **Edge Function** pode ler, atualizar e deletar (via service_role)

```sql
-- ============================================================================
-- POLÍTICAS RLS (Row Level Security) - SEM AUTENTICAÇÃO
-- ============================================================================

-- Política 1: Permitir INSERT para TODOS (aplicação React)
-- Como não há autenticação, permitimos INSERT público
-- A validação de segurança deve ser feita na aplicação
CREATE POLICY "Allow public insert"
  ON tbwhatsapp
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Política 2: Permitir SELECT para service_role
-- Apenas a Edge Function pode ler mensagens da fila
CREATE POLICY "Allow select for service role"
  ON tbwhatsapp
  FOR SELECT
  TO service_role
  USING (true);

-- Política 3: Permitir UPDATE para service_role
-- Apenas a Edge Function pode atualizar status das mensagens
CREATE POLICY "Allow update for service role"
  ON tbwhatsapp
  FOR UPDATE
  TO service_role
  USING (true);

-- Política 4: Permitir DELETE para service_role
-- Apenas a Edge Function pode deletar mensagens (limpeza)
CREATE POLICY "Allow delete for service role"
  ON tbwhatsapp
  FOR DELETE
  TO service_role
  USING (true);

```

### Passo 3.3: Verificar Políticas

```sql
-- Listar todas as políticas RLS da tabela
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'tbwhatsapp';
```

**Resultado esperado:** Você deve ver 4 políticas:
1. `Allow public insert` - Para `public` (INSERT)
2. `Allow select for service role` - Para `service_role` (SELECT)
3. `Allow update for service role` - Para `service_role` (UPDATE)
4. `Allow delete for service role` - Para `service_role` (DELETE)

### ⚠️ Considerações de Segurança (SEM Autenticação)

Como você **não usa autenticação do Supabase**, a política `Allow public insert` permite que **qualquer pessoa** adicione mensagens à fila.

**Recomendações de segurança:**

1. **Validação na aplicação React:**
   - Valide dados antes de inserir na fila
   - Limite taxa de inserção (rate limiting no frontend)
   - Adicione captcha se necessário

2. **Proteção adicional (opcional):**
   ```sql
   -- Adicionar política com validação de campos obrigatórios
   DROP POLICY IF EXISTS "Allow public insert" ON tbwhatsapp;

   CREATE POLICY "Allow public insert with validation"
     ON tbwhatsapp
     FOR INSERT
     TO public
     WITH CHECK (
       phone_number IS NOT NULL
       AND phone_number ~ '^\d{10,15}$'  -- Validar formato do telefone
       AND message IS NOT NULL
       AND LENGTH(message) > 0
       AND LENGTH(message) <= 4096  -- Limitar tamanho da mensagem
     );
   ```

3. **Monitoramento:**
   - Monitore inserções suspeitas (muitas mensagens do mesmo IP)
   - Configure alertas para volume anormal
   - Revise logs regularmente

---

## 4. Criar Views de Monitoramento

### Passo 4.1: View de Estatísticas Gerais

```sql
-- ============================================================================
-- VIEW: tbwhatsapp_stats
-- Estatísticas gerais da fila de mensagens
-- ============================================================================

CREATE OR REPLACE VIEW tbwhatsapp_stats AS
SELECT 
  status,
  COUNT(*) as total,
  MIN(created_at) as oldest_message,
  MAX(created_at) as newest_message,
  AVG(attempts) as avg_attempts
FROM tbwhatsapp
GROUP BY status
ORDER BY 
  CASE status
    WHEN 'pending' THEN 1
    WHEN 'processing' THEN 2
    WHEN 'sent' THEN 3
    WHEN 'failed' THEN 4
    WHEN 'cancelled' THEN 5
  END;

-- Exemplo de uso:
-- SELECT * FROM tbwhatsapp_stats;
```

### Passo 4.2: View de Taxa de Sucesso Diária

```sql
-- ============================================================================
-- VIEW: tbwhatsapp_daily_stats
-- Estatísticas diárias de envio
-- ============================================================================

CREATE OR REPLACE VIEW tbwhatsapp_daily_stats AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_messages,
  COUNT(*) FILTER (WHERE status = 'sent') as sent,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) FILTER (WHERE status = 'processing') as processing,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'sent') / NULLIF(COUNT(*), 0), 
    2
  ) as success_rate_percent
FROM tbwhatsapp
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Exemplo de uso:
-- SELECT * FROM tbwhatsapp_daily_stats LIMIT 7;
```

### Passo 4.3: View de Mensagens Pendentes

```sql
-- ============================================================================
-- VIEW: tbwhatsapp_pending
-- Mensagens pendentes prontas para processar
-- ============================================================================

CREATE OR REPLACE VIEW tbwhatsapp_pending AS
SELECT 
  id,
  phone_number,
  LEFT(message, 50) || '...' as message_preview,
  priority,
  scheduled_for,
  attempts,
  max_attempts,
  created_at,
  metadata
FROM tbwhatsapp
WHERE status = 'pending'
  AND scheduled_for <= NOW()
  AND attempts < max_attempts
ORDER BY priority DESC, scheduled_for ASC;

-- Exemplo de uso:
-- SELECT * FROM tbwhatsapp_pending LIMIT 10;
```

---

## 5. Criar Funções Auxiliares

### Passo 5.1: Função para Limpar Mensagens Antigas

```sql
-- ============================================================================
-- FUNÇÃO: cleanup_old_messages
-- Remove mensagens enviadas com mais de 30 dias
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_messages(days_old INTEGER DEFAULT 30)
RETURNS TABLE(deleted_count BIGINT) AS $$
BEGIN
  WITH deleted AS (
    DELETE FROM tbwhatsapp
    WHERE status = 'sent'
      AND sent_at < NOW() - (days_old || ' days')::INTERVAL
    RETURNING *
  )
  SELECT COUNT(*) FROM deleted INTO deleted_count;
  
  RETURN QUERY SELECT deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exemplo de uso:
-- SELECT * FROM cleanup_old_messages(30); -- Remove mensagens enviadas há mais de 30 dias
```

### Passo 5.2: Função para Reprocessar Mensagens Falhadas

```sql
-- ============================================================================
-- FUNÇÃO: retry_failed_messages
-- Reprocessa mensagens que falharam (reseta para pending)
-- ============================================================================

CREATE OR REPLACE FUNCTION retry_failed_messages(max_age_hours INTEGER DEFAULT 24)
RETURNS TABLE(retried_count BIGINT) AS $$
BEGIN
  WITH updated AS (
    UPDATE tbwhatsapp
    SET 
      status = 'pending',
      attempts = 0,
      last_error = NULL,
      scheduled_for = NOW()
    WHERE status = 'failed'
      AND created_at > NOW() - (max_age_hours || ' hours')::INTERVAL
      AND attempts < max_attempts
    RETURNING *
  )
  SELECT COUNT(*) FROM updated INTO retried_count;
  
  RETURN QUERY SELECT retried_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exemplo de uso:
-- SELECT * FROM retry_failed_messages(24); -- Retenta mensagens falhadas nas últimas 24h
```

---

## 6. Testar a Configuração

### Passo 6.1: Inserir Mensagem de Teste

```sql
-- Inserir uma mensagem de teste
INSERT INTO tbwhatsapp (
  phone_number,
  message,
  priority,
  metadata
) VALUES (
  '5588996420521',
  '🧪 Mensagem de teste do sistema de fila WhatsApp',
  0,
  '{"tipo": "teste", "ambiente": "desenvolvimento"}'::jsonb
)
RETURNING *;
```

### Passo 6.2: Consultar Mensagens

```sql
-- Ver todas as mensagens
SELECT * FROM tbwhatsapp ORDER BY created_at DESC LIMIT 10;

-- Ver estatísticas
SELECT * FROM tbwhatsapp_stats;

-- Ver mensagens pendentes
SELECT * FROM tbwhatsapp_pending;
```

### Passo 6.3: Atualizar Status de Teste

```sql
-- Simular processamento
UPDATE tbwhatsapp
SET 
  status = 'processing',
  processed_at = NOW(),
  attempts = attempts + 1
WHERE status = 'pending'
  AND phone_number = '5588996420521'
RETURNING *;

-- Simular envio bem-sucedido
UPDATE tbwhatsapp
SET 
  status = 'sent',
  sent_at = NOW()
WHERE status = 'processing'
  AND phone_number = '5588996420521'
RETURNING *;
```

### Passo 6.4: Verificar Políticas RLS

```sql
-- Testar se RLS está funcionando
-- (Execute como usuário autenticado, não como service_role)
SELECT * FROM tbwhatsapp LIMIT 1;
```

---

## ✅ Checklist de Configuração

Marque cada item conforme for completando:

- [ ] Tabela `tbwhatsapp` criada
- [ ] Todos os índices criados
- [ ] RLS habilitado
- [ ] Políticas RLS criadas
- [ ] Views de monitoramento criadas
- [ ] Funções auxiliares criadas
- [ ] Teste de inserção realizado
- [ ] Teste de consulta realizado
- [ ] Teste de atualização realizado

---

**Próximo arquivo:** [03_EDGE_FUNCTION.md](./03_EDGE_FUNCTION.md)

