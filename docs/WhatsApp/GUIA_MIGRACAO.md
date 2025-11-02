# 🔄 Guia de Migração - whatsapp_queue → tbwhatsapp_send

## 📋 Visão Geral

Este guia ajuda você a migrar do sistema antigo (`whatsapp_queue` com autenticação) para o novo sistema (`tbwhatsapp_send` sem autenticação).

**Tempo estimado:** 30 minutos

---

## ⚠️ Antes de Começar

### Pré-requisitos

- [ ] Acesso ao dashboard do Supabase
- [ ] Acesso ao SQL Editor
- [ ] Backup do banco de dados (recomendado)
- [ ] Código do projeto atualizado

### Fazer Backup (IMPORTANTE!)

```sql
-- Criar backup da tabela antiga (se existir)
CREATE TABLE whatsapp_queue_backup AS 
SELECT * FROM whatsapp_queue;

-- Verificar backup
SELECT COUNT(*) FROM whatsapp_queue_backup;
```

---

## 🚀 Opção 1: Migração com Renomeação (Recomendado)

Use esta opção se você **já tem dados** na tabela `whatsapp_queue` e quer mantê-los.

### Passo 1: Renomear Tabela

```sql
-- Renomear tabela existente
ALTER TABLE whatsapp_queue RENAME TO tbwhatsapp_send;

-- Verificar
SELECT tablename FROM pg_tables WHERE tablename = 'tbwhatsapp_send';
```

### Passo 2: Atualizar Políticas RLS

```sql
-- Remover políticas antigas
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON tbwhatsapp_send;
DROP POLICY IF EXISTS "Allow select own messages for authenticated users" ON tbwhatsapp_send;

-- Criar nova política pública
CREATE POLICY "Allow public insert" 
  ON tbwhatsapp_send
  FOR INSERT 
  TO public
  WITH CHECK (true);

-- Manter políticas service_role (se já existirem, não precisa recriar)
-- Se não existirem, criar:

CREATE POLICY "Allow select for service role" 
  ON tbwhatsapp_send
  FOR SELECT 
  TO service_role
  USING (true);

CREATE POLICY "Allow update for service role" 
  ON tbwhatsapp_send
  FOR UPDATE 
  TO service_role
  USING (true);

CREATE POLICY "Allow delete for service role" 
  ON tbwhatsapp_send
  FOR DELETE 
  TO service_role
  USING (true);
```

### Passo 3: Verificar Políticas

```sql
SELECT policyname, roles, cmd
FROM pg_policies
WHERE tablename = 'tbwhatsapp_send'
ORDER BY policyname;
```

**Resultado esperado:**
```
policyname                      | roles           | cmd
--------------------------------|-----------------|--------
Allow delete for service role   | {service_role}  | DELETE
Allow public insert             | {public}        | INSERT
Allow select for service role   | {service_role}  | SELECT
Allow update for service role   | {service_role}  | UPDATE
```

### Passo 4: Atualizar Edge Function

```bash
# Ir para o diretório do projeto
cd /home/emanuel/SemanaQualidade

# Editar Edge Function
nano supabase/functions/process-whatsapp-queue/index.ts
```

**Substituir todas as ocorrências de `whatsapp_queue` por `tbwhatsapp_send`:**

```typescript
// ANTES:
const { data: messages } = await supabaseAdmin
  .from('whatsapp_queue')  // ❌
  .select('*')

// DEPOIS:
const { data: messages } = await supabaseAdmin
  .from('tbwhatsapp_send')  // ✅
  .select('*')
```

**Ou usar comando sed:**

```bash
sed -i "s/whatsapp_queue/tbwhatsapp_send/g" supabase/functions/process-whatsapp-queue/index.ts
```

### Passo 5: Redeploy Edge Function

```bash
supabase functions deploy process-whatsapp-queue
```

### Passo 6: Atualizar Código React

