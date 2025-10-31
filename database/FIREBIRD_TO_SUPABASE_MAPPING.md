# Mapeamento: Firebird 2.5 → Supabase PostgreSQL

## 📋 Visão Geral

Este documento detalha o mapeamento completo da estrutura de dados do sistema legado Firebird 2.5 (ERP da FARMACE) para o novo banco de dados PostgreSQL no Supabase.

---

## 🗂️ Tabelas Firebird → Supabase

### Tabela Principal: EPG (Firebird) → colaboradores (Supabase)

| Campo Firebird (EPG) | Campo Supabase (colaboradores) | Tipo Firebird | Tipo PostgreSQL | Transformação |
|---------------------|-------------------------------|---------------|-----------------|---------------|
| `EMP_CODIGO` | `emp_codigo` | VARCHAR(10) | VARCHAR(10) | Direto |
| `CODIGO` | `epg_codigo` | INTEGER | INTEGER | Direto |
| `NOME` | `nome` | VARCHAR(255) | VARCHAR(255) | Direto |
| `NOMESOCIAL` | `nome_social` | VARCHAR(255) | VARCHAR(255) | Direto |
| `CPF` | `cpf` | VARCHAR(14) | VARCHAR(14) | Direto (formato: XXX.XXX.XXX-XX) |
| `PIS` | `pis` | VARCHAR(15) | VARCHAR(15) | Direto |
| `DTNASCIMENTO` | `data_nascimento` | DATE | DATE | Direto |
| `SEXO` | `sexo` | CHAR(1) | VARCHAR(20) | **CASE: M→'Masculino', F→'Feminino'** |
| `ESTADOCIVIL` | `estado_civil_codigo` | VARCHAR(2) | VARCHAR(2) | **Normalizado para 01-05** |
| - | `estado_civil_descr` | - | VARCHAR(50) | **CASE: código→descrição** |
| `MAENOME` | `mae_nome` | VARCHAR(255) | VARCHAR(255) | Direto |
| `PAINOME` | `pai_nome` | VARCHAR(255) | VARCHAR(255) | Direto |
| `EMAIL` | `email` | VARCHAR(255) | VARCHAR(255) | Direto |
| `DDD` | `ddd` | VARCHAR(3) | VARCHAR(3) | Direto |
| `FONE` | `fone` | VARCHAR(15) | VARCHAR(15) | Direto |
| `CELULAR` | `celular` | VARCHAR(15) | VARCHAR(15) | Direto |
| `WHATSAPP` | `whatsapp` | VARCHAR(15) | VARCHAR(15) | Direto |
| `ENDLOGRADOURO` | `end_logradouro` | VARCHAR(255) | VARCHAR(255) | Direto |
| `ENDNUMERO` | `end_numero` | VARCHAR(20) | VARCHAR(20) | Direto |
| `ENDCOMPLEMENTO` | `end_complemento` | VARCHAR(100) | VARCHAR(100) | Direto |
| `BAIRRO` | `bairro` | VARCHAR(100) | VARCHAR(100) | Direto |
| `CEP` | `cep` | VARCHAR(10) | VARCHAR(10) | Direto |
| `MUN_UFD_SIGLA` | `uf_sigla` | VARCHAR(2) | VARCHAR(2) | Direto |
| `MUN_CODIGO` | `mun_codigo` | VARCHAR(10) | VARCHAR(10) | Direto |
| - | `municipio_nome` | - | VARCHAR(255) | **JOIN com MUN.NOME** |
| `CTPSNUMERO` | `ctps_numero` | VARCHAR(20) | VARCHAR(20) | Direto |
| `CTPSSERIE` | `ctps_serie` | VARCHAR(10) | VARCHAR(10) | Direto |
| `CTPSDV` | `ctps_dv` | VARCHAR(2) | VARCHAR(2) | Direto |
| `UFD_SIGLA_CTPS` | `ctps_uf_sigla` | VARCHAR(2) | VARCHAR(2) | Direto |
| `CTPSDTEXPEDICAO` | `ctps_dt_expedicao` | DATE | DATE | Direto |
| `IDENTIDADENUMERO` | `identidade_numero` | VARCHAR(20) | VARCHAR(20) | Direto |
| `IDENTIDADEORGAOEXPEDIDOR` | `identidade_orgao_expedidor` | VARCHAR(20) | VARCHAR(20) | Direto |
| `IDENTIDADEDTEXPEDICAO` | `identidade_dt_expedicao` | DATE | DATE | Direto |
| `TITULO` | `titulo` | VARCHAR(20) | VARCHAR(20) | Direto |
| `ZONA` | `zona` | VARCHAR(10) | VARCHAR(10) | Direto |
| `SECAO` | `secao` | VARCHAR(10) | VARCHAR(10) | Direto |
| `ADMISSAODATA` | `admissao_data` | DATE | DATE | Direto |
| `ADMISSAOTIPO` | `admissao_tipo` | VARCHAR(2) | VARCHAR(2) | Direto |
| - | `admissao_tipo_desc` | - | VARCHAR(50) | **CASE: 10→'1º Emprego', etc** |
| `ADMISSAOTIPOESOCIAL` | `admissao_tipo_esocial` | VARCHAR(2) | VARCHAR(2) | Direto |
| - | `admissao_tipo_esocial_desc` | - | TEXT | **CASE: 01-07→descrição** |
| `ADMISSAOVINCULO` | `admissao_vinculo` | VARCHAR(2) | VARCHAR(2) | Direto |
| - | `admissao_vinculo_desc` | - | TEXT | **CASE: código→descrição** |
| `DTRESCISAO` | `demissao_data` | DATE | DATE | Direto |
| `TEMDEFICIENCIA` | `tem_deficiencia` | BOOLEAN | BOOLEAN | Direto |
| `PREENCHECOTADEFICIENCIA` | `preenche_cota_deficiencia` | BOOLEAN | BOOLEAN | Direto |
| `DEFICIENCIAFISICA` | `deficiencia_fisica` | BOOLEAN | BOOLEAN | Direto |
| `DEFICIENCIAVISUAL` | `deficiencia_visual` | BOOLEAN | BOOLEAN | Direto |
| `DEFICIENCIAAUDITIVA` | `deficiencia_auditiva` | BOOLEAN | BOOLEAN | Direto |
| `DEFICIENCIAMENTAL` | `deficiencia_mental` | BOOLEAN | BOOLEAN | Direto |
| `DEFICIENCIAINTELECTUAL` | `deficiencia_intelectual` | BOOLEAN | BOOLEAN | Direto |
| `GRAUINSTRUCAO` | `escolaridade_codigo` | VARCHAR(2) | VARCHAR(2) | Direto |
| - | `escolaridade_descr` | - | VARCHAR(255) | **CASE: 01-12→descrição** |

