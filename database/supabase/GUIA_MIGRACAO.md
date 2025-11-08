# 🚀 Guia Rápido de Migração - Firebird para Supabase PostgreSQL

Este guia fornece um passo a passo completo para migrar o banco de dados de funcionários do Firebird 2.5 para Supabase PostgreSQL 15+.

## 📋 Pré-requisitos

- ✅ Conta no Supabase (https://supabase.com)
- ✅ Projeto Supabase criado
- ✅ Acesso ao banco Firebird original
- ✅ (Opcional) Cliente psql instalado para linha de comando

## 🗂️ Arquivos Disponíveis

| Arquivo | Descrição |
|---------|-----------|
| `schema.sql` | Script DDL completo - criação de todas as tabelas, views, funções e índices |
| `migration-helpers.sql` | Funções auxiliares para migração e limpeza de dados |
| `queries-exemplos.sql` | Mais de 50 queries de exemplo para consultas diversas |
| `README.md` | Documentação completa do schema |

## 🎯 Processo de Migração

### ETAPA 1: Criar Schema no Supabase

#### Opção A: Via SQL Editor (Recomendado)

1. Acesse seu projeto no Supabase
2. Vá em **SQL Editor** no menu lateral
3. Clique em **New Query**
4. Copie e cole o conteúdo completo de `schema.sql`
5. Clique em **Run** ou pressione `Ctrl+Enter`
6. Aguarde a execução (pode levar 10-30 segundos)

✅ **Resultado esperado:** Mensagem de sucesso sem erros

#### Opção B: Via psql (Linha de Comando)

```bash
# Obter credenciais em: Project Settings > Database > Connection String

psql "postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJETO].supabase.co:5432/postgres" \
     -f schema.sql
```

### ETAPA 2: Carregar Helpers de Migração

Após o schema estar criado:

```sql
-- No SQL Editor do Supabase, executar:
-- (Copiar e colar conteúdo de migration-helpers.sql)
```

### ETAPA 3: Exportar Dados do Firebird

#### 3.1 Exportar para CSV

**Via isql (Firebird):**

```bash
isql -user SYSDBA -password masterkey seu_banco.fdb

# Exportar funcionários
SQL> OUTPUT funcionarios.csv;
SQL> SELECT * FROM EPG;
SQL> OUTPUT;

# Exportar cargos
SQL> OUTPUT cargos.csv;
SQL> SELECT * FROM CAR;
SQL> OUTPUT;

# Exportar lotações
SQL> OUTPUT lotacoes.csv;
SQL> SELECT * FROM LOT;
SQL> OUTPUT;

# Exportar funções
SQL> OUTPUT funcoes.csv;
SQL> SELECT * FROM FUN;
SQL> OUTPUT;

# Exportar histórico de cargos
SQL> OUTPUT sep.csv;
SQL> SELECT * FROM SEP;
SQL> OUTPUT;

# Exportar histórico de funções
SQL> OUTPUT rhsep.csv;
SQL> SELECT * FROM RHSEP;
SQL> OUTPUT;
```

#### 3.2 Exportar Municípios

Se você já tem uma tabela MUN populada no Firebird:

```sql
OUTPUT municipios.csv;
SELECT * FROM MUN;
OUTPUT;
```

### ETAPA 4: Importar Dados para Supabase

#### 4.1 Importar Empresas

```sql
-- Manualmente via SQL Editor
INSERT INTO emp (codigo, razao_social, nome_fantasia, cnpj)
VALUES (1, 'FARMACE INDÚSTRIA QUÍMICA FARMACÊUTICA CEARENSE LTDA', 'FARMACE', '07.954.905/0001-66');
```

#### 4.2 Importar Municípios

**Via psql:**

```bash
psql "postgresql://..." -c "\COPY staging_municipios FROM 'municipios.csv' WITH (FORMAT CSV, HEADER TRUE, DELIMITER ',', ENCODING 'UTF8');"

# Migrar staging para tabela final
psql "postgresql://..." -c "SELECT * FROM migrar_municipios_staging();"
```

**Via SQL Editor (dados pequenos):**

```sql
-- Importar manualmente alguns municípios principais
SELECT inserir_municipio('CE', 1, 'Fortaleza', '2304400');
SELECT inserir_municipio('SP', 1, 'São Paulo', '3550308');
-- etc...
```

#### 4.3 Importar Cargos, Funções e Lotações

**Via psql:**

```bash
# Cargos
\COPY car FROM 'cargos.csv' WITH (FORMAT CSV, HEADER TRUE, DELIMITER ',', ENCODING 'UTF8', NULL '');

# Funções
\COPY fun FROM 'funcoes.csv' WITH (FORMAT CSV, HEADER TRUE, DELIMITER ',', ENCODING 'UTF8', NULL '');

# Lotações
\COPY lot FROM 'lotacoes.csv' WITH (FORMAT CSV, HEADER TRUE, DELIMITER ',', ENCODING 'UTF8', NULL '');
```

**Via SQL Editor (manualmente para dados pequenos):**

```sql
-- Exemplo de inserção manual
INSERT INTO car (emp_codigo, codigo, nome, cbo) VALUES
(1, 1, 'ANALISTA DE QUALIDADE', '2031-05'),
(1, 2, 'FARMACÊUTICO', '2234-05');
```

#### 4.4 Importar Funcionários (EPG)

**Método Recomendado: Via Staging**

```bash
# 1. Importar para staging (permite limpeza e formatação)
psql "postgresql://..." -c "\COPY staging_epg FROM 'funcionarios.csv' WITH (FORMAT CSV, HEADER TRUE, DELIMITER ',', ENCODING 'UTF8', NULL '');"

# 2. Migrar de staging para EPG (com formatações automáticas)
psql "postgresql://..." -c "SELECT * FROM migrar_staging_para_epg();"
```

A função `migrar_staging_para_epg()` automaticamente:
- ✅ Formata CPF (999.999.999-99)
- ✅ Formata telefones ((99) 99999-9999)
- ✅ Formata CEP (99999-999)
- ✅ Normaliza códigos (01, 02, etc.)
- ✅ Converte booleanos (T/F, S/N, 1/0 → true/false)
- ✅ Limpa strings vazias para NULL
- ✅ Trata erros individualmente

#### 4.5 Importar Históricos

```bash
# Histórico de cargos (SEP)
psql "postgresql://..." -c "\COPY sep(emp_codigo, epg_codigo, car_codigo, lot_codigo, data, observacao) FROM 'sep.csv' WITH (FORMAT CSV, HEADER TRUE, DELIMITER ',', ENCODING 'UTF8', NULL '');"

# Histórico de funções (RHSEP)
psql "postgresql://..." -c "\COPY rhsep(emp_codigo, epg_codigo, fun_codigo, data, observacao) FROM 'rhsep.csv' WITH (FORMAT CSV, HEADER TRUE, DELIMITER ',', ENCODING 'UTF8', NULL '');"
```

### ETAPA 5: Validações Pós-Migração

Execute as seguintes queries para validar:

```sql
-- 1. Verificar tabelas populadas
SELECT * FROM diagnostico_tabelas();

-- 2. Verificar erros de validação
SELECT * FROM v_validacao_migracao;

-- 3. Contar funcionários ativos
SELECT COUNT(*) FROM v_funcionarios_ativos;

-- 4. Verificar duplicatas de CPF
SELECT cpf, COUNT(*) as quantidade
FROM epg
GROUP BY cpf
HAVING COUNT(*) > 1;

-- 5. Verificar funcionários sem cargo
SELECT COUNT(*)
FROM v_funcionarios_ativos
WHERE cargo IS NULL;
```

### ETAPA 6: Testes Funcionais

Testar queries principais:

```sql
-- Buscar por CPF
SELECT * FROM buscar_funcionario_por_cpf('123.456.789-00');

-- Listar ativos
SELECT * FROM v_funcionarios_ativos LIMIT 10;

-- Aniversariantes do mês
SELECT matricula, nome, cargo
FROM v_funcionarios_ativos
WHERE EXTRACT(MONTH FROM dtnascimento) = EXTRACT(MONTH FROM CURRENT_DATE);
```

### ETAPA 7: Ajustar Políticas RLS

Configure políticas de segurança conforme sua necessidade:

```sql
-- Exemplo: Permitir que RH veja todos os dados
CREATE POLICY "RH vê todos funcionários"
    ON epg FOR SELECT
    TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'rh' OR
        auth.jwt() ->> 'role' = 'admin'
    );

-- Exemplo: Funcionário vê apenas seus dados
CREATE POLICY "Funcionário vê seus dados"
    ON epg FOR SELECT
    TO authenticated
    USING (cpf = auth.jwt() ->> 'cpf');
```

### ETAPA 8: Limpar Dados Temporários

Após validar que tudo está correto:

```sql
-- Limpar tabelas de staging
SELECT limpar_staging();

-- Ou manualmente:
DROP TABLE IF EXISTS staging_epg;
DROP TABLE IF EXISTS staging_municipios;
```

## 🔧 Troubleshooting

### Erro: "permission denied for schema public"

**Solução:**
```sql
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
```

### Erro: "violates foreign key constraint"

**Solução:** Certifique-se de importar na ordem correta:
1. EMP (empresas)
2. UFD (estados) - já vem pré-carregado
3. MUN (municípios)
4. CAR, FUN, LOT (cargos, funções, lotações)
5. EPG (funcionários)
6. SEP, RHSEP (históricos)

### Erro: "invalid input syntax for type boolean"

**Solução:** Use a tabela staging e a função `migrar_staging_para_epg()` que converte automaticamente.

### Muitos erros de validação após migração

**Solução:**
```sql
-- Ver erros específicos
SELECT * FROM v_validacao_migracao;

-- Corrigir manualmente via UPDATE
UPDATE epg
SET cpf = formatar_cpf(cpf)
WHERE cpf IS NOT NULL;
```

## 📊 Verificação Final

Checklist de validação completa:

- [ ] Todas as tabelas criadas (`\dt` no psql)
- [ ] Views criadas (`\dv`)
- [ ] Funções criadas (`\df`)
- [ ] Índices criados (`\di`)
- [ ] Dados de funcionários importados
- [ ] Dados de cargos/funções/lotações importados
- [ ] Históricos importados
- [ ] Nenhum erro em `v_validacao_migracao`
- [ ] View `v_funcionarios_ativos` retorna dados
- [ ] Função `buscar_funcionario_por_cpf` funciona
- [ ] RLS configurado
- [ ] Políticas de acesso testadas

## 🎉 Migração Concluída!

Após completar todas as etapas, seu banco PostgreSQL no Supabase estará pronto para uso.

## 📞 Próximos Passos

1. **Conectar com Frontend:**
   ```typescript
   import { createClient } from '@supabase/supabase-js'

   const supabase = createClient(
     'https://seu-projeto.supabase.co',
     'sua-anon-key'
   )

   // Buscar funcionários
   const { data } = await supabase
     .from('v_funcionarios_ativos')
     .select('*')
     .limit(10)
   ```

2. **Configurar Backups Automáticos:**
   - Project Settings > Database > Backups

3. **Configurar Alertas:**
   - Configurar alertas de uso de recursos

4. **Otimizar Performance:**
   - Monitorar queries lentas no Dashboard
   - Adicionar índices se necessário

## 📚 Recursos Adicionais

- **Documentação Supabase:** https://supabase.com/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs/15/
- **Queries de Exemplo:** Ver `queries-exemplos.sql`

---

**Versão:** 1.0.0
**Data:** 2025-11-07
**Migração:** Firebird 2.5 → PostgreSQL 15+ (Supabase)
