# Schema PostgreSQL - Sistema de Funcionários FARMACE

Este diretório contém o schema do banco de dados PostgreSQL 15+ para o sistema de gestão de funcionários da FARMACE, migrado do Firebird 2.5.

## 📁 Arquivos

- **schema.sql** - Script DDL completo para criação do banco de dados

## 🗄️ Estrutura do Banco de Dados

### Tabelas Auxiliares (Domínios)

Tabelas de referência com códigos padronizados (não utilizam ENUMs conforme solicitado):

- **estado_civil** - Códigos de estado civil (01-05)
- **escolaridade** - Graus de instrução conforme eSocial S-2200 (01-12)
- **tipo_admissao** - Tipos de admissão (10, 20, 35)
- **tipo_admissao_esocial** - Tipos de admissão eSocial (01-07)
- **tipo_vinculo** - Tipos de vínculo empregatício (10-90)

### Tabelas Base

- **emp** - Empresas do grupo
- **ufd** - Unidades Federativas (Estados) com dados pré-carregados
- **mun** - Municípios brasileiros

### Tabelas de RH

- **car** - Cargos
- **fun** - Funções
- **lot** - Lotações/Departamentos

### Tabela Principal

- **epg** - Funcionários (Empregados)
  - Dados pessoais completos
  - Documentação (CPF, RG, CTPS, Título)
  - Endereço
  - Informações de admissão e rescisão
  - Dados de PCD (Pessoa com Deficiência)
  - Escolaridade

### Tabelas de Histórico

- **sep** - Histórico de cargos e lotações
- **rhsep** - Histórico de funções

### Views

- **v_funcionarios_completo** - View completa replicando a query original do Firebird
- **v_funcionarios_ativos** - Apenas funcionários sem data de rescisão

## 🚀 Como Usar

### 1. Executar no Supabase SQL Editor

```bash
# Copiar o conteúdo de schema.sql e executar no SQL Editor do Supabase
```

Ou via linha de comando (se tiver psql configurado):

```bash
psql -h [seu-projeto].supabase.co \
     -p 5432 \
     -d postgres \
     -U postgres \
     -f schema.sql
```

### 2. Ordem de Execução

O script já está ordenado corretamente:

1. ✅ Extensões (uuid-ossp, pg_trgm)
2. ✅ Tabelas auxiliares com dados pré-carregados
3. ✅ Tabelas base (emp, ufd, mun)
4. ✅ Tabelas de RH (car, fun, lot)
5. ✅ Tabela principal (epg)
6. ✅ Tabelas de histórico (sep, rhsep)
7. ✅ Views
8. ✅ Triggers
9. ✅ Políticas RLS (Row Level Security)
10. ✅ Funções auxiliares

### 3. Dados Pré-carregados

O script já inclui dados padrão para:

- ✅ 27 Estados (UFs) brasileiros
- ✅ 5 Estados Civis
- ✅ 12 Níveis de Escolaridade
- ✅ 3 Tipos de Admissão
- ✅ 7 Tipos de Admissão eSocial
- ✅ 16 Tipos de Vínculo Empregatício

**Você precisará carregar:**
- Municípios (tabela `mun`) - Via script de migração ou API do IBGE
- Empresas (tabela `emp`)
- Cargos, Funções e Lotações conforme sua estrutura

## 🔍 Consultas Úteis

### Buscar Funcionário por CPF

```sql
SELECT * FROM buscar_funcionario_por_cpf('123.456.789-00');
```

### Listar Funcionários Ativos

```sql
SELECT * FROM v_funcionarios_ativos
ORDER BY nome;
```

### Listar Funcionários de uma Lotação

```sql
SELECT * FROM listar_funcionarios_lotacao(1, 10);
-- Parâmetros: emp_codigo, lot_codigo
```

### Funcionários com Deficiência

```sql
SELECT matricula, nome, cargo, lotacao
FROM v_funcionarios_ativos
WHERE temdeficiencia = true;
```

### Funcionários Admitidos em 2024

```sql
SELECT matricula, nome, cargo, admissaodata
FROM v_funcionarios_ativos
WHERE EXTRACT(YEAR FROM admissaodata) = 2024
ORDER BY admissaodata DESC;
```

### Histórico Completo de um Funcionário

```sql
-- Histórico de cargos/lotações
SELECT s.data, c.nome as cargo, l.nome as lotacao, s.observacao
FROM sep s
JOIN car c ON c.emp_codigo = s.emp_codigo AND c.codigo = s.car_codigo
LEFT JOIN lot l ON l.emp_codigo = s.emp_codigo AND l.codigo = s.lot_codigo
WHERE s.emp_codigo = 1 AND s.epg_codigo = 12345
ORDER BY s.data DESC;

-- Histórico de funções
SELECT r.data, f.nome as funcao, r.observacao
FROM rhsep r
JOIN fun f ON f.emp_codigo = r.emp_codigo AND f.codigo = r.fun_codigo
WHERE r.emp_codigo = 1 AND r.epg_codigo = 12345
ORDER BY r.data DESC;
```

## 🔐 Segurança (RLS)

