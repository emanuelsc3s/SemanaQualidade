# 🗄️ Integração Supabase - II Corrida FARMACE

## 📋 Visão Geral

Este documento descreve a integração completa com o Supabase para gerenciamento de inscrições da II Corrida e Caminhada da Qualidade FARMACE.

**Status:** ✅ Implementado e funcional

**Data de implementação:** 2025-10-31

---

## 🔧 Configuração

### 1. Variáveis de Ambiente

As credenciais do Supabase são armazenadas no arquivo `.env` na raiz do projeto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica-anon-key-aqui
```

**Onde encontrar as credenciais:**

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

⚠️ **IMPORTANTE:** 
- O arquivo `.env` está no `.gitignore` e **NÃO** deve ser commitado
- Use `.env.example` como template
- Nunca exponha a `service_role` key no frontend

---

## 📁 Estrutura de Arquivos

```
src/
├── services/
│   ├── supabase.ts                          # Cliente Supabase + tipos TypeScript
│   ├── inscricaoCorridaSupabaseService.ts   # Serviço de inscrições
│   └── whatsappService.ts                   # Serviço WhatsApp (já existente)
├── pages/
│   └── InscricaoWizard.tsx                  # Formulário de inscrição wizard (ativo)
└── vite-env.d.ts                            # Tipos das variáveis de ambiente
```

---

## 🗃️ Tabela de Destino: `tbcorrida`

### Schema

```sql
CREATE TABLE public.tbcorrida (
  corrida_id SERIAL PRIMARY KEY,
  data_inscricao TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'America/Sao_Paulo'),
  matricula TEXT NULL,
  email TEXT NULL,
  whatsapp TEXT NULL,
  tipo_participacao tipo_participacao_enum NOT NULL,
  modalidade TEXT NULL,
  tamanho_camiseta TEXT NULL,
  aceitou_regulamento BOOLEAN NOT NULL DEFAULT false,
  data_aceite_regulamento TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'America/Sao_Paulo'),
  status status_inscricao_enum NULL,
  kit_retirado BOOLEAN NOT NULL DEFAULT false,
  data_retirada_kit TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'America/Sao_Paulo'),
  created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'America/Sao_Paulo'),
  deleted_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'America/Sao_Paulo'),
  nome TEXT NULL,
  cpf TEXT NULL,
  nascimento TIMESTAMP NULL DEFAULT (NOW() AT TIME ZONE 'America/Sao_Paulo')
);
```

### Enums

**`tipo_participacao_enum`:**
- `'corrida-natal'` - Participar da corrida e da comemoração de Natal
- `'apenas-natal'` - Participar apenas da comemoração de Natal
- `'retirar-cesta'` - Não participar, apenas retirar cesta natalina

**`status_inscricao_enum`:**
- `'pendente'` - Inscrição realizada, aguardando revisão
- `'confirmada'` - Inscrição confirmada pela organização
- `'cancelada'` - Inscrição cancelada
- `'compareceu'` - Participante compareceu no evento

---

## 🔄 Mapeamento de Campos

### Formulário → Banco de Dados

| Campo do Formulário | Campo no Banco | Tipo | Observações |
|---------------------|----------------|------|-------------|
| `formData.nome` | `nome` | TEXT | Nome completo do participante |
| `formData.email` | `email` | TEXT | Email (convertido para lowercase) |
| `formData.telefone` | `whatsapp` | TEXT | Telefone/WhatsApp formatado |
| `formData.cpf` | `cpf` | TEXT | CPF com máscara |
| `formData.dataNascimento` | `nascimento` | DATE | Formato: 'YYYY-MM-DD' |
| `formData.tipoParticipacao` | `tipo_participacao` | ENUM | Validado antes da inserção |
| `formData.modalidadeCorrida` | `modalidade` | TEXT | Apenas se `tipo_participacao = 'corrida-natal'` |
| `formData.tamanho` | `tamanho_camiseta` | TEXT | Apenas se `tipo_participacao = 'corrida-natal'` |
| *(implícito)* | `aceitou_regulamento` | BOOLEAN | Sempre `true` (aceite implícito) |
| *(implícito)* | `status` | ENUM | Sempre `'pendente'` inicialmente |
| *(futuro)* | `matricula` | TEXT | `NULL` por enquanto |

---

## 🚀 Fluxo de Inscrição

### 1. Usuário Preenche o Formulário

O usuário passa por 3 ou 4 etapas (dependendo do tipo de participação):

1. **Etapa 1:** Tipo de participação + Modalidade (se corrida)
2. **Etapa 2:** Dados pessoais + Endereço
3. **Etapa 3:** Tamanho da camiseta + Foto (apenas se corrida)
4. **Etapa Final:** Revisão e confirmação

### 2. Validação no Frontend

Antes de enviar ao Supabase, o formulário valida:

- ✅ Todos os campos obrigatórios preenchidos
- ✅ Email válido (regex)
- ✅ CPF válido (algoritmo de validação)
- ✅ Telefone válido (mínimo 10 dígitos)
- ✅ Modalidade obrigatória se `tipo_participacao = 'corrida-natal'`

### 3. Salvamento no Supabase

**Arquivo:** `src/services/inscricaoCorridaSupabaseService.ts`

**Função:** `salvarInscricaoSupabase(formData)`

**Processo:**

```typescript
1. Valida tipo de participação (enum)
2. Valida campos obrigatórios
3. Monta objeto TbCorridaInsert
4. Insere no Supabase via .insert()
5. Retorna corrida_id gerado
6. Gera número do participante (formato: 0001, 0002...)
```

**Logs de Debug:**

```
🚀 [Inscrição Supabase] Iniciando salvamento de inscrição...
📋 [Inscrição Supabase] Dados recebidos: {...}
✅ [Inscrição Supabase] Validações iniciais concluídas
📤 [Inscrição Supabase] Dados preparados para inserção: {...}
💾 [Inscrição Supabase] Enviando para o banco de dados...
✅ [Inscrição Supabase] Inscrição salva com sucesso!
📊 [Inscrição Supabase] ID gerado: 123
🎫 [Inscrição Supabase] Número do participante: 0123
```

### 4. Envio de Confirmação via WhatsApp

**Apenas se `tipo_participacao = 'corrida-natal'`**

Após salvar no banco, envia mensagem via Evolution API:

```typescript
const mensagem = gerarMensagemConfirmacao(
  formData.nome,
  numeroParticipante,
  formData.modalidadeCorrida
)

