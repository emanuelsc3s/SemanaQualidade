# Database Schema - II Corrida da Qualidade FARMACE

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Estrutura de Arquivos](#estrutura-de-arquivos)
- [Diagrama ER](#diagrama-er)
- [Tabelas](#tabelas)
- [Relacionamentos](#relacionamentos)
- [Enums](#enums)
- [Views](#views)
- [Triggers e Functions](#triggers-e-functions)
- [Row Level Security (RLS)](#row-level-security-rls)
- [Setup no Supabase](#setup-no-supabase)
- [Migrations](#migrations)
- [Queries Úteis](#queries-úteis)
- [Considerações de Segurança](#considerações-de-segurança)

---

## 🎯 Visão Geral

Este schema SQL foi projetado para o sistema de inscrições da **II Corrida e Caminhada da Qualidade FARMACE 2025**. O banco de dados utiliza **PostgreSQL** através do **Supabase** e implementa as melhores práticas de segurança, performance e auditoria.

### Características Principais

- ✅ **Normalização**: Schema normalizado para evitar redundância
- ✅ **Segurança**: Row Level Security (RLS) do Supabase
- ✅ **Auditoria**: Histórico completo de mudanças
- ✅ **Performance**: Índices estratégicos
- ✅ **LGPD**: Conformidade com proteção de dados
- ✅ **Soft Delete**: Exclusão lógica com `deleted_at`
- ✅ **Validações**: Constraints no banco de dados
- ✅ **Escalabilidade**: Preparado para crescimento

---

## 📁 Estrutura de Arquivos

```
database/
├── README.md                                      # Esta documentação
├── FIREBIRD_TO_SUPABASE_MAPPING.md               # 🔥 Mapeamento Firebird → PostgreSQL
├── schema.sql                                     # DDL completo (estrutura do banco)
├── policies.sql                                   # Row Level Security (RLS)
├── seed.sql                                       # Dados iniciais (modalidades, tamanhos)
├── queries.sql                                    # Consultas úteis e relatórios
└── migrations/
    ├── 001_initial_schema.sql                     # Migration: estrutura inicial
    ├── 002_add_rls_policies.sql                   # Migration: políticas RLS
    ├── 003_expand_colaboradores_from_firebird.sql # 🔥 Migration: campos do Firebird
    └── colaboradores.sql                          # Query original Firebird (referência)
```

### Descrição dos Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `schema.sql` | Cria toda a estrutura: tabelas, enums, índices, triggers, views |
| `policies.sql` | Define políticas de segurança RLS para controle de acesso |
| `seed.sql` | Popula dados iniciais (modalidades 3km/5km/10km, tamanhos P-EXG) |
| `queries.sql` | Consultas SQL prontas para uso (relatórios, estatísticas, etc) |
| `migrations/` | Versionamento do schema para deploy incremental |
| `FIREBIRD_TO_SUPABASE_MAPPING.md` | **🔥 Documentação completa da migração Firebird → Supabase** |
| `migrations/colaboradores.sql` | Query original do Firebird 2.5 (EPG) - referência |
| `migrations/003_expand_colaboradores_from_firebird.sql` | **🔥 Adiciona +50 campos extras à tabela colaboradores** |

---

## 🗺️ Diagrama ER

```
┌─────────────────────┐
│   colaboradores     │
│─────────────────────│
│ id (PK)             │
│ nome                │
│ email (UNIQUE)      │
│ cpf (UNIQUE)        │◄───┐
│ data_nascimento     │    │
│ whatsapp            │    │
│ ativo               │    │
│ created_at          │    │
│ updated_at          │    │
│ deleted_at          │    │
└─────────────────────┘    │
                           │
                           │ 1:1
                           │
┌─────────────────────┐    │
│    inscricoes       │    │
│─────────────────────│    │
│ id (PK)             │    │
│ colaborador_id (FK) │────┘
│ numero_participante │ (UNIQUE)
│ email               │
│ whatsapp            │
│ tipo_participacao   │ (ENUM)
│ modalidade_id (FK)  │────┐
│ tamanho_camis... (FK)│───┼──┐
│ aceitou_regulamento │    │  │
│ status              │    │  │
│ kit_retirado        │    │  │
│ data_inscricao      │    │  │
│ deleted_at          │    │  │
└─────────────────────┘    │  │
         │                 │  │
         │ 1:N             │  │
         │                 │  │
         ▼                 │  │
┌─────────────────────┐    │  │
│ historico_inscricoes│    │  │
│─────────────────────│    │  │
│ id (PK)             │    │  │
│ inscricao_id (FK)   │    │  │
│ campo_alterado      │    │  │
│ valor_anterior      │    │  │
│ valor_novo          │    │  │
│ alterado_por        │    │  │
│ created_at          │    │  │
└─────────────────────┘    │  │
                           │  │
         ┌─────────────────┘  │
         │ N:1                │ N:1
         ▼                    ▼
┌─────────────────────┐ ┌─────────────────────┐
│    modalidades      │ │ tamanhos_camiseta   │
│─────────────────────│ │─────────────────────│
│ id (PK)             │ │ id (PK)             │
│ codigo (UNIQUE)     │ │ codigo (UNIQUE)     │
│ nome                │ │ nome                │
│ distancia_km        │ │ altura_cm           │
│ idade_minima        │ │ largura_cm          │
│ premiacao           │ │ ativo               │
│ ativo               │ │ ordem_exibicao      │
└─────────────────────┘ └─────────────────────┘
```

---

## 📊 Tabelas

### 1. `colaboradores`

Armazena os dados dos **funcionários da FARMACE** autorizados a se inscrever no evento.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Identificador único |
| `nome` | VARCHAR(255) | NOT NULL | Nome completo |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Email corporativo |
| `cpf` | VARCHAR(14) | NOT NULL, UNIQUE | CPF (XXX.XXX.XXX-XX) |
| `data_nascimento` | DATE | NOT NULL | Data de nascimento |
| `whatsapp` | VARCHAR(15) | NULLABLE | WhatsApp (opcional) |
| `ativo` | BOOLEAN | NOT NULL, DEFAULT true | Colaborador ativo |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Última atualização |
| `deleted_at` | TIMESTAMPTZ | NULLABLE | Soft delete |

**Constraints:**
- `cpf_valido`: Valida formato XXX.XXX.XXX-XX
- `email_valido`: Valida formato de email

**Índices:**
- `idx_colaboradores_email` em `email`
- `idx_colaboradores_cpf` em `cpf`
- `idx_colaboradores_ativo` em `ativo WHERE ativo = true`
- `idx_colaboradores_deleted` em `deleted_at WHERE deleted_at IS NULL`

---

### 2. `modalidades`

Modalidades de corrida disponíveis no evento.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK | Identificador único |
| `codigo` | VARCHAR(10) | NOT NULL, UNIQUE | Código ('3km', '5km', '10km') |
| `nome` | VARCHAR(100) | NOT NULL | Nome da modalidade |
| `descricao` | TEXT | NULLABLE | Descrição detalhada |
| `distancia_km` | NUMERIC(5,2) | NOT NULL | Distância em km |
| `idade_minima` | INTEGER | NOT NULL, DEFAULT 16 | Idade mínima |
| `ativo` | BOOLEAN | NOT NULL, DEFAULT true | Modalidade ativa |
| `premiacao` | BOOLEAN | NOT NULL, DEFAULT false | Tem premiação? |
| `ordem_exibicao` | INTEGER | NOT NULL, DEFAULT 0 | Ordem na UI |
| `created_at` | TIMESTAMPTZ | NOT NULL | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Última atualização |

**Dados Padrão:**
- **3km**: Caminhada/Corrida Leve (16+, sem premiação)
- **5km**: Corrida Intermediária (16+, com premiação)
- **10km**: Corrida Avançada (18+, com premiação)

---

### 3. `tamanhos_camiseta`

Tamanhos de camiseta disponíveis para o evento.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK | Identificador único |
| `codigo` | VARCHAR(10) | NOT NULL, UNIQUE | Código (P, M, G, etc) |
| `nome` | VARCHAR(50) | NOT NULL | Nome do tamanho |
| `altura_cm` | NUMERIC(5,2) | NOT NULL | Altura em cm |
| `largura_cm` | NUMERIC(5,2) | NOT NULL | Largura em cm |
| `ativo` | BOOLEAN | NOT NULL, DEFAULT true | Tamanho ativo |
| `ordem_exibicao` | INTEGER | NOT NULL, DEFAULT 0 | Ordem na UI |
| `created_at` | TIMESTAMPTZ | NOT NULL | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Última atualização |

**Tabela de Medidas:**

| Tamanho | Altura (cm) | Largura (cm) |
|---------|-------------|--------------|
| P       | 73.0        | 50.0         |
| M       | 75.0        | 53.0         |
| G       | 77.5        | 55.0         |
| GG      | 80.0        | 58.0         |
| XG      | 82.5        | 60.5         |
| EXG     | 85.0        | 64.0         |

---

### 4. `inscricoes`

Inscrições dos colaboradores no evento. **Tabela principal do sistema.**

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK | Identificador único |
| `colaborador_id` | UUID | FK → colaboradores, NOT NULL | Colaborador inscrito |
| `numero_participante` | VARCHAR(10) | NOT NULL, UNIQUE | Número do peito (0001, 0002...) |
| `email` | VARCHAR(255) | NOT NULL | Email para contato |
| `whatsapp` | VARCHAR(15) | NOT NULL | WhatsApp (obrigatório) |
| `tipo_participacao` | ENUM | NOT NULL | Tipo de participação |
| `modalidade_id` | UUID | FK → modalidades, NULLABLE | Modalidade (se corrida) |
| `tamanho_camiseta_id` | UUID | FK → tamanhos, NULLABLE | Tamanho da camiseta |
| `aceitou_regulamento` | BOOLEAN | NOT NULL, DEFAULT false | Aceitou regulamento? |
| `data_aceite_regulamento` | TIMESTAMPTZ | NULLABLE | Data do aceite |
| `status` | ENUM | NOT NULL, DEFAULT 'pendente' | Status da inscrição |
| `kit_retirado` | BOOLEAN | NOT NULL, DEFAULT false | Kit retirado? |
| `data_retirada_kit` | TIMESTAMPTZ | NULLABLE | Data da retirada |
| `data_inscricao` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data da inscrição |
| `created_at` | TIMESTAMPTZ | NOT NULL | Criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Última atualização |
| `deleted_at` | TIMESTAMPTZ | NULLABLE | Soft delete (cancelamento) |

**Constraints:**
- `whatsapp_valido`: Valida formato (XX) XXXXX-XXXX
- `regulamento_aceito`: Deve ser true
- `modalidade_obrigatoria_corrida`: Se tipo_participacao = 'corrida-natal', modalidade_id é obrigatória
- `camiseta_obrigatoria`: Se tipo_participacao != 'retirar-cesta', tamanho_camiseta_id é obrigatória
- `uma_inscricao_por_colaborador`: UNIQUE(colaborador_id) WHERE deleted_at IS NULL

**Índices:**
- `idx_inscricoes_colaborador` em `colaborador_id`
- `idx_inscricoes_numero_participante` em `numero_participante`
- `idx_inscricoes_status` em `status`
- `idx_inscricoes_tipo_participacao` em `tipo_participacao`
- `idx_inscricoes_modalidade` em `modalidade_id`
- `idx_inscricoes_data_inscricao` em `data_inscricao`
- `idx_inscricoes_deleted` em `deleted_at WHERE deleted_at IS NULL`

---

### 5. `historico_inscricoes`

Auditoria de mudanças nas inscrições (histórico).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK | Identificador único |
| `inscricao_id` | UUID | FK → inscricoes, NOT NULL | Inscrição relacionada |
| `campo_alterado` | VARCHAR(100) | NOT NULL | Campo que foi alterado |
| `valor_anterior` | TEXT | NULLABLE | Valor anterior |
| `valor_novo` | TEXT | NULLABLE | Valor novo |
| `alterado_por` | VARCHAR(255) | NULLABLE | Quem alterou (futuro) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data da mudança |

**Índices:**
- `idx_historico_inscricao` em `inscricao_id`
- `idx_historico_created_at` em `created_at`

---

## 🔗 Relacionamentos

### Cardinalidade

- **colaboradores → inscricoes**: `1:1`
  - Um colaborador pode ter **apenas uma** inscrição ativa
  - Constraint: `uma_inscricao_por_colaborador UNIQUE(colaborador_id) WHERE deleted_at IS NULL`

- **inscricoes → modalidades**: `N:1`
  - Muitas inscrições podem estar na mesma modalidade
  - Opcional: apenas para tipo_participacao = 'corrida-natal'

- **inscricoes → tamanhos_camiseta**: `N:1`
  - Muitas inscrições podem ter o mesmo tamanho
  - Opcional: apenas quando tipo_participacao != 'retirar-cesta'

- **inscricoes → historico_inscricoes**: `1:N`
  - Uma inscrição pode ter muitas mudanças no histórico
  - CASCADE: se inscrição for deletada, histórico também é

---

## 🏷️ Enums

### `tipo_participacao_enum`

Define o tipo de participação do colaborador no evento.

```sql
CREATE TYPE tipo_participacao_enum AS ENUM (
    'corrida-natal',  -- Participa da corrida E da comemoração de Natal
    'apenas-natal',   -- Participa APENAS da comemoração de Natal
    'retirar-cesta'   -- NÃO participa, apenas retira cesta natalina
);
```

### `status_inscricao_enum`

Define o status atual da inscrição.

```sql
CREATE TYPE status_inscricao_enum AS ENUM (
    'pendente',      -- Inscrição realizada, aguardando revisão
    'confirmada',    -- Inscrição confirmada pela organização
    'cancelada',     -- Inscrição cancelada (pelo colaborador ou admin)
    'compareceu'     -- Participante compareceu no evento
);
```

---

## 👁️ Views

### `v_inscricoes_completas`

View com dados completos das inscrições, incluindo informações do colaborador, modalidade e tamanho.

```sql
SELECT * FROM v_inscricoes_completas;
```

**Colunas retornadas:**
- Dados da inscrição (id, número, status, data)
- Dados do colaborador (id, nome, email, CPF, idade)
- Dados da modalidade (código, nome, distância)
- Dados do tamanho (código, nome, medidas)

### `v_estatisticas_inscricoes`

View com estatísticas gerais das inscrições.

```sql
SELECT * FROM v_estatisticas_inscricoes;
```

**Colunas retornadas:**
- `total_inscricoes`: Total de inscrições ativas
- `pendentes`: Inscrições pendentes
- `confirmadas`: Inscrições confirmadas
- `canceladas`: Inscrições canceladas
- `total_corrida`: Total participando da corrida
- `total_apenas_natal`: Total apenas no Natal
- `total_retirar_cesta`: Total apenas retirando cesta
- `kits_retirados`: Kits já retirados
- `kits_pendentes`: Kits pendentes de retirada

---

## ⚙️ Triggers e Functions

### 1. `update_updated_at_column()`

**Trigger:** Atualiza automaticamente o campo `updated_at` em qualquer UPDATE.

Aplicado em:
- `colaboradores`
- `inscricoes`
- `modalidades`
- `tamanhos_camiseta`

---

### 2. `gerar_numero_participante()`

**Trigger:** Gera automaticamente o número do participante (formato: 0001, 0002...) ao inserir nova inscrição.

- Busca o maior número existente
- Incrementa +1
- Formata com zeros à esquerda (LPAD)

**Exemplo:**
```sql
INSERT INTO inscricoes (colaborador_id, ...) VALUES (...);
-- numero_participante será gerado automaticamente: '0001', '0002', etc
```

---

### 3. `validar_idade_modalidade()`

**Trigger:** Valida a idade mínima do colaborador antes de inscrevê-lo em uma modalidade.

- 3km e 5km: idade mínima 16 anos
- 10km: idade mínima 18 anos

**Exemplo de erro:**
```
ERRO: Idade mínima para esta modalidade é 18 anos. Idade atual: 16 anos
```

---

### 4. `registrar_historico_inscricao()`

**Trigger:** Registra automaticamente mudanças importantes na tabela `historico_inscricoes`.

Campos monitorados:
- `status`
- `tipo_participacao`
- `modalidade_id`
- `kit_retirado`

**Exemplo:**
```sql
UPDATE inscricoes SET status = 'confirmada' WHERE id = '...';
-- Automaticamente cria registro no historico_inscricoes
```

---

## 🔒 Row Level Security (RLS)

O Supabase utiliza **Row Level Security (RLS)** do PostgreSQL para controlar acesso aos dados em nível de linha.

### Roles

- **`authenticated`**: Usuário autenticado (colaborador)
- **`admin`**: Administrador do sistema (configurado no JWT)
- **`service_role`**: Backend (bypassa RLS)

### Políticas Principais

#### Colaboradores

```sql
-- Podem ver apenas seus próprios dados
"Colaboradores podem ver seus próprios dados"
  USING (auth.uid()::text = id::text)

-- Podem atualizar seus dados (exceto CPF e email)
"Colaboradores podem atualizar seus dados"
  USING (auth.uid()::text = id::text)
  WITH CHECK (OLD.cpf = NEW.cpf AND OLD.email = NEW.email)
```

#### Inscrições

```sql
-- Podem ver apenas suas próprias inscrições
"Colaboradores podem ver suas inscrições"
  USING (auth.uid()::text = colaborador_id::text)

-- Podem criar inscrição (apenas uma por colaborador)
"Colaboradores podem criar inscrições"
  WITH CHECK (
    auth.uid()::text = colaborador_id::text AND
    NOT EXISTS (SELECT 1 FROM inscricoes WHERE colaborador_id = ...)
  )

-- Podem editar apenas se status = 'pendente'
"Colaboradores podem atualizar suas inscrições"
  USING (auth.uid()::text = colaborador_id::text AND status = 'pendente')

-- Podem cancelar inscrição
"Colaboradores podem cancelar inscrições"
  WITH CHECK (NEW.status = 'cancelada' AND NEW.deleted_at IS NOT NULL)
```

#### Modalidades e Tamanhos

```sql
-- Todos podem ver (leitura pública)
"Todos podem ver modalidades ativas"
  USING (ativo = true)
```

#### Admins

```sql
-- Admins têm acesso total
"Admins podem gerenciar [tabela]"
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin')
```

### Como Tornar um Usuário Admin

No Supabase SQL Editor:

```sql
UPDATE auth.users
SET raw_app_meta_data =
  raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@farmace.com.br';
```

---

## 🚀 Setup no Supabase

### Pré-requisitos

1. Conta no [Supabase](https://supabase.com)
2. Projeto criado no Supabase
3. Acesso ao **SQL Editor** do painel

### Método 1: Execução Manual (Recomendado)

Execute os scripts na seguinte ordem:

```bash
1. schema.sql      # Cria estrutura (tabelas, índices, triggers)
2. policies.sql    # Adiciona Row Level Security
3. seed.sql        # Popula dados iniciais (modalidades, tamanhos)
```

**Passo a passo:**

1. Acesse o **SQL Editor** no painel do Supabase
2. Cole o conteúdo de `schema.sql`
3. Clique em **Run** (ou F5)
4. Repita para `policies.sql`
5. Repita para `seed.sql`

### Método 2: Migrations (Versionado)

Execute as migrations em ordem:

```bash
1. migrations/001_initial_schema.sql      # Estrutura inicial
2. migrations/002_add_rls_policies.sql    # Políticas RLS
3. seed.sql                               # Dados iniciais
```

### Método 3: Supabase CLI (Avançado)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar projeto
supabase init

# Linkar projeto
supabase link --project-ref <PROJECT_REF>

# Aplicar migrations
supabase db push
```

---

## 🔄 Migrations

As migrations estão versionadas na pasta `migrations/` para facilitar deploy incremental.

### 001_initial_schema.sql

**Objetivo:** Criar estrutura inicial completa

- Extensions (uuid-ossp, pgcrypto)
- Enums (tipo_participacao_enum, status_inscricao_enum)
- Tabelas (colaboradores, modalidades, tamanhos, inscricoes, historico)
- Índices
- Functions e Triggers
- Views
- Grants

### 002_add_rls_policies.sql

**Objetivo:** Adicionar políticas de segurança RLS

- Habilita RLS em todas as tabelas
- Cria functions auxiliares (is_admin, is_own_colaborador)
- Define políticas para cada tabela
- Controla acesso por role (authenticated, admin)

### 003_expand_colaboradores_from_firebird.sql 🔥

**Objetivo:** Expandir tabela `colaboradores` com campos do sistema legado Firebird 2.5

Esta migration adiciona **mais de 50 campos** à tabela `colaboradores` para compatibilidade total com o sistema ERP Firebird da FARMACE (tabela EPG).

**Campos adicionados:**

- **Identificação:** emp_codigo, epg_codigo, nome_social, pis, sexo
- **Estado Civil:** estado_civil_codigo, estado_civil_descr
- **Filiação:** mae_nome, pai_nome
- **Contatos:** ddd, fone, celular
- **Endereço completo:** end_logradouro, end_numero, end_complemento, bairro, cep, uf_sigla, mun_codigo, municipio_nome
- **Documentos:** CTPS (número, série, DV, UF, data), Identidade (número, órgão, data), Título de Eleitor (número, zona, seção)
- **Admissão:** admissao_data, admissao_tipo, admissao_tipo_desc, admissao_tipo_esocial, admissao_tipo_esocial_desc, admissao_vinculo, admissao_vinculo_desc
- **Demissão:** demissao_data
- **PCD (Pessoa com Deficiência):** tem_deficiencia, preenche_cota_deficiencia, deficiencia_fisica, deficiencia_visual, deficiencia_auditiva, deficiencia_mental, deficiencia_intelectual
- **Escolaridade:** escolaridade_codigo, escolaridade_descr (conforme eSocial S-2200)
- **Cargo atual:** cargo_codigo, cargo_descr
- **Função atual:** funcao_codigo, funcao_descr
- **Lotação atual:** lotacao_codigo, lotacao_nome

**Recursos incluídos:**

- 10+ índices para performance
- 10+ constraints de validação
- View `v_colaboradores_completo` (compatibilidade com Firebird)
- Comentários descritivos em cada campo
- Scripts de exemplo para importação de dados

**Documentação detalhada:** Ver `FIREBIRD_TO_SUPABASE_MAPPING.md`

---

## 🔥 Migração de Dados do Firebird

### Visão Geral

O sistema legado da FARMACE utiliza **Firebird 2.5** com as seguintes tabelas principais:

- **EPG**: Funcionários (dados pessoais, documentos, admissão)
- **SEP**: Histórico de cargos e lotações
- **RHSEP**: Histórico de funções
- **CAR**: Cargos
- **FUN**: Funções
- **LOT**: Lotações/Departamentos
- **MUN**: Municípios

### Documentação Completa

📚 **Ver arquivo:** `FIREBIRD_TO_SUPABASE_MAPPING.md`

Este documento contém:

- ✅ Mapeamento completo campo a campo (Firebird → PostgreSQL)
- ✅ Todas as transformações CASE necessárias
- ✅ Diagrama de relacionamentos entre tabelas
- ✅ Scripts de exportação do Firebird
- ✅ Scripts de importação no Supabase
- ✅ Checklist completo de migração
- ✅ Queries de validação pós-migração

### Processo de Migração (Resumo)

1. **Executar migration 003** no Supabase
   ```sql
   -- No SQL Editor do Supabase
   -- Executar: migrations/003_expand_colaboradores_from_firebird.sql
   ```

2. **Exportar dados do Firebird**
   ```sql
   -- Usar query de: migrations/colaboradores.sql
   -- Exportar para CSV com encoding UTF-8
   ```

3. **Importar no Supabase**
   ```sql
   COPY colaboradores (...campos...)
   FROM '/path/to/colaboradores.csv'
   DELIMITER ',' CSV HEADER;
   ```

4. **Validar importação**
   ```sql
   -- Verificar totais, CPFs únicos, campos obrigatórios
   -- Ver queries de validação no MAPPING.md
   ```

### Transformações Principais

**Sexo (M/F → Masculino/Feminino)**
```sql
CASE WHEN sexo = 'M' THEN 'Masculino'
     WHEN sexo = 'F' THEN 'Feminino'
     ELSE NULL END
```

**Estado Civil (1-5 → 01-05 + descrição)**
```sql
-- Código: '1' → '01' (Solteiro)
-- Gera também: estado_civil_descr = 'Solteiro'
```

**Escolaridade (conforme eSocial S-2200)**
```sql
-- Código: '01' a '12'
-- '01' → 'Analfabeto'
-- '09' → 'Educação superior completa'
-- '12' → 'Doutorado completo'
```

---

## 📝 Queries Úteis

O arquivo `queries.sql` contém dezenas de consultas prontas. Aqui estão algumas das mais úteis:

### Listar Inscrições

```sql
-- Todas as inscrições com dados completos
SELECT * FROM v_inscricoes_completas;

-- Buscar por número do participante
SELECT * FROM v_inscricoes_completas
WHERE numero_participante = '0001';

-- Buscar por nome
SELECT * FROM v_inscricoes_completas
WHERE colaborador_nome ILIKE '%João%';
```

### Estatísticas

```sql
-- Estatísticas gerais
SELECT * FROM v_estatisticas_inscricoes;

-- Inscrições por modalidade
SELECT m.nome, COUNT(*) as total
FROM inscricoes i
JOIN modalidades m ON i.modalidade_id = m.id
WHERE i.deleted_at IS NULL
GROUP BY m.nome;

-- Distribuição por tamanho de camiseta
SELECT t.codigo, COUNT(*) as quantidade
FROM inscricoes i
JOIN tamanhos_camiseta t ON i.tamanho_camiseta_id = t.id
WHERE i.deleted_at IS NULL
GROUP BY t.codigo;
```

### Controle de Kits

```sql
-- Kits pendentes de retirada
SELECT i.numero_participante, c.nome, t.codigo as tamanho
FROM inscricoes i
JOIN colaboradores c ON i.colaborador_id = c.id
JOIN tamanhos_camiseta t ON i.tamanho_camiseta_id = t.id
WHERE i.kit_retirado = false
  AND i.status = 'confirmada'
  AND i.deleted_at IS NULL;

-- Registrar retirada de kit
UPDATE inscricoes
SET kit_retirado = true,
    data_retirada_kit = NOW()
WHERE numero_participante = '0001';
```

### Validações

```sql
-- Verificar idade mínima para modalidades
SELECT i.numero_participante, c.nome,
       EXTRACT(YEAR FROM AGE(c.data_nascimento)) as idade,
       m.idade_minima
FROM inscricoes i
JOIN colaboradores c ON i.colaborador_id = c.id
JOIN modalidades m ON i.modalidade_id = m.id
WHERE EXTRACT(YEAR FROM AGE(c.data_nascimento)) < m.idade_minima;

-- Verificar inscrições duplicadas
SELECT c.nome, COUNT(*)
FROM inscricoes i
JOIN colaboradores c ON i.colaborador_id = c.id
WHERE i.deleted_at IS NULL
GROUP BY c.id, c.nome
HAVING COUNT(*) > 1;
```

---

## 🔐 Considerações de Segurança

### LGPD e Privacidade

#### Dados Sensíveis

- **CPF**: Considerado dado sensível
  - Armazenado com formatação (XXX.XXX.XXX-XX)
  - No frontend, exibir mascarado: `006.***.**3-01`
  - RLS garante que colaborador vê apenas seu próprio CPF

- **Data de Nascimento**: Dado pessoal
  - Calcular idade, não expor data completa quando desnecessário
  - Usar `EXTRACT(YEAR FROM AGE(data_nascimento))` para obter idade

#### Recomendações

1. **Criptografia em Trânsito**: Usar HTTPS (Supabase já fornece)
2. **Criptografia em Repouso**: Supabase criptografa dados em disco
3. **Logs de Auditoria**: Tabela `historico_inscricoes` registra mudanças
4. **Soft Delete**: Usar `deleted_at` em vez de DELETE físico
5. **Row Level Security**: Sempre habilitado em produção

### Proteção contra SQL Injection

- **Usar Prepared Statements**: Sempre usar client libraries do Supabase
- **Validações no Backend**: Validar inputs antes de queries
- **RLS**: Garante isolamento mesmo com query maliciosa

### Controle de Acesso

- **Service Role**: Usar apenas no backend (nunca expor no frontend)
- **Authenticated Role**: Para operações do colaborador
- **Admin Role**: Configurar manualmente no JWT para administradores

---

## 📞 Suporte e Contato

Para dúvidas sobre o schema ou problemas no setup:

- **Desenvolvedor**: Emanuel
- **Empresa**: FARMACE
- **Projeto**: II Corrida da Qualidade FARMACE 2025

---

## 📚 Referências

### Documentação PostgreSQL/Supabase

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/trigger-definition.html)

### Documentação do Projeto

- 📄 `FIREBIRD_TO_SUPABASE_MAPPING.md` - Mapeamento completo Firebird → PostgreSQL
- 📄 `migrations/colaboradores.sql` - Query original do Firebird (referência)
- 📄 `migrations/003_expand_colaboradores_from_firebird.sql` - Migration de expansão

### Padrões eSocial

- [eSocial - Tabelas](https://www.gov.br/esocial/pt-br/documentacao-tecnica/tabelas)
- [S-2200 - Cadastramento Inicial e Admissão](https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-v-s-1-2)

---

**Última atualização:** 2025-10-31
**Versão do Schema:** 2.0.0 (com expansão Firebird)
**Status:** ✅ Pronto para Produção + 🔥 Migração Firebird Implementada
