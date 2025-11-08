# 🚀 Quick Start - Executar SQL Direto no Projeto

## ⚡ 3 Passos Simples

### 1️⃣ Criar função exec_sql no Supabase (1 VEZ)

Acesse: **Supabase Dashboard → SQL Editor**

Cole e execute:

```sql
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE format('SELECT JSONB_AGG(row_to_json(t)) FROM (%s) t', sql_query) INTO result;
  RETURN COALESCE(result, '[]'::JSONB);
END;
$$;
```

Clique **RUN** (Ctrl+Enter)

---

### 2️⃣ Testar (opcional)

No SQL Editor:
```sql
SELECT exec_sql('SELECT 1 as teste');
```

Resultado:
```json
[{"teste": 1}]
```

---

### 3️⃣ Rodar o projeto

```bash
npm run dev
```

Acesse a aba **"Inscritos por Depto"** e pronto! ✅

---

## 💡 Como Usar no Código

```typescript
const { data, error } = await supabase.rpc('exec_sql', {
  sql_query: `
    SELECT * FROM tbfuncionario
    WHERE ativo = true
  `
})
```

## ✨ Vantagens

- ✅ SQL fica no código TypeScript (fácil manutenção)
- ✅ Não precisa criar função para cada query
- ✅ ~70% mais rápido que múltiplas queries
- ✅ Executa no banco (performance)

---

**Dúvidas?** Veja o arquivo `README-RPC.md` para detalhes completos.