O script inclui políticas de Row Level Security (RLS) básicas:

- ✅ Tabelas sensíveis com RLS habilitado
- ✅ Leitura permitida para usuários autenticados
- ✅ Modificações apenas para role 'admin'

**Ajuste as políticas conforme sua necessidade:**

```sql
-- Exemplo: Permitir que funcionário veja apenas seus próprios dados
CREATE POLICY "Funcionário vê apenas seus dados"
    ON epg FOR SELECT
    TO authenticated
    USING (cpf = auth.jwt() ->> 'cpf');
```

## 📊 Índices e Performance

O schema inclui diversos índices otimizados:

- **Full-text search** (GIN) para nomes de funcionários, cargos, funções
- **Índices compostos** para consultas frequentes
- **Índices de datas** em ordem descendente para históricos
- **Índices únicos** para CPF e documentos

## 🔄 Triggers Automáticos

Todas as tabelas possuem trigger para atualizar automaticamente o campo `updated_at`:

```sql
-- Executado automaticamente em UPDATE
NEW.updated_at = NOW();
```

## 📝 Validações

O schema inclui validações automáticas:

- ✅ CPF no formato: `999.999.999-99`
- ✅ Email válido (regex)
- ✅ Sexo: apenas 'M' ou 'F'
- ✅ Foreign keys para integridade referencial
- ✅ Campos obrigatórios (NOT NULL)

## 🔀 Diferenças em relação ao Firebird

| Aspecto | Firebird 2.5 | PostgreSQL 15+ |
|---------|-------------|----------------|
| Auto-increment | GENERATOR + TRIGGER | SERIAL / UUID |
| String concat | \|\| | \|\| (igual) |
| FIRST N | SELECT FIRST 1 | LIMIT 1 |
| Comentários | COMMENT ON | COMMENT ON (igual) |
| Full-text | Extensões | pg_trgm (incluído) |
| UUIDs | VARCHAR | UUID (nativo) |
| Triggers | BEFORE/AFTER | BEFORE/AFTER (igual) |

## 🆕 Recursos Adicionais do PostgreSQL

O schema aproveita recursos exclusivos do PostgreSQL:

- **UUID nativo** para chaves primárias em históricos
- **pg_trgm** para busca fuzzy e full-text
- **Row Level Security** para segurança granular
- **JSON operators** para parsing de JWT no RLS
- **CHECK constraints** avançados com regex
- **Triggers com RETURNS TRIGGER** mais simples

## 📦 Migração de Dados

Para migrar dados do Firebird para PostgreSQL:

### Opção 1: Export/Import CSV

```bash
# No Firebird
isql -user SYSDBA -password masterkey database.fdb
SQL> OUTPUT funcionarios.csv;
SQL> SELECT * FROM EPG;

# No PostgreSQL
psql -d sua_database
\COPY epg FROM 'funcionarios.csv' WITH CSV HEADER;
```

### Opção 2: Script Python

```python
# Usar bibliotecas fdb (Firebird) e psycopg2 (PostgreSQL)
# para migração programática com transformações
```

### Opção 3: Ferramentas

- **pgLoader** - Migração automatizada
- **Flyway** - Versionamento de schema
- **Liquibase** - Change management

## 🧪 Testes

Após executar o script:

```sql
-- 1. Verificar tabelas criadas
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- 2. Verificar views
SELECT viewname FROM pg_views WHERE schemaname = 'public';

-- 3. Verificar funções
SELECT proname FROM pg_proc WHERE pronamespace = (
    SELECT oid FROM pg_namespace WHERE nspname = 'public'
);

-- 4. Verificar índices
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';

-- 5. Verificar foreign keys
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE contype = 'f';
```

## 🐛 Troubleshooting

### Erro: Extension não encontrada

```sql
-- Executar como superuser
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### Erro: RLS bloqueando queries

```sql
-- Temporariamente desabilitar RLS para testes
ALTER TABLE epg DISABLE ROW LEVEL SECURITY;
```

### Erro: Políticas conflitantes

```sql
-- Limpar políticas existentes
DROP POLICY IF EXISTS "nome_da_policy" ON tabela;
```

## 📞 Suporte

Para dúvidas sobre o schema:

1. Consultar comentários no código SQL (`COMMENT ON`)
2. Verificar views para exemplos de queries
3. Testar funções auxiliares fornecidas

## 🎯 Próximos Passos

Após executar o schema:

1. [ ] Carregar dados de municípios (API IBGE ou CSV)
2. [ ] Inserir empresas na tabela `emp`
3. [ ] Cadastrar cargos, funções e lotações
4. [ ] Migrar dados de funcionários do Firebird
5. [ ] Ajustar políticas RLS conforme regras de negócio
6. [ ] Configurar backups automáticos no Supabase
7. [ ] Implementar API REST via Supabase Client

## 📄 Licença

Script desenvolvido para uso interno da FARMACE.

---

**Versão:** 1.0.0
**Data:** 2025-11-07
**Compatível com:** PostgreSQL 15+, Supabase
**Migrado de:** Firebird 2.5
