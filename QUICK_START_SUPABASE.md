# 🚀 Quick Start - Integração Supabase

## ⚡ Setup Rápido (5 minutos)

### 1. Obter Credenciais do Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto **APFAR**
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** (exemplo: `https://dojavjvqvobnumebaouc.supabase.co`)
   - **anon/public key** (chave longa começando com `eyJ...`)

### 2. Configurar Variáveis de Ambiente

Crie/edite o arquivo `.env` na raiz do projeto:

```bash
# Copie o template
cp .env.example .env

# Edite o arquivo
nano .env
```

Adicione suas credenciais:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://dojavjvqvobnumebaouc.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
```

### 3. Verificar Tabela no Banco

A tabela `tbcorrida` já deve estar criada no Supabase. Verifique:

1. Acesse **Table Editor** no Supabase Dashboard
2. Procure pela tabela `tbcorrida`
3. Confirme que ela existe

✅ Se a tabela existe, pule para o passo 4.

❌ Se a tabela NÃO existe, execute o script SQL:

1. Vá em **SQL Editor** no Supabase
2. Copie o conteúdo de `database/schema.sql`
3. Execute o script

### 4. Iniciar o Servidor

```bash
npm run dev
```

### 5. Testar

1. Abra o navegador em `http://localhost:5173`
2. Abra o Console (F12)
3. Verifique os logs:
   ```
   ✅ [Supabase] Variáveis de ambiente carregadas com sucesso
   ✅ [Supabase] Cliente inicializado com sucesso
   ```

4. Acesse `/inscricao`
5. Preencha o formulário
6. Clique em "Confirmar Inscrição"
7. Verifique no Supabase Dashboard se o registro foi criado

---

## 🎯 Teste Rápido

### Dados de Teste

Use estes dados para fazer uma inscrição de teste:

```
Tipo de Participação: Corrida + Natal
Modalidade: 5km

Nome: João da Silva Teste
Email: joao.teste@farmace.com.br
Telefone: (85) 98765-4321
CPF: 123.456.789-00
Data de Nascimento: 01/01/1990
CEP: 60000-000
Endereço: Rua Teste, 123
Cidade: Fortaleza
Estado: CE

Tamanho da Camiseta: M
```

### Verificar Resultado

1. **Console do navegador:**
   ```
   ✅ [Inscrição Supabase] Inscrição salva com sucesso!
   🎫 [Inscrição Supabase] Número do participante: 0001
   ```

2. **Tela de confirmação:**
   - Número do participante: #0001
   - Valor: R$ 35,00
   - Confirmação WhatsApp enviado

3. **Supabase Dashboard:**
   - Tabela `tbcorrida` tem 1 registro
   - `nome` = "João da Silva Teste"
   - `tipo_participacao` = "corrida-natal"
   - `status` = "pendente"

---

## ❌ Troubleshooting Rápido

### Erro: "Configuração do Supabase incompleta"

**Solução:**
```bash
# 1. Verifique se o .env existe
ls -la .env

# 2. Verifique o conteúdo
cat .env | grep SUPABASE

# 3. Reinicie o servidor
# Ctrl+C para parar
npm run dev
```

### Erro: "Failed to fetch" ou erro 401/403

**Solução:**
1. Verifique se a URL do Supabase está correta
2. Verifique se a `anon key` está correta
3. Verifique se a tabela `tbcorrida` existe
4. Configure políticas RLS (veja abaixo)

### Configurar Políticas RLS (se necessário)

Execute no **SQL Editor** do Supabase:

```sql
-- Habilita RLS na tabela
ALTER TABLE public.tbcorrida ENABLE ROW LEVEL SECURITY;

-- Permite inserção para todos (temporário para testes)
CREATE POLICY "Permitir inserção pública"
ON public.tbcorrida
FOR INSERT
TO public
WITH CHECK (true);

-- Permite leitura para todos (temporário para testes)
CREATE POLICY "Permitir leitura pública"
ON public.tbcorrida
FOR SELECT
TO public
USING (true);
```

⚠️ **ATENÇÃO:** Estas políticas são permissivas para facilitar testes. Em produção, configure políticas mais restritivas!

---

## 📚 Documentação Completa

Para mais detalhes, consulte:

- 📖 [docs/SUPABASE_INTEGRATION.md](docs/SUPABASE_INTEGRATION.md) - Documentação completa
- ✅ [docs/CHECKLIST_SUPABASE.md](docs/CHECKLIST_SUPABASE.md) - Checklist de verificação
- 📋 [SUPABASE_IMPLEMENTATION_SUMMARY.md](SUPABASE_IMPLEMENTATION_SUMMARY.md) - Resumo da implementação

---

## 🎉 Pronto!

Se tudo funcionou, você está pronto para receber inscrições reais! 🚀

**Próximos passos:**
1. Testar com dados reais
2. Configurar políticas RLS adequadas
3. Fazer deploy em produção
4. Monitorar logs e erros

---

**Dúvidas?** Consulte a documentação completa ou os logs de debug no console.