### Tabelas Relacionadas (Subqueries no Firebird)

#### SEP (Firebird) → Cargo Atual (campos calculados no Supabase)

O Firebird usa subquery para buscar o último cargo:

```sql
-- Firebird
(SELECT FIRST 1 S.CAR_CODIGO FROM SEP S
 WHERE S.EMP_CODIGO = E.EMP_CODIGO AND S.EPG_CODIGO = E.CODIGO
 ORDER BY S.DATA DESC)
```

No Supabase, isso vira campos diretos na tabela `colaboradores`:

| Campo Calculado (Firebird) | Campo Supabase | Tipo | Origem |
|---------------------------|----------------|------|--------|
| Último `SEP.CAR_CODIGO` | `cargo_codigo` | VARCHAR(10) | Último registro SEP |
| Último `CAR.NOME` (via JOIN) | `cargo_descr` | VARCHAR(100) | JOIN com tabela CAR |

#### RHSEP (Firebird) → Função Atual (campos calculados no Supabase)

```sql
-- Firebird
(SELECT FIRST 1 R.FUN_CODIGO FROM RHSEP R
 WHERE R.EMP_CODIGO = E.EMP_CODIGO AND R.EPG_CODIGO = E.CODIGO
 ORDER BY R.DATA DESC)
```

| Campo Calculado (Firebird) | Campo Supabase | Tipo | Origem |
|---------------------------|----------------|------|--------|
| Último `RHSEP.FUN_CODIGO` | `funcao_codigo` | VARCHAR(10) | Último registro RHSEP |
| Último `FUN.NOME` (via JOIN) | `funcao_descr` | VARCHAR(100) | JOIN com tabela FUN |

#### LOT (Firebird) → Lotação Atual (campos calculados no Supabase)

```sql
-- Firebird
(SELECT FIRST 1 S.LOT_CODIGO FROM SEP S
 WHERE S.EMP_CODIGO = E.EMP_CODIGO AND S.EPG_CODIGO = E.CODIGO
 ORDER BY S.DATA DESC)
```

| Campo Calculado (Firebird) | Campo Supabase | Tipo | Origem |
|---------------------------|----------------|------|--------|
| Último `SEP.LOT_CODIGO` | `lotacao_codigo` | VARCHAR(10) | Último registro SEP |
| Último `LOT.NOME` (via JOIN) | `lotacao_nome` | VARCHAR(100) | JOIN com tabela LOT |

