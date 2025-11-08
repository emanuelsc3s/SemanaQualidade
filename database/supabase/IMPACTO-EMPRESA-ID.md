# Análise de Impacto: Mudança do ID na tabela tbempresa

## 📋 Resumo da Situação

Você alterou o campo ID da tabela `tbempresa` de um nome anterior (provavelmente `id`) para `empresa_id`, mas existem **problemas críticos** que precisam ser corrigidos.

---

## 🚨 Problemas Identificados

### 1. PRIMARY KEY não definida
```sql
CREATE TABLE tbempresa (
    empresa_id SERIAL NOT NULL,  -- ❌ Campo existe mas não é PRIMARY KEY
    codigo TEXT,
    razao_social TEXT,
    nome_fantasia TEXT,
    cnpj TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

**Impacto:** A tabela não tem chave primária definida, o que é uma falha grave de design de banco de dados.

---

### 2. Foreign Keys referenciam `codigo`, não `empresa_id`

**Tabelas afetadas (6 tabelas):**

| Tabela | Foreign Key | Referência Atual | Linha |
|--------|-------------|------------------|-------|
| `tbcargo` | `fk_tbcargo_empresa` | `tbempresa(codigo)` | 246 |
| `tbfuncao` | `fk_tbfuncao_empresa` | `tbempresa(codigo)` | 270 |
| `tblotacao` | `fk_tblotacao_empresa` | `tbempresa(codigo)` | 294 |
| `tbfuncionario` | `fk_tbfuncionario_empresa` | `tbempresa(codigo)` | 390 |
| `tbhistoricocargo` | `fk_tbhistoricocargo_empresa` | `tbempresa(codigo)` | 445 |
| `tbhistoricofuncao` | `fk_tbhistoricofuncao_empresa` | `tbempresa(codigo)` | 479 |

**Exemplo de código atual:**
```sql
CONSTRAINT fk_tbcargo_empresa FOREIGN KEY (emp_codigo)
    REFERENCES tbempresa(codigo) ON DELETE RESTRICT
    --                    ^^^^^^ ❌ Usa 'codigo', não 'empresa_id'
```

**Impacto:** Todas as tabelas filhas usam o campo `codigo` (TEXT) ao invés do `empresa_id` (INTEGER/SERIAL) para relacionamento.

---

## ✅ Soluções Disponíveis

### Opção 1: Mínima Invasiva (RECOMENDADA) ⭐

**Vantagens:**
- ✅ Não quebra relacionamentos existentes
- ✅ Mantém compatibilidade com código legado
- ✅ Rápida aplicação
- ✅ Sem necessidade de migração de dados

**Ações:**
1. Adicionar `PRIMARY KEY` no `empresa_id`
2. Adicionar `UNIQUE` constraint no `codigo` (necessário para foreign keys)
3. Manter foreign keys usando `codigo`
4. Adicionar índices para performance

**Script:** `fix-tbempresa.sql`

**Quando usar:** Se você não se importa que as foreign keys usem `codigo` (TEXT) ao invés de `empresa_id` (INTEGER).

---

### Opção 2: Migração Completa (Mais Invasiva)

**Vantagens:**
- ✅ Padronização total usando `empresa_id`
- ✅ Melhor performance (INTEGER vs TEXT em foreign keys)
- ✅ Design de banco mais moderno
- ✅ Facilita futuras integrações

**Desvantagens:**
- ❌ Migração complexa e demorada
- ❌ Pode quebrar queries existentes
- ❌ Requer atualização de código da aplicação
- ❌ Alto risco se já existem dados

**Ações:**
1. Adicionar `PRIMARY KEY` no `empresa_id`
2. Remover todas as foreign keys antigas
3. Renomear colunas `emp_codigo` → `empresa_id` em todas as tabelas
4. Alterar tipo de `TEXT` → `INTEGER`
5. Recriar foreign keys usando `empresa_id`
6. Atualizar views e funções
7. Migrar dados existentes (se houver)

**Script:** `migration-empresa-id.sql`

**Quando usar:** Se você está no início do projeto sem dados em produção e quer um design mais limpo.

---

## 🎯 Recomendação

### Para este projeto (SemanaQualidade):

**Use a OPÇÃO 1 (fix-tbempresa.sql)** porque:

1. ✅ **O projeto usa dados legados do Firebird** - o campo `codigo` é importante para compatibilidade
2. ✅ **Já existem dados de funcionários** - migração seria complexa
3. ✅ **Funciona perfeitamente** - ter `codigo` como referência não é um problema técnico
4. ✅ **Sem riscos** - não quebra nada existente

---

## 📝 Passo a Passo da Aplicação

### Aplicando a Opção 1 (RECOMENDADA):

```bash
# 1. Conectar ao Supabase ou PostgreSQL
psql -h seu-host -U seu-usuario -d seu-database