```bash
# Atualizar whatsappQueueService.ts
sed -i "s/whatsapp_queue/tbwhatsapp_send/g" src/services/whatsappQueueService.ts
```

### Passo 7: Testar

```sql
-- Inserir mensagem de teste
INSERT INTO tbwhatsapp_send (phone_number, message, priority, metadata)
VALUES (
  '5588996420521',
  'Teste de migração',
  1,
  '{"tipo": "teste_migracao"}'::jsonb
);

-- Verificar
SELECT * FROM tbwhatsapp_send ORDER BY created_at DESC LIMIT 1;
```

✅ **Migração concluída!**

---

## 🆕 Opção 2: Instalação Limpa (Sem Dados Antigos)

Use esta opção se você **não tem dados importantes** ou quer começar do zero.

### Passo 1: Remover Tabela Antiga (Opcional)

```sql
-- CUIDADO: Isso apaga todos os dados!
DROP TABLE IF EXISTS whatsapp_queue CASCADE;
```

### Passo 2: Criar Nova Tabela

Siga o arquivo `02_CONFIGURACAO_SUPABASE.md` completo, seção 1.

```sql
CREATE TABLE IF NOT EXISTS tbwhatsapp_send (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  document_base64 TEXT,
  document_filename VARCHAR(255),
  document_mimetype VARCHAR(100) DEFAULT 'application/pdf',
  status VARCHAR(20) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  priority INTEGER DEFAULT 0,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_error TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE
);
```

### Passo 3: Criar Índices

```sql
CREATE INDEX idx_tbwhatsapp_status ON tbwhatsapp_send(status);
CREATE INDEX idx_tbwhatsapp_priority_scheduled ON tbwhatsapp_send(priority DESC, scheduled_for ASC);
CREATE INDEX idx_tbwhatsapp_created ON tbwhatsapp_send(created_at DESC);
CREATE INDEX idx_tbwhatsapp_phone ON tbwhatsapp_send(phone_number);
CREATE INDEX idx_tbwhatsapp_processable ON tbwhatsapp_send(status, scheduled_for) WHERE status = 'pending';
```

### Passo 4: Configurar RLS

```sql
ALTER TABLE tbwhatsapp_send ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" 
  ON tbwhatsapp_send FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow select for service role" 
  ON tbwhatsapp_send FOR SELECT TO service_role USING (true);

CREATE POLICY "Allow update for service role" 
  ON tbwhatsapp_send FOR UPDATE TO service_role USING (true);

CREATE POLICY "Allow delete for service role" 
  ON tbwhatsapp_send FOR DELETE TO service_role USING (true);
```

### Passo 5: Seguir Documentação

Continue com `INICIO_RAPIDO.md` a partir do Passo 2 (Edge Function).

---

## 🔍 Verificação Pós-Migração

### Checklist de Validação

- [ ] Tabela `tbwhatsapp_send` existe
- [ ] Políticas RLS corretas (4 políticas)
- [ ] Índices criados (5 índices)
- [ ] Edge Function atualizada e deployada
- [ ] Código React atualizado
- [ ] Teste de inserção funcionando
- [ ] Teste de processamento funcionando
- [ ] Mensagem recebida no WhatsApp

### Queries de Verificação

```sql
-- 1. Verificar tabela
SELECT tablename FROM pg_tables WHERE tablename = 'tbwhatsapp_send';

-- 2. Verificar políticas
SELECT COUNT(*) FROM pg_policies WHERE tablename = 'tbwhatsapp_send';
-- Deve retornar: 4

-- 3. Verificar índices
SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'tbwhatsapp_send';
-- Deve retornar: 6 (5 criados + 1 primary key)

-- 4. Verificar dados (se migrou)
SELECT COUNT(*) FROM tbwhatsapp_send;

-- 5. Verificar estrutura
\d tbwhatsapp_send
```

---

## 🐛 Problemas Comuns

### Erro: "relation whatsapp_queue does not exist"

