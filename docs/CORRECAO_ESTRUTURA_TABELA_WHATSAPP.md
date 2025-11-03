# 🔧 Correção - Estrutura da Tabela tbwhatsapp_send

## 🎯 Problema Identificado

**Data:** 2025-11-02  
**Severidade:** 🔴 CRÍTICA  
**Status:** ✅ RESOLVIDO

### Descrição do Erro

As mensagens **não estavam sendo salvas** na tabela `tbwhatsapp_send` do Supabase após a conclusão da inscrição.

### Erro do Console

```
❌ [WhatsApp Queue] Erro ao salvar mensagem: Object
❌ [InscricaoWizard] Erro ao salvar mensagem na fila: 
   Could not find the 'metadata' column of 'tbwhatsapp_send' in the schema cache

Status HTTP: 400 Bad Request
Endpoint: gonbyhpqnqnddqozqvhk.supabase.co/rest/v1/tbwhatsapp_send?select=*
```

---

## 🔍 Causa Raiz

### Divergência entre Documentação e Estrutura Real

A função `salvarMensagemWhatsAppNaFila()` estava tentando inserir dados usando uma estrutura **diferente** da estrutura real da tabela no Supabase.

#### Estrutura Esperada (Documentação)
```typescript
{
  phone_number: "5588996420521",  // ❌ Campo não existe
  message: "...",
  status: "pending",              // ❌ Valor incorreto
  scheduled_for: null,            // ❌ Campo não existe
  metadata: {                     // ❌ Campo não existe
    matricula: "000123",
    origem: "inscricao_wizard"
  }
}
```

#### Estrutura Real (Supabase)
```typescript
{
  numero: "5588996420521",        // ✅ Campo correto
  message: "...",
  status: "pendente",             // ✅ Valor correto
  agendado: null,                 // ✅ Campo correto
  matricula: "000123"             // ✅ Campo direto (não em metadata)
}
```

---

## ✅ Solução Implementada

### 1. Correção da Função `salvarMensagemWhatsAppNaFila()`

**Arquivo:** `src/pages/InscricaoWizard.tsx`  
**Linhas:** 76-125

#### Antes (INCORRETO)
```typescript
const { data, error } = await supabase
  .from('tbwhatsapp_send')
  .insert({
    phone_number: numeroInternacional,  // ❌
    message: mensagem,
    status: 'pending',                  // ❌
    priority: 0,
    scheduled_for: null,                // ❌
    max_attempts: 3,
    metadata: {                         // ❌
      matricula: matricula,
      origem: 'inscricao_wizard',
      timestamp: new Date().toISOString()
    }
  })
  .select()
```

#### Depois (CORRETO)
```typescript
const { data, error } = await supabase
  .from('tbwhatsapp_send')
  .insert({
    numero: numeroInternacional,        // ✅
    message: mensagem,
    status: 'pendente',                 // ✅
    priority: 0,
    agendado: null,                     // ✅
    max_attempts: 3,
    matricula: matricula                // ✅
  })
  .select()
```

### 2. Melhorias no Logging

Adicionado log da matrícula para facilitar debugging:

```typescript
console.log('📱 [WhatsApp Queue] Salvando mensagem na fila...')
console.log('📱 [WhatsApp Queue] Matrícula:', matricula)  // ✅ NOVO
console.log('📱 [WhatsApp Queue] Número formatado:', numeroInternacional)
```

---

## 📋 Estrutura Real da Tabela

### SQL Completo

```sql
CREATE TABLE public.tbwhatsapp_send (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) NULL DEFAULT 'pendente',
  priority INTEGER NULL DEFAULT 0,
  agendado TIMESTAMP WITH TIME ZONE NULL,
  attempts INTEGER NULL DEFAULT 0,
  max_attempts INTEGER NULL DEFAULT 3,
  last_error TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT (NOW() AT TIME ZONE 'America/Sao_Paulo'),
  processed_at TIMESTAMP WITH TIME ZONE NULL,
  sent_at TIMESTAMP WITH TIME ZONE NULL,
  matricula TEXT NULL,
  CONSTRAINT tbwhatsapp_send_pkey PRIMARY KEY (id),
  CONSTRAINT tbwhatsapp_send_status_check CHECK (
    status IN ('pendente', 'enviando', 'enviado', 'falhou', 'cancelado')
  )
);
```

### Mapeamento de Campos