await sendWhatsAppMessage({
  phoneNumber: formData.telefone,
  message: mensagem
})
```

⚠️ **Nota:** Se o WhatsApp falhar, a inscrição **ainda é salva** no banco. O erro é apenas logado.

### 5. Tela de Confirmação

Exibe ao usuário:

- ✅ Número do participante
- ✅ Valor da inscrição (R$ 35,00) - apenas se corrida
- ✅ Confirmação de envio via WhatsApp
- ✅ Botão para voltar à home

---

## 🛡️ Tratamento de Erros

### Erros Possíveis

| Erro | Causa | Tratamento |
|------|-------|------------|
| **Variáveis de ambiente não configuradas** | `.env` ausente ou incompleto | Lança erro ao inicializar cliente |
| **Tipo de participação inválido** | Valor não está no enum | Retorna erro antes de inserir |
| **Modalidade ausente** | Corrida sem modalidade selecionada | Retorna erro de validação |
| **Campos obrigatórios vazios** | Formulário incompleto | Retorna erro de validação |
| **Erro ao inserir no banco** | Constraint violation, conexão, etc | Retorna erro com detalhes |
| **Erro inesperado** | Exceção não tratada | Captura e retorna mensagem genérica |

### Feedback ao Usuário

**Sucesso:**
```tsx
<Card className="bg-green-50">
  ✅ Inscrição confirmada!
  Número: #0123
</Card>
```

**Erro:**
```tsx
<Card className="bg-red-50 border-red-200">
  ❌ Erro ao processar inscrição
  {submitError}
  Por favor, tente novamente...
</Card>
```

**Loading:**
```tsx
<Button disabled={isSubmitting}>
  <Loader2 className="animate-spin" />
  Processando...
