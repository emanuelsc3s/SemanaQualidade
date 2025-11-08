# 📁 Índice - Database Supabase PostgreSQL

Scripts e documentação para migração do banco de dados de funcionários FARMACE do Firebird 2.5 para Supabase PostgreSQL 15+.

## 🗂️ Arquivos Disponíveis

### 1. 📘 GUIA_MIGRACAO.md
**Comece por aqui!**
- Guia passo a passo completo de migração
- Instruções para executar no Supabase
- Troubleshooting e validações
- Checklist de verificação

### 2. 🗄️ schema.sql (26KB)
**Script DDL principal**
- Criação de todas as tabelas
- Tabelas auxiliares (estado civil, escolaridade, tipos de admissão, etc.)
- Views (v_funcionarios_completo, v_funcionarios_ativos)
- Funções auxiliares (buscar por CPF, listar por lotação)
- Triggers automáticos (updated_at)
- Índices otimizados
- Políticas RLS (Row Level Security)
- **Execute este arquivo primeiro no Supabase SQL Editor**

### 3. 🔧 migration-helpers.sql (17KB)
**Scripts auxiliares de migração**
- Funções de formatação (CPF, telefone, CEP)
- Tabelas de staging para importação
- Função de migração automática com validações
- Funções para popular municípios
- Scripts de limpeza de dados
- Diagnósticos e validações
- **Execute após o schema.sql**

### 4. 📊 queries-exemplos.sql (14KB)
**Mais de 50 queries prontas para uso**
- Consultas básicas (listar, buscar, filtrar)
- Consultas por cargo/lotação/função
- Análises demográficas (sexo, idade, estado civil)
- Consultas por escolaridade
- Tempo de empresa e aniversariantes
- Relatórios PCD (Pessoa com Deficiência)
- Consultas geográficas
- Histórico de movimentações
- Dashboards e relatórios
- Queries para integração com eventos
- **Use como referência para suas consultas**

### 5. 📖 README.md (8.5KB)
**Documentação completa do schema**
- Estrutura detalhada do banco
- Tabelas e relacionamentos
- Como usar as views e funções
- Exemplos de consultas úteis
- Segurança (RLS)
- Índices e performance
- Diferenças Firebird vs PostgreSQL
- **Consulte para entender o schema**

### 6. 📑 INDEX.md (este arquivo)
**Guia de navegação dos arquivos**

## 🚀 Ordem de Execução Recomendada

```
1. Ler: GUIA_MIGRACAO.md (entender o processo)
2. Ler: README.md (entender a estrutura)
3. Executar: schema.sql (criar tabelas no Supabase)
4. Executar: migration-helpers.sql (carregar funções auxiliares)
5. Seguir: GUIA_MIGRACAO.md (importar dados)
6. Consultar: queries-exemplos.sql (para suas queries)
```

## 📋 Estrutura Criada

### Tabelas Auxiliares (6)
- `estado_civil` - Códigos 01-05
- `escolaridade` - Códigos 01-12 (eSocial)
- `tipo_admissao` - Códigos 10, 20, 35
- `tipo_admissao_esocial` - Códigos 01-07
- `tipo_vinculo` - Códigos diversos

### Tabelas Base (3)
- `emp` - Empresas
- `ufd` - Estados (27 pré-carregados)
- `mun` - Municípios

### Tabelas RH (3)
- `car` - Cargos
- `fun` - Funções
- `lot` - Lotações

### Tabela Principal (1)
- `epg` - Funcionários (55 campos)

### Tabelas de Histórico (2)
- `sep` - Histórico de cargos/lotações
- `rhsep` - Histórico de funções

### Views (2)
- `v_funcionarios_completo` - Todos os funcionários com descrições
- `v_funcionarios_ativos` - Apenas ativos (sem data de rescisão)

### Funções Principais (4)
- `buscar_funcionario_por_cpf()` - Busca por CPF
- `listar_funcionarios_lotacao()` - Lista por lotação
- `migrar_staging_para_epg()` - Migração automatizada
- `diagnostico_tabelas()` - Contagem de registros

## 🎯 Quick Start (5 minutos)

```sql
-- 1. No Supabase SQL Editor, executar schema.sql completo
-- 2. Executar migration-helpers.sql completo
-- 3. Inserir empresa:
INSERT INTO emp (codigo, razao_social, cnpj)
VALUES (1, 'FARMACE', '07.954.905/0001-66');

-- 4. Testar:
SELECT * FROM diagnostico_tabelas();
SELECT * FROM v_funcionarios_ativos LIMIT 10;
```

## 📊 Estatísticas

- **Total de arquivos:** 6
- **Tamanho total:** ~92KB
- **Linhas de código SQL:** ~2.500+
- **Tabelas criadas:** 16
- **Views criadas:** 3
- **Funções criadas:** 10+
- **Índices criados:** 25+

## 🔍 Busca Rápida

**Procurando como...?**

- Criar as tabelas → `schema.sql`
- Importar dados CSV → `GUIA_MIGRACAO.md` (Etapa 4)
- Buscar funcionário → `queries-exemplos.sql` (Seção 1)
- Ver estrutura do banco → `README.md`
- Formatar CPF/telefone → `migration-helpers.sql` (Seção 1)
- Listar aniversariantes → `queries-exemplos.sql` (Seção 9)
- Configurar RLS → `schema.sql` (Seção 8) ou `GUIA_MIGRACAO.md` (Etapa 7)
- Ver exemplos de INSERT → `migration-helpers.sql` (Seção 7)

## ✅ Checklist de Migração

- [ ] Lei GUIA_MIGRACAO.md completo
- [ ] Criei projeto no Supabase
- [ ] Executei schema.sql
- [ ] Executei migration-helpers.sql
- [ ] Importei empresas
- [ ] Importei municípios
- [ ] Importei cargos/funções/lotações
- [ ] Importei funcionários
- [ ] Importei históricos
- [ ] Validei dados (v_validacao_migracao)
- [ ] Testei queries principais
- [ ] Configurei RLS
- [ ] Limpei staging

## 🆘 Precisa de Ajuda?

1. **Erro na execução?** → Ver troubleshooting em `GUIA_MIGRACAO.md`
2. **Dúvida sobre tabela?** → Ver `README.md`
3. **Como fazer uma query?** → Ver `queries-exemplos.sql`
4. **Problema na migração?** → Ver `migration-helpers.sql` (Seção 4 - Validações)

## 📞 Suporte

- **Documentação Supabase:** https://supabase.com/docs
- **PostgreSQL:** https://www.postgresql.org/docs/15/
- **SQL Tutorial:** https://www.postgresqltutorial.com/

---

**Projeto:** Sistema de Funcionários FARMACE
**Versão:** 1.0.0
**Data:** 2025-11-07
**Tecnologia:** PostgreSQL 15+ (Supabase)
**Origem:** Firebird 2.5