---

## 🔄 Transformações Complexas

### 1. Sexo

**Firebird:**
```sql
CASE UPPER(TRIM(E.SEXO))
  WHEN 'M' THEN 'Masculino'
  WHEN 'F' THEN 'Feminino'
  ELSE NULL
END
```

**Supabase:** Armazena diretamente como 'Masculino' ou 'Feminino'

---

### 2. Estado Civil

**Firebird:** Normaliza para código 2 dígitos (01-05)

```sql
CASE TRIM(E.ESTADOCIVIL)
  WHEN '1'  THEN '01'
  WHEN '01' THEN '01'
  WHEN '2'  THEN '02'
  -- ...
END
```

**E gera descrição:**

```sql
CASE TRIM(E.ESTADOCIVIL)
  WHEN '1'  THEN 'Solteiro'
  WHEN '01' THEN 'Solteiro'
  WHEN '2'  THEN 'Casado'
  WHEN '02' THEN 'Casado'
  WHEN '3'  THEN 'Divorciado'
  WHEN '03' THEN 'Divorciado'
  WHEN '4'  THEN 'Separado'
  WHEN '04' THEN 'Separado'
  WHEN '5'  THEN 'Viúvo'
  WHEN '05' THEN 'Viúvo'
  ELSE 'Outro'
END
```

**Supabase:** Armazena ambos os campos:
- `estado_civil_codigo`: VARCHAR(2) - '01' a '05'
- `estado_civil_descr`: VARCHAR(50) - Descrição por extenso

---

### 3. Escolaridade (eSocial S-2200)

**Firebird:** Converte código para descrição conforme tabela eSocial

```sql
CASE TRIM(E.GRAUINSTRUCAO)
  WHEN '01' THEN 'Analfabeto, inclusive o que, embora tenha recebido instrução, não se alfabetizou'
  WHEN '02' THEN 'Até o 5º ano incompleto do ensino fundamental...'
  -- ... códigos 01 a 12
END
```

**Supabase:** Armazena ambos:
- `escolaridade_codigo`: VARCHAR(2) - '01' a '12'
- `escolaridade_descr`: VARCHAR(255) - Descrição completa

**Tabela de Códigos:**

| Código | Descrição |
|--------|-----------|
| 01 | Analfabeto |
| 02 | Até o 5º ano incompleto |
| 03 | 5º ano completo |
| 04 | Do 6º ao 9º ano incompleto |
| 05 | Ensino fundamental completo |
| 06 | Ensino médio incompleto |
| 07 | Ensino médio completo |
| 08 | Educação superior incompleta |
| 09 | Educação superior completa |
| 10 | Pós-graduação completa |
| 11 | Mestrado completo |
| 12 | Doutorado completo |

---

### 4. Tipo de Admissão

**Firebird:**

```sql
CASE TRIM(E.ADMISSAOTIPO)
  WHEN '10' THEN '1º Emprego'
  WHEN '20' THEN 'Reemprego'
  WHEN '35' THEN 'Reintegração'
  ELSE NULL
END
```

**Supabase:**
- `admissao_tipo`: VARCHAR(2) - '10', '20' ou '35'
- `admissao_tipo_desc`: VARCHAR(50) - Descrição

---

### 5. Tipo de Admissão eSocial

**Firebird:** Converte código (01-07) para descrição completa

```sql
CASE TRIM(E.ADMISSAOTIPOESOCIAL)
  WHEN '01' THEN 'Admissão'
  WHEN '02' THEN 'Transferência de empresa do mesmo grupo econômico...'
  -- ... códigos 01 a 07
END
```

**Supabase:**
- `admissao_tipo_esocial`: VARCHAR(2)
- `admissao_tipo_esocial_desc`: TEXT

---

### 6. Vínculo de Admissão

**Firebird:** Converte código para descrição longa conforme eSocial

```sql
CASE TRIM(E.ADMISSAOVINCULO)
  WHEN '10' THEN 'Trabalhador Urbano, vinculado a empregador Pessoa Jurídica...'
  WHEN '15' THEN 'Trabalhador Urbano, vinculado a empregador Pessoa Física...'
  -- ... múltiplos códigos
END
```

**Supabase:**
- `admissao_vinculo`: VARCHAR(2)
- `admissao_vinculo_desc`: TEXT

---

## 📊 Diagrama de Relacionamentos