| Documentação | Estrutura Real | Tipo | Observação |
|--------------|----------------|------|------------|
| `phone_number` | `numero` | TEXT | ✅ Corrigido |
| `status: 'pending'` | `status: 'pendente'` | VARCHAR(20) | ✅ Corrigido |
| `scheduled_for` | `agendado` | TIMESTAMP | ✅ Corrigido |
| `metadata.matricula` | `matricula` | TEXT | ✅ Campo direto |
| `metadata.origem` | - | - | ❌ Removido (não existe) |
| `metadata.timestamp` | - | - | ❌ Removido (não existe) |

---

## 🧪 Testes Realizados

### Cenários Testados

- [x] Inscrição tipo "Corrida + Natal"
- [x] Inscrição tipo "Apenas Natal"
- [x] Inscrição tipo "Retirar Cesta"
- [x] Formatação de número de telefone
- [x] Salvamento da matrícula
- [x] Logs do console

### Resultados Esperados

✅ **Sucesso:**
```
📱 [WhatsApp Queue] Salvando mensagem na fila...
📱 [WhatsApp Queue] Matrícula: 000123
📱 [WhatsApp Queue] Número formatado: 5588996420521
✅ [WhatsApp Queue] Mensagem salva na fila com sucesso!
📋 [WhatsApp Queue] Dados salvos: [{ id: "...", numero: "5588996420521", ... }]
```

❌ **Erro (antes da correção):**
```
❌ [WhatsApp Queue] Erro ao salvar mensagem: Object
❌ [InscricaoWizard] Erro ao salvar mensagem na fila: 
   Could not find the 'metadata' column of 'tbwhatsapp_send' in the schema cache
```

---

## 📚 Documentação Atualizada

### Arquivos Modificados

1. **`src/pages/InscricaoWizard.tsx`**
   - Função `salvarMensagemWhatsAppNaFila()` corrigida
   - Logs melhorados

2. **`docs/CHANGELOG_INSCRICAO_WIZARD.md`**
   - Estrutura de dados salvos atualizada
   - Tabela tbwhatsapp_send documentada corretamente
   - Seção de segurança atualizada

3. **`docs/CORRECAO_ESTRUTURA_TABELA_WHATSAPP.md`** (este arquivo)
   - Documentação do problema e solução

---

## 🔄 Impacto da Correção

### Antes
- ❌ Mensagens não eram salvas
- ❌ Erro 400 Bad Request
- ❌ Inscrições não geravam notificações
- ❌ Fila de WhatsApp vazia

### Depois
- ✅ Mensagens salvas corretamente
- ✅ Status HTTP 200/201 OK
- ✅ Inscrições geram mensagens na fila
- ✅ Fila de WhatsApp populada

---

## 🚀 Próximos Passos

### Implementação Futura

1. **Edge Function para Processar Fila**
   - Ler mensagens com `status = 'pendente'`
   - Enviar via Evolution API
   - Atualizar status para `'enviado'` ou `'falhou'`

2. **Monitoramento**
   - Dashboard de mensagens na fila
   - Alertas para mensagens com status `'falhou'`
   - Relatórios de performance

3. **Retry Logic**
   - Implementar tentativas automáticas
   - Incrementar campo `attempts`
   - Registrar `last_error`

---

## ⚠️ Lições Aprendidas

### Boas Práticas

1. **Sempre verificar a estrutura real da tabela** antes de implementar código
2. **Usar ferramentas de schema inspection** do Supabase
3. **Testar inserções manualmente** antes de integrar no código
4. **Manter documentação sincronizada** com a estrutura real
5. **Adicionar logs detalhados** para facilitar debugging

### Checklist para Futuras Integrações

- [ ] Verificar estrutura da tabela no Supabase Dashboard
- [ ] Exportar schema SQL da tabela
- [ ] Testar INSERT manual via SQL Editor
- [ ] Validar tipos de dados
- [ ] Verificar constraints e checks
- [ ] Testar via Supabase Client
- [ ] Adicionar logs detalhados
- [ ] Documentar estrutura real

---

## 📞 Referências

### Documentação Relacionada

- `docs/WhatsApp/ESTRUTURA_TABELAS.md` - Estrutura de tabelas WhatsApp
- `docs/WhatsApp/02_CONFIGURACAO_SUPABASE.md` - Configuração do Supabase
- `docs/CHANGELOG_INSCRICAO_WIZARD.md` - Changelog das alterações

### Supabase Dashboard

- **Projeto:** APFAR
- **ID:** dojavjvqvobnumebaouc
- **Região:** sa-east-1
- **Tabela:** `public.tbwhatsapp_send`

---

**Última atualização:** 2025-11-02  
**Versão:** 2.0.1  
**Status:** ✅ RESOLVIDO  
**Autor:** Sistema SICFAR - FARMACE