**Causa:** Edge Function ou código React ainda usa nome antigo.

**Solução:**
```bash
# Verificar Edge Function
grep -n "whatsapp_queue" supabase/functions/process-whatsapp-queue/index.ts

# Verificar serviço React
grep -n "whatsapp_queue" src/services/whatsappQueueService.ts

# Substituir
sed -i "s/whatsapp_queue/tbwhatsapp_send/g" <arquivo>
```

### Erro: "permission denied for table tbwhatsapp_send"

**Causa:** Políticas RLS não configuradas corretamente.

**Solução:**
```sql
-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'tbwhatsapp_send';

-- Recriar políticas
-- (ver Passo 2 da Opção 1)
```

### Erro: "new row violates row-level security policy"

**Causa:** Tentando inserir sem permissão.

**Solução:**
```sql
-- Verificar política de INSERT
SELECT * FROM pg_policies 
WHERE tablename = 'tbwhatsapp_send' 
  AND cmd = 'INSERT';

-- Deve existir política "Allow public insert" para role "public"
```

---

## 📊 Comparação: Antes vs Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Nome da tabela** | `whatsapp_queue` | `tbwhatsapp_send` |
| **Autenticação** | Requerida (`authenticated`) | Não requerida (`public`) |
| **INSERT** | Apenas usuários autenticados | Qualquer pessoa (público) |
| **SELECT** | Usuários autenticados + service_role | Apenas service_role |
| **UPDATE/DELETE** | Apenas service_role | Apenas service_role |
| **Segurança** | Via autenticação Supabase | Via validação na aplicação |

---

## 🔐 Recomendações de Segurança

Como agora o INSERT é público, implemente estas proteções:

### 1. Validação no Frontend

```typescript
// src/services/whatsappQueueService.ts

function validateBeforeInsert(data: QueueMessageParams): boolean {
  // Validar telefone
  if (!data.phoneNumber || !/^\d{10,15}$/.test(data.phoneNumber)) {
    throw new Error('Telefone inválido')
  }
  
  // Validar mensagem
  if (!data.message || data.message.length > 4096) {
    throw new Error('Mensagem inválida')
  }
  
  return true
}
```

### 2. Rate Limiting

```typescript
// Limitar inserções por sessão
const MAX_MESSAGES_PER_SESSION = 10

function checkRateLimit(): boolean {
  const count = parseInt(sessionStorage.getItem('message_count') || '0')
  if (count >= MAX_MESSAGES_PER_SESSION) {
    throw new Error('Limite de mensagens atingido')
  }
  sessionStorage.setItem('message_count', (count + 1).toString())
  return true
}
```

### 3. Monitoramento

```sql
-- Criar alerta para inserções suspeitas
CREATE OR REPLACE FUNCTION check_suspicious_inserts()
RETURNS TABLE(phone_number VARCHAR, message_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.phone_number,
    COUNT(*) as message_count
  FROM tbwhatsapp_send t
  WHERE t.created_at >= NOW() - INTERVAL '1 hour'
  GROUP BY t.phone_number
  HAVING COUNT(*) > 20;
END;
$$ LANGUAGE plpgsql;

-- Executar diariamente
SELECT * FROM check_suspicious_inserts();
```

---

## ✅ Conclusão

Após seguir este guia, você terá:

- ✅ Tabela renomeada para `tbwhatsapp_send`
- ✅ Políticas RLS atualizadas (sem autenticação)
- ✅ Edge Function atualizada
- ✅ Código React atualizado
- ✅ Sistema funcionando normalmente

**Próximo passo:** Implementar validações de segurança recomendadas.

---

**Dúvidas?** Consulte:
- `02_CONFIGURACAO_SUPABASE.md` - Configuração completa
- `06_TROUBLESHOOTING.md` - Resolução de problemas
- `CHANGELOG_ATUALIZACAO.md` - Detalhes das mudanças