# 2. Aplicar o fix
\i /home/emanuel/SemanaQualidade/database/supabase/fix-tbempresa.sql

# 3. Verificar
\d tbempresa
SELECT * FROM pg_constraint WHERE conrelid = 'tbempresa'::regclass;
```

**Resultado esperado:**
- ✅ `empresa_id` terá PRIMARY KEY
- ✅ `codigo` terá UNIQUE constraint
- ✅ `cnpj` terá UNIQUE constraint
- ✅ Foreign keys continuarão funcionando
- ✅ Índices criados para performance

---

## 📊 Estrutura Final (Opção 1)

```sql
CREATE TABLE tbempresa (
    empresa_id SERIAL PRIMARY KEY,           -- ✅ PRIMARY KEY
    codigo TEXT UNIQUE NOT NULL,             -- ✅ UNIQUE (usado em FKs)
    razao_social TEXT,
    nome_fantasia TEXT,
    cnpj TEXT UNIQUE,                        -- ✅ UNIQUE
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Índices
CREATE INDEX idx_tbempresa_codigo ON tbempresa(codigo);
CREATE INDEX idx_tbempresa_ativo ON tbempresa(ativo);

-- Trigger para updated_at
CREATE TRIGGER update_tbempresa_updated_at BEFORE UPDATE ON tbempresa
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔍 Verificações Pós-Aplicação

Execute estas queries para validar:

```sql
-- 1. Verificar PRIMARY KEY
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'tbempresa'::regclass AND contype = 'p';
-- Esperado: pk_tbempresa | p

-- 2. Verificar UNIQUE constraints
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'tbempresa'::regclass AND contype = 'u';
-- Esperado:
-- uk_tbempresa_codigo | u
-- uk_tbempresa_cnpj | u

-- 3. Verificar foreign keys funcionando
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'tbempresa';
-- Esperado: 6 linhas mostrando as tabelas que referenciam tbempresa(codigo)

-- 4. Testar inserção
INSERT INTO tbempresa (codigo, razao_social, cnpj)
VALUES ('001', 'FARMACE S.A.', '12.345.678/0001-99')
RETURNING *;

-- 5. Testar foreign key
SELECT
    f.funcionario_id,
    f.nome,
    e.razao_social
FROM tbfuncionario f
JOIN tbempresa e ON e.codigo = f.emp_codigo
LIMIT 5;
```

---

## 📚 Arquivos Criados

| Arquivo | Descrição | Quando Usar |
|---------|-----------|-------------|
| `fix-tbempresa.sql` | Fix mínimo - adiciona PKs e constraints | ⭐ RECOMENDADO |
| `migration-empresa-id.sql` | Migração completa para empresa_id | Apenas se necessário |
| `IMPACTO-EMPRESA-ID.md` | Este documento | Referência |

---

## ❓ Dúvidas Frequentes

### Por que as FKs usam `codigo` e não `empresa_id`?

**R:** Provavelmente por compatibilidade com o sistema legado do Firebird, onde `codigo` era o identificador usado. Isso é uma prática aceitável chamada "Natural Key" (chave natural).

### É problema não usar `empresa_id` nas FKs?

**R:** Não é um problema técnico. INTEGER (empresa_id) é um pouco mais eficiente que TEXT (codigo), mas a diferença é mínima para o volume de dados esperado neste projeto.

### Quando seria necessária a Opção 2?

**R:** Se:
- Você está começando o projeto do zero sem dados
- Quer um design 100% moderno sem legado
- Performance é crítica (milhões de registros)
- Planeja integrar com sistemas que esperam IDs numéricos

---

## ✅ Conclusão

**Para o projeto SemanaQualidade:**

1. ✅ **Execute o script `fix-tbempresa.sql`**
2. ✅ **Verifique com as queries de validação**
3. ✅ **Continue o desenvolvimento normalmente**

O campo `empresa_id` será a PRIMARY KEY, mas as foreign keys continuarão usando `codigo` para compatibilidade com o legado Firebird. Isso é uma solução válida e funcional.

---

**Data da Análise:** 2025-11-07
**Arquivo Schema:** `/home/emanuel/SemanaQualidade/database/supabase/schema.sql`
**Status:** ⚠️ Aguardando Aplicação do Fix
