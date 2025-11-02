# ⚡ Início Rápido - Sistema de Fila WhatsApp

## 🎯 Objetivo

Implementar sistema de fila WhatsApp em **3 horas** para evitar suspensões por envio em massa.

---

## 📋 Pré-requisitos (5 minutos)

### Verificar se você tem:

- [ ] Conta no Supabase (https://supabase.com)
- [ ] Projeto APFAR criado no Supabase
- [ ] Evolution API configurada e funcionando
- [ ] Node.js instalado (versão 18+)
- [ ] Acesso ao código do projeto SemanaQualidade

### Informações necessárias:

```bash
# Supabase
SUPABASE_URL=https://gonbyhpqnqnddqozqvhk.supabase.co
SUPABASE_PROJECT_ID=dojavjvqvobnumebaouc

# Evolution API
EVOLUTION_API_URL=https://evolution-evolution-api.r9ho4z.easypanel.host
EVOLUTION_API_TOKEN=C13A27923481-43C6-9309-D04172018948
EVOLUTION_INSTANCE_NAME=FARMACE
```

---

## 🚀 Passo 1: Configurar Supabase (30 min)

### 1.1. Acessar SQL Editor

1. Acesse: https://supabase.com/dashboard/project/dojavjvqvobnumebaouc
2. Menu lateral → **SQL Editor**
3. Clique em **New Query**

### 1.2. Criar Tabela

Cole e execute este SQL:

```sql
-- Criar tabela tbwhatsapp
CREATE TABLE IF NOT EXISTS tbwhatsapp (
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

✅ **Verificar:** Execute `SELECT * FROM tbwhatsapp;` - deve retornar tabela vazia.

### 1.3. Criar Índices

```sql
CREATE INDEX idx_tbwhatsapp_status ON tbwhatsapp(status);
CREATE INDEX idx_tbwhatsapp_priority_scheduled ON tbwhatsapp(priority DESC, scheduled_for ASC);
```

### 1.4. Habilitar RLS (SEM Autenticação)

**⚠️ Como você não usa autenticação do Supabase**, vamos configurar RLS para acesso público controlado:

```sql
ALTER TABLE tbwhatsapp ENABLE ROW LEVEL SECURITY;

-- Permitir INSERT público (aplicação React)
CREATE POLICY "Allow public insert"
  ON tbwhatsapp FOR INSERT TO public WITH CHECK (true);

-- Permitir tudo para service_role (Edge Function)
CREATE POLICY "Allow all for service role"
  ON tbwhatsapp FOR ALL TO service_role USING (true);
```

✅ **Checkpoint 1:** Tabela criada e configurada!

---

## ⚡ Passo 2: Criar Edge Function (1 hora)

### 2.1. Instalar Supabase CLI

```bash
npm install -g supabase
```

### 2.2. Login e Linkar Projeto

```bash
# Login
supabase login

# Ir para o diretório do projeto
cd /home/emanuel/SemanaQualidade

# Linkar com projeto
supabase link --project-ref dojavjvqvobnumebaouc
```

### 2.3. Criar Edge Function

```bash
supabase functions new process-whatsapp-queue
```

### 2.4. Copiar Código

Abra o arquivo criado:
```bash
nano supabase/functions/process-whatsapp-queue/index.ts
```

**Cole o código completo do arquivo:** [03_EDGE_FUNCTION.md - Seção 4](./03_EDGE_FUNCTION.md#4-implementar-código)

### 2.5. Configurar Secrets

```bash
supabase secrets set EVOLUTION_API_URL=https://evolution-evolution-api.r9ho4z.easypanel.host
supabase secrets set EVOLUTION_API_TOKEN=C13A27923481-43C6-9309-D04172018948
supabase secrets set EVOLUTION_INSTANCE_NAME=FARMACE
```

### 2.6. Deploy

```bash
supabase functions deploy process-whatsapp-queue
```

✅ **Verificar:** Execute `supabase functions list` - deve aparecer a function.

### 2.7. Configurar Cron Job

No SQL Editor do Supabase:

```sql
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

✅ **Checkpoint 2:** Edge Function deployada e agendada!

---

## ⚛️ Passo 3: Integrar com React (1 hora)

### 3.1. Criar Serviço de Fila

Crie o arquivo: `src/services/whatsappQueueService.ts`

**Cole o código completo do arquivo:** [04_INTEGRACAO_REACT.md - Seção 1.1](./04_INTEGRACAO_REACT.md#passo-11-criar-arquivo-whatsappqueueservicets)

### 3.2. Modificar InscricaoWizard.tsx

#### 3.2.1. Atualizar Imports

```typescript
// REMOVER:
// import { sendWhatsAppMessage, sendWhatsAppDocument } from '@/services/whatsappService'

// ADICIONAR:
import { gerarMensagemConfirmacao, gerarMensagemRetirarCesta, gerarMensagemApenasNatal } from '@/services/whatsappService'
import { addToWhatsAppQueue } from '@/services/whatsappQueueService'
```

#### 3.2.2. Modificar handleSubmit (Corrida)

Localize a linha ~694 e substitua:

```typescript
// ANTES:
const resultado = await sendWhatsAppMessage({
  phoneNumber: formData.whatsapp,
  message: mensagem
})

// DEPOIS:
const resultado = await addToWhatsAppQueue({
  phoneNumber: formData.whatsapp,
  message: mensagem,
  priority: 1,
  metadata: {
    tipo: 'confirmacao_inscricao',
    numeroParticipante: numeroParticipanteRetornado,
    nome: formData.nome,
    modalidade: formData.modalidadeCorrida
  }
})
```

#### 3.2.3. Modificar Envio de PDF

Localize a linha ~739 e substitua:

```typescript
// ANTES:
const resultadoPDF = await sendWhatsAppDocument({
  phoneNumber: formData.whatsapp,
  message: '📋 Aqui está o comprovante da sua inscrição em PDF!',
  documentBase64: pdfBase64,
  fileName: `Comprovante_Inscricao_${numeroParticipanteRetornado}.pdf`,
  mimeType: 'application/pdf'
})

// DEPOIS:
const resultadoPDF = await addToWhatsAppQueue({
  phoneNumber: formData.whatsapp,
  message: '📋 Aqui está o comprovante da sua inscrição em PDF!',
  documentBase64: pdfBase64,
  documentFilename: `Comprovante_Inscricao_${numeroParticipanteRetornado}.pdf`,
  documentMimetype: 'application/pdf',
  priority: 2,
  metadata: {
    tipo: 'comprovante_pdf',
    numeroParticipante: numeroParticipanteRetornado,
    nome: formData.nome
  }
})
```

#### 3.2.4. Repetir para outras funções

Faça o mesmo para:
- `handleSubmitApenasNatal` (linha ~340)
- `handleSubmitRetirarCesta` (linha ~500)

✅ **Checkpoint 3:** Integração React completa!

---

## 🧪 Passo 4: Testar (30 min)

### 4.1. Teste Manual

```bash
# Iniciar aplicação
cd /home/emanuel/SemanaQualidade
npm run dev
```

### 4.2. Fazer Inscrição de Teste

1. Acesse: http://localhost:5173/inscricao
2. Preencha formulário com seus dados reais
3. Use seu número de WhatsApp
4. Confirme inscrição

### 4.3. Verificar no Supabase

```sql
-- Ver mensagem na fila
SELECT * FROM tbwhatsapp 
WHERE phone_number = '5588996420521' 
ORDER BY created_at DESC;
```

Deve aparecer 2 registros:
- 1 mensagem de confirmação (status: pending)
- 1 PDF (status: pending)

### 4.4. Executar Edge Function Manualmente

```bash
supabase functions invoke process-whatsapp-queue
```

### 4.5. Verificar Logs

```bash
supabase functions logs process-whatsapp-queue --limit 50
```

### 4.6. Aguardar Mensagem

- Aguarde até 5 minutos (Cron Job)
- Verifique se recebeu mensagem no WhatsApp
- Verifique se status mudou para 'sent'

```sql
SELECT * FROM tbwhatsapp 
WHERE phone_number = '5588996420521' 
ORDER BY created_at DESC;
```

✅ **Checkpoint 4:** Sistema funcionando end-to-end!

---

## 📊 Passo 5: Monitorar (Contínuo)

### Queries Úteis

```sql
-- Estatísticas gerais
SELECT 
  status,
  COUNT(*) as total
FROM tbwhatsapp
GROUP BY status;

-- Mensagens pendentes
SELECT COUNT(*) FROM tbwhatsapp WHERE status = 'pending';

-- Mensagens falhadas
SELECT * FROM tbwhatsapp WHERE status = 'failed';

-- Taxa de sucesso (últimas 24h)
SELECT 
  COUNT(*) FILTER (WHERE status = 'sent') as enviadas,
  COUNT(*) FILTER (WHERE status = 'failed') as falhadas,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'sent') / COUNT(*), 2) as taxa_sucesso
FROM tbwhatsapp
WHERE created_at >= NOW() - INTERVAL '24 hours';
```

---

## ✅ Checklist Final

### Implementação
- [ ] Tabela `tbwhatsapp` criada
- [ ] Índices configurados
- [ ] RLS habilitado
- [ ] Edge Function deployada
- [ ] Cron Job configurado
- [ ] Serviço `whatsappQueueService.ts` criado
- [ ] `InscricaoWizard.tsx` modificado

### Testes
- [ ] Inscrição de teste realizada
- [ ] Mensagem adicionada à fila
- [ ] Edge Function executada
- [ ] Mensagem recebida no WhatsApp
- [ ] Status atualizado para 'sent'

### Monitoramento
- [ ] Queries de monitoramento testadas
- [ ] Logs acessíveis
- [ ] Alertas configurados (opcional)

---

## 🆘 Problemas Comuns

### "Mensagem não foi enviada"

**Verificar:**
1. Instância WhatsApp está conectada? `node scripts/test-connection.js`
2. Edge Function está executando? `supabase functions logs process-whatsapp-queue`
3. Cron Job está ativo? `SELECT * FROM cron.job;`

**Solução rápida:**
```bash
# Executar manualmente
supabase functions invoke process-whatsapp-queue
```

### "Erro de permissão RLS"

**Solução:**
```sql
CREATE POLICY "Allow all for service role" 
  ON tbwhatsapp FOR ALL TO service_role USING (true);
```

### "Edge Function não encontrada"

**Solução:**
```bash
supabase functions deploy process-whatsapp-queue
```

---

## 📚 Próximos Passos

### Após implementação básica funcionar:

1. **Ler documentação completa:** [README.md](./README.md)
2. **Configurar monitoramento:** [05_MONITORAMENTO.md](./05_MONITORAMENTO.md)
3. **Planejar melhorias:** [07_MELHORIAS_FUTURAS.md](./07_MELHORIAS_FUTURAS.md)

---

## 🎉 Parabéns!

Você implementou com sucesso o **Sistema de Fila WhatsApp**!

**Benefícios alcançados:**
- ✅ Zero suspensões do WhatsApp
- ✅ Envio controlado e gradual
- ✅ Retry automático
- ✅ Monitoramento completo
- ✅ Escalável para milhares de mensagens

**Tempo total:** ~3 horas  
**Custo:** R$ 0,00  
**Resultado:** Sistema profissional e robusto

---

**Dúvidas?** Consulte a [documentação completa](./README.md) ou o [índice](./INDICE.md).

**Problemas?** Veja o [guia de troubleshooting](./06_TROUBLESHOOTING.md).

**Boa sorte!** 🚀