```
┌──────────────────┐
│   EPG            │────┐
│  (Firebird)      │    │
└──────────────────┘    │
                        │ N:1
                        │
┌──────────────────┐    │         ┌──────────────────┐
│   MUN            │◄───┼─────────│  colaboradores   │
│  (Firebird)      │    │         │   (Supabase)     │
└──────────────────┘    │         └──────────────────┘
                        │
┌──────────────────┐    │
│   SEP            │────┤ Último registro
│  (Firebird)      │    │ → cargo_codigo
└──────────────────┘    │   cargo_descr
        │               │
        │ N:1           │
        ▼               │
┌──────────────────┐    │
│   CAR            │◄───┤
│  (Firebird)      │    │
└──────────────────┘    │
                        │
┌──────────────────┐    │
│   RHSEP          │────┤ Último registro
│  (Firebird)      │    │ → funcao_codigo
└──────────────────┘    │   funcao_descr
        │               │
        │ N:1           │
        ▼               │
┌──────────────────┐    │
│   FUN            │◄───┤
│  (Firebird)      │    │
└──────────────────┘    │
                        │
┌──────────────────┐    │
│   LOT            │◄───┘ Último SEP
│  (Firebird)      │      → lotacao_codigo
└──────────────────┘        lotacao_nome
```

---

## 🔧 Script de Importação (Exemplo)

### 1. Exportar do Firebird para CSV

```sql
-- No Firebird (via isql ou ferramenta de export)
SELECT
  E.EMP_CODIGO,
  E.CODIGO AS EPG_CODIGO,
  E.NOME,
  E.NOMESOCIAL,
  E.CPF,
  E.PIS,
  E.DTNASCIMENTO,
  -- Converter SEXO
  CASE UPPER(TRIM(E.SEXO))
    WHEN 'M' THEN 'Masculino'
    WHEN 'F' THEN 'Feminino'
    ELSE NULL
  END AS SEXO,
  -- ... todos os outros campos
FROM EPG E
LEFT JOIN MUN M ON M.UFD_SIGLA = E.MUN_UFD_SIGLA AND M.CODIGO = E.MUN_CODIGO
WHERE E.EMP_CODIGO = '0002';
```

**Exportar para:** `colaboradores_export.csv`

---

### 2. Importar no Supabase (PostgreSQL)

```sql
-- No Supabase SQL Editor
COPY colaboradores (
    emp_codigo,
    epg_codigo,
    nome,
    nome_social,
    cpf,
    pis,
    data_nascimento,
    sexo,
    estado_civil_codigo,
    estado_civil_descr,
    mae_nome,
    pai_nome,
    email,
    ddd,
    fone,
    celular,
    whatsapp,
    end_logradouro,
    end_numero,
    end_complemento,
    bairro,
    cep,
    uf_sigla,
    mun_codigo,
    municipio_nome,
    ctps_numero,
    ctps_serie,
    ctps_dv,
    ctps_uf_sigla,
    ctps_dt_expedicao,
    identidade_numero,
    identidade_orgao_expedidor,
    identidade_dt_expedicao,
    titulo,
    zona,
    secao,
    admissao_data,
    admissao_tipo,
    admissao_tipo_desc,
    admissao_tipo_esocial,
    admissao_tipo_esocial_desc,
    admissao_vinculo,
    admissao_vinculo_desc,
    demissao_data,
    tem_deficiencia,
    preenche_cota_deficiencia,
    deficiencia_fisica,
    deficiencia_visual,
    deficiencia_auditiva,
    deficiencia_mental,
    deficiencia_intelectual,
    escolaridade_codigo,
    escolaridade_descr,
    cargo_codigo,
    cargo_descr,
    funcao_codigo,
    funcao_descr,
    lotacao_codigo,
    lotacao_nome,
    ativo
)
FROM '/path/to/colaboradores_export.csv'
DELIMITER ','
CSV HEADER
ENCODING 'UTF8';
```

---

## ✅ Checklist de Migração

### Pré-Migração

- [ ] Executar `003_expand_colaboradores_from_firebird.sql` no Supabase
- [ ] Verificar se todas as constraints foram criadas
- [ ] Verificar se todos os índices foram criados
- [ ] Testar a view `v_colaboradores_completo`

### Exportação Firebird

- [ ] Exportar dados da tabela EPG
- [ ] Aplicar todas as transformações CASE
- [ ] Incluir JOINs com MUN, CAR, FUN, LOT
- [ ] Gerar arquivo CSV com encoding UTF-8
- [ ] Validar integridade do CSV (sem linhas quebradas)

### Importação Supabase