</Button>
```

---

## 🧪 Testando a Integração

### 1. Verificar Variáveis de Ambiente

```bash
# Certifique-se de que o .env existe e está configurado
cat .env | grep SUPABASE
```

### 2. Testar Conexão com Supabase

Abra o console do navegador e verifique os logs:

```
✅ [Supabase] Variáveis de ambiente carregadas com sucesso
🔧 [Supabase] URL: https://seu-projeto.supabase.co
✅ [Supabase] Cliente inicializado com sucesso
```

### 3. Fazer uma Inscrição de Teste

1. Acesse `/inscricao`
2. Preencha o formulário completo
3. Clique em "Confirmar Inscrição"
4. Verifique os logs no console:
   - Salvamento no Supabase
   - Envio de WhatsApp (se aplicável)
5. Confirme no Supabase Dashboard que o registro foi criado

### 4. Verificar no Supabase Dashboard

1. Acesse **Table Editor** → `tbcorrida`
2. Verifique se o registro foi inserido
3. Confira os campos:
   - `corrida_id` (auto-incrementado)
   - `nome`, `email`, `whatsapp`, `cpf`
   - `tipo_participacao`, `modalidade`, `tamanho_camiseta`
   - `status` = `'pendente'`
   - `aceitou_regulamento` = `true`

---

## 📊 Funções Disponíveis

### `salvarInscricaoSupabase(formData)`

Salva uma nova inscrição no banco.

**Parâmetros:**
- `formData: FormularioInscricao` - Dados do formulário

**Retorno:**
```typescript
{
  success: boolean
  data?: {
    corrida_id: number
    numeroParticipante: string
  }
  error?: string
  details?: string
}
```

### `buscarInscricaoPorCPF(cpf)`

Busca uma inscrição existente pelo CPF.

**Parâmetros:**
- `cpf: string` - CPF formatado (XXX.XXX.XXX-XX)

**Retorno:**
- `TbCorrida | null` - Dados da inscrição ou null se não encontrado

### `verificarEmailExistente(email)`

Verifica se um email já está cadastrado.

**Parâmetros:**
- `email: string` - Email a verificar

**Retorno:**
- `boolean` - `true` se já existe, `false` caso contrário

---

## 🔐 Segurança

### Row Level Security (RLS)

⚠️ **IMPORTANTE:** Configure políticas RLS no Supabase para proteger os dados.

Exemplo de política para permitir apenas inserção:

```sql
-- Permite que usuários autenticados insiram inscrições
CREATE POLICY "Permitir inserção de inscrições"
ON public.tbcorrida
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permite leitura apenas dos próprios dados
CREATE POLICY "Permitir leitura própria"
ON public.tbcorrida
FOR SELECT
TO authenticated
USING (email = auth.jwt() ->> 'email');
```

### Dados Sensíveis

- **CPF:** Armazenado com máscara (XXX.XXX.XXX-XX)
- **Email:** Convertido para lowercase antes de salvar
- **WhatsApp:** Armazenado com máscara ((XX) XXXXX-XXXX)

---

## 🐛 Troubleshooting

### Problema: "Configuração do Supabase incompleta"

**Causa:** Variáveis de ambiente não configuradas

**Solução:**
1. Verifique se o arquivo `.env` existe na raiz
2. Confirme que `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão definidas
3. Reinicie o servidor de desenvolvimento: `npm run dev`

### Problema: Erro 401 ou 403 ao inserir

**Causa:** Políticas RLS bloqueando inserção

**Solução:**
1. Acesse o Supabase Dashboard
2. Vá em **Authentication** → **Policies**
3. Configure políticas adequadas para a tabela `tbcorrida`

### Problema: Erro "Tipo de participação inválido"

**Causa:** Valor do enum não corresponde ao esperado

**Solução:**
1. Verifique se o valor é exatamente: `'corrida-natal'`, `'apenas-natal'` ou `'retirar-cesta'`
2. Confirme que o enum foi criado corretamente no banco

---

## 📚 Referências

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Schema SQL](../database/schema.sql)
- [Políticas RLS](../database/policies.sql)

---

**Última atualização:** 2025-10-31  
**Versão:** 1.0.0  
**Status:** ✅ Produção