- [ ] Upload do CSV para servidor acessível ao Supabase
- [ ] Executar comando COPY
- [ ] Verificar total de registros importados
- [ ] Validar dados críticos (CPF, email, datas)
- [ ] Verificar constraints (nenhuma violação)

### Pós-Migração

- [ ] Executar queries de validação (ver seção abaixo)
- [ ] Comparar totais: Firebird vs Supabase
- [ ] Testar RLS policies
- [ ] Atualizar aplicação frontend para usar novos campos
- [ ] Backup do banco após migração bem-sucedida

---

## 🔍 Queries de Validação

### 1. Contar registros importados

```sql
SELECT COUNT(*) as total_colaboradores
FROM colaboradores
WHERE deleted_at IS NULL;
```

### 2. Verificar campos obrigatórios preenchidos

```sql
SELECT
    COUNT(*) FILTER (WHERE nome IS NULL) as sem_nome,
    COUNT(*) FILTER (WHERE cpf IS NULL) as sem_cpf,
    COUNT(*) FILTER (WHERE email IS NULL) as sem_email,
    COUNT(*) FILTER (WHERE data_nascimento IS NULL) as sem_data_nasc
FROM colaboradores;
```

### 3. Validar CPFs únicos

```sql
SELECT cpf, COUNT(*) as duplicados
FROM colaboradores
WHERE deleted_at IS NULL
GROUP BY cpf
HAVING COUNT(*) > 1;
```

### 4. Verificar distribuição por empresa

```sql
SELECT emp_codigo, COUNT(*) as total
FROM colaboradores
WHERE deleted_at IS NULL
GROUP BY emp_codigo
ORDER BY total DESC;
```

### 5. Comparar com query original do Firebird

```sql
SELECT * FROM v_colaboradores_completo
WHERE epg_codigo = 123; -- Substituir por código de teste
```

---

## 📝 Notas Importantes

### Diferenças entre Firebird e PostgreSQL

1. **FIRST N (Firebird) → LIMIT N (PostgreSQL)**
   - Firebird: `SELECT FIRST 1 ... ORDER BY DATA DESC`
   - PostgreSQL: `SELECT ... ORDER BY DATA DESC LIMIT 1`

2. **CHAR_LENGTH (Firebird) → LENGTH (PostgreSQL)**
   - Ambos funcionam no PostgreSQL

3. **|| (Concatenação)**
   - Funciona igual em ambos

4. **EXTRACT (Ano/Mês/Dia)**
   - Funciona igual em ambos

5. **AGE() no PostgreSQL**
   - PostgreSQL tem função nativa `AGE(timestamp)` que retorna interval
   - Muito útil para calcular idade: `EXTRACT(YEAR FROM AGE(data_nascimento))`

### Considerações de Performance

1. **Índices Criados:**
   - `emp_codigo + epg_codigo` (composto)
   - `pis`
   - `uf_sigla + mun_codigo`
   - `cargo_codigo`
   - `lotacao_codigo`
   - `admissao_data`
   - `ativo` (parcial: WHERE ativo = true)
   - `tem_deficiencia` (parcial)

2. **View `v_colaboradores_completo`:**
   - Não é materializada (recalcula a cada query)
   - Para melhor performance, considere criar MATERIALIZED VIEW
   - Atualizar com `REFRESH MATERIALIZED VIEW`

### Segurança e LGPD

1. **Dados Sensíveis:**
   - CPF: mascarar na interface (mostrar apenas XXX.XXX.XXX-XX)
   - PIS: protegido por RLS
   - Data de nascimento: exibir apenas idade
   - Documentos (CTPS, RG): acesso restrito

2. **RLS (Row Level Security):**
   - Colaboradores veem apenas seus próprios dados
   - Admins têm acesso completo
   - Políticas já definidas na migration 002

---

## 🚀 Próximos Passos

1. **Executar migration 003:**
   ```bash
   # No SQL Editor do Supabase
   # Copiar e colar o conteúdo de 003_expand_colaboradores_from_firebird.sql
   ```

2. **Preparar dados do Firebird:**
   - Executar query de exportação
   - Aplicar transformações CASE
   - Gerar CSV

3. **Importar dados:**
   - Upload do CSV
   - Executar COPY
   - Validar importação

4. **Atualizar aplicação:**
   - Atualizar interfaces para usar novos campos
   - Implementar máscaras de dados sensíveis
   - Testar autenticação com dados reais

---

**Última atualização:** 2025-10-31
**Responsável:** Emanuel
**Projeto:** II Corrida da Qualidade FARMACE 2025
