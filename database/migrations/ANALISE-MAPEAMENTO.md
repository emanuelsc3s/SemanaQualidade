# 📊 Análise Detalhada: Mapeamento Firebird → Supabase

## 🎯 Objetivo

Este documento detalha a análise completa da estrutura de dados do Firebird (arquivo JSON) e do schema PostgreSQL (Supabase), incluindo o mapeamento campo a campo, transformações necessárias e validações aplicadas.

---

## 📋 Estrutura da Tabela `tbfuncionario` (Supabase)

### Campos Obrigatórios (NOT NULL)

| Campo | Tipo | Constraint | Descrição |
|-------|------|------------|-----------|
| `cpf` | VARCHAR(14) | NOT NULL, UNIQUE | CPF do funcionário (formato: XXX.XXX.XXX-XX) |

### Campos com Foreign Keys

| Campo | Referência | Tabela | Ação |
|-------|------------|--------|------|
| `emp_codigo` | `tbempresa.codigo` | tbempresa | ON DELETE RESTRICT |
| `estadocivil_id` | `tbestadocivil.estadocivil_id` | tbestadocivil | ON DELETE RESTRICT |
| `cidade_id` | `tbcidade.cidade_id` | tbcidade | ON DELETE RESTRICT |
| `uf_ctps` | `tbuf.uf` | tbuf | ON DELETE RESTRICT |
| `admissao_tipo` | `tbtipoadmissao.codigo` | tbtipoadmissao | ON DELETE RESTRICT |
| `admissao_tipo_esocial` | `tbtipoadmissaoesocial.codigo` | tbtipoadmissaoesocial | ON DELETE RESTRICT |
| `admissao_vinculo` | `tbtipovinculo.codigo` | tbtipovinculo | ON DELETE RESTRICT |
| `grau_instrucao` | `tbescolaridade.codigo` | tbescolaridade | ON DELETE RESTRICT |

### Índices Criados

```sql
-- Índice único no CPF
CREATE UNIQUE INDEX idx_tbfuncionario_cpf ON tbfuncionario(cpf);

-- Índice composto (empresa + matrícula)
CONSTRAINT uk_tbfuncionario_emp_matricula UNIQUE (emp_codigo, matricula)

-- Índices de busca
CREATE INDEX idx_tbfuncionario_nome ON tbfuncionario USING gin (nome gin_trgm_ops);
CREATE INDEX idx_tbfuncionario_email ON tbfuncionario(email);
CREATE INDEX idx_tbfuncionario_admissao_data ON tbfuncionario(admissao_data);
CREATE INDEX idx_tbfuncionario_ativo ON tbfuncionario(ativo);
```

---

## 🗂️ Estrutura do JSON (Firebird)

### Exemplo de Registro

```json
{
  "EMP_CODIGO": "0002",
  "MATRICULA": "000651",
  "NOME": "ANTONIO DA SILVA",
  "NOMESOCIAL": null,
  "CPF": "00363035346",
  "PIS": "13951788193",
  "DTNASCIMENTO": "05.10.1983 00:00",
  "SEXO": "Masculino",
  "ESTADOCIVIL": "01",
  "ESTADOCIVIL_DESC": "Solteiro",
  "MAE": "EMILIA MARIA DA SILVA",
  "PAI": "HORACIO ANTONIO DA SILVA",
  "EMAIL": null,
  "DDD": null,
  "FONE": null,
  "CELULAR": null,
  "ENDERECO": "SITIO SANTANA",
  "NUMERO": "S/N",
  "COMPLEMENTO": null,
  "BAIRRO": "ZONA RURAL",
  "CEP": "63180000",
  "UF": "CE",
  "CIDADE_CODIGO": "01901",
  "CIDADE": "Barbalha",
  "CTPS_NUMERO": "00090827",
  "CTPS_SERIE": "00051",
  "CTPS_DV": null,
  "CTPS_UF": "CE",
  "CTPS_DTEXPEDICAO": "12.07.2000 00:00",
  "IDENTIDADENUMERO": "2000016002076",
  "IDENTIDADEORGAOEXPEDIDOR": "SSPCE",
  "IDENTIDADEDTEXPEDICAO": "29.07.2000 00:00",
  "TITULO": "61114800744",
  "ZONA": "031",
  "SECAO": "0065",
  "ADMISSAODATA": "01.03.2007 00:00",
  "ADMISSAOTIPO": "10",
  "ADMISSAOTIPO_DESC": "1º Emprego",
  "ADMISSAOTIPOESOCIAL": "1",
  "ADMISSAOTIPOESOCIAL_DESC": "Admissão",
  "ADMISSAOVINCULO": "10",
  "ADMISSAOVINCULO_DESC": "Trabalhador Urbano...",
  "DEMISSAO_DATA": "17.10.2008 00:00",
  "TEMDEFICIENCIA": 0,
  "PREENCHECOTADEFICIENCIA": 0,
  "DEFICIENCIAFISICA": 0,
  "DEFICIENCIAVISUAL": 0,
  "DEFICIENCIAAUDITIVA": 0,
  "DEFICIENCIAMENTAL": 0,
  "DEFICIENCIAINTELECTUAL": 0,
  "ESCOLARIDADE_CODIGO": "07",
  "GRAUINSTRUCAO_DESC": "Ensino médio completo",
  "CARGO_CODIGO": "003",
  "CARGO": "OPERADOR DE MÁQUINAS",
  "FUNCAO_CODIGO": null,
  "FUNCAO": null,
  "LOTACAO_CODIGO": "0030101",
  "LOTACAO": "SPP-FRASCOS E AMPOLAS"
}
```

---

## 🔄 Mapeamento Completo Campo a Campo

### 1. Identificação

| JSON (Firebird) | Supabase | Transformação | Validação |
|-----------------|----------|---------------|-----------|
| `EMP_CODIGO` | `emp_codigo` | Direto | ✅ Obrigatório, FK para tbempresa |
| `MATRICULA` | `matricula` | Direto | ✅ Obrigatório, UNIQUE com emp_codigo |
| `NOME` | `nome` | Direto | ✅ Obrigatório |
| `NOMESOCIAL` | `nome_social` | Direto | ⚪ Opcional |

### 2. Documentos

| JSON (Firebird) | Supabase | Transformação | Validação |
|-----------------|----------|---------------|-----------|
| `CPF` | `cpf` | `formatCPF()` | ✅ Obrigatório, UNIQUE |
| `PIS` | `pis` | Direto | ⚪ Opcional |

**Transformação CPF:**
```typescript
// Entrada: "00363035346"
// Saída:   "003.630.353-46"
```

### 3. Dados Pessoais

| JSON (Firebird) | Supabase | Transformação | Validação |
|-----------------|----------|---------------|-----------|
| `DTNASCIMENTO` | `dtnascimento` | `parseFirebirdDate()` | ⚪ Opcional |
| `SEXO` | `sexo` | Direto | ⚪ Opcional |
| `ESTADOCIVIL` | `estadocivil_id` | `mapEstadoCivilId()` | ⚪ Opcional, FK |
| `ESTADOCIVIL_DESC` | `estadocivil_descricao` | Direto | ⚪ Opcional |
| `MAE` | `mae_nome` | Direto | ⚪ Opcional |
| `PAI` | `pai_nome` | Direto | ⚪ Opcional |

**Transformação Data:**
```typescript
// Entrada: "05.10.1983 00:00"
// Saída:   "1983-10-05"
```

**Mapeamento Estado Civil:**
```typescript
'01' → 1 (Solteiro)
'02' → 2 (Casado)
'03' → 3 (Divorciado)
'04' → 4 (Separado)
'05' → 5 (Viúvo)
```

### 4. Contato

| JSON (Firebird) | Supabase | Transformação | Validação |
|-----------------|----------|---------------|-----------|
| `EMAIL` | `email` | Direto | ⚪ Opcional |
| `DDD` | `ddd` | Direto | ⚪ Opcional |
| `FONE` | `fone` | Direto | ⚪ Opcional |
| `CELULAR` | `celular` | Direto | ⚪ Opcional |

### 5. Endereço

| JSON (Firebird) | Supabase | Transformação | Validação |
|-----------------|----------|---------------|-----------|
| `ENDERECO` | `endereco` | Direto | ⚪ Opcional |
| `NUMERO` | `numero` | Direto | ⚪ Opcional |
| `COMPLEMENTO` | `complemento` | Direto | ⚪ Opcional |
| `BAIRRO` | `bairro` | Direto | ⚪ Opcional |
| `CEP` | `cep` | `formatCEP()` | ⚪ Opcional |
| `UF` | `cidade_uf` | Direto | ⚪ Opcional |
| `CIDADE_CODIGO` | ❌ Não usado | - | - |
| `CIDADE` | `cidade_nome` | Direto | ⚪ Opcional |
| - | `cidade_id` | `resolveCidadeId()` | ⚪ Opcional, FK |

**Transformação CEP:**
```typescript
// Entrada: "63180000"
// Saída:   "63180-000"
```

**Resolução cidade_id:**
```sql
SELECT cidade_id 
FROM tbcidade 
WHERE uf = 'CE' 
  AND UPPER(nome) = 'BARBALHA'
LIMIT 1
```

### 6. CTPS (Carteira de Trabalho)

| JSON (Firebird) | Supabase | Transformação | Validação |
|-----------------|----------|---------------|-----------|
| `CTPS_NUMERO` | `ctps_numero` | Direto | ⚪ Opcional |
| `CTPS_SERIE` | `ctps_serie` | Direto | ⚪ Opcional |
| `CTPS_DV` | `ctps_dv` | Direto | ⚪ Opcional |
| `CTPS_UF` | `uf_ctps` | Direto | ⚪ Opcional, FK para tbuf |
| `CTPS_DTEXPEDICAO` | `ctps_dtexpedicao` | `parseFirebirdDate()` | ⚪ Opcional |

### 7. RG (Identidade)

| JSON (Firebird) | Supabase | Transformação | Validação |
|-----------------|----------|---------------|-----------|
| `IDENTIDADENUMERO` | `identidade_numero` | Direto | ⚪ Opcional |
| `IDENTIDADEORGAOEXPEDIDOR` | `identidade_orgao_expedidor` | Direto | ⚪ Opcional |
| `IDENTIDADEDTEXPEDICAO` | `identidade_dtexpedicao` | `parseFirebirdDate()` | ⚪ Opcional |

### 8. Título de Eleitor

| JSON (Firebird) | Supabase | Transformação | Validação |
|-----------------|----------|---------------|-----------|
| `TITULO` | `titulo` | Direto | ⚪ Opcional |
| `ZONA` | `zona` | Direto | ⚪ Opcional |
| `SECAO` | `secao` | Direto | ⚪ Opcional |

### 9. Admissão

| JSON (Firebird) | Supabase | Transformação | Validação |
|-----------------|----------|---------------|-----------|
| `ADMISSAODATA` | `admissao_data` | `parseFirebirdDate()` | ⚪ Opcional |
| `ADMISSAOTIPO` | `admissao_tipo` | Direto | ⚪ Opcional, FK |
| `ADMISSAOTIPO_DESC` | ❌ Não armazenado | - | - |
| `ADMISSAOTIPOESOCIAL` | `admissao_tipo_esocial` | `padStart(2, '0')` | ⚪ Opcional, FK |
| `ADMISSAOTIPOESOCIAL_DESC` | ❌ Não armazenado | - | - |
| `ADMISSAOVINCULO` | `admissao_vinculo` | Direto | ⚪ Opcional, FK |
| `ADMISSAOVINCULO_DESC` | ❌ Não armazenado | - | - |

**Transformação admissao_tipo_esocial:**
```typescript
// Entrada: "1"
// Saída:   "01"
```

### 10. Demissão

| JSON (Firebird) | Supabase | Transformação | Validação |
|-----------------|----------|---------------|-----------|
| `DEMISSAO_DATA` | `dt_rescisao` | `parseFirebirdDate()` | ⚪ Opcional |

### 11. PCD (Pessoa com Deficiência)

| JSON (Firebird) | Supabase | Transformação | Validação |
|-----------------|----------|---------------|-----------|
| `TEMDEFICIENCIA` | `tem_deficiencia` | `numberToBoolean()` | ✅ Default: false |
| `PREENCHECOTADEFICIENCIA` | `preenche_cota_deficiencia` | `numberToBoolean()` | ✅ Default: false |
| `DEFICIENCIAFISICA` | `deficiencia_fisica` | `numberToBoolean()` | ✅ Default: false |
| `DEFICIENCIAVISUAL` | `deficiencia_visual` | `numberToBoolean()` | ✅ Default: false |
| `DEFICIENCIAAUDITIVA` | `deficiencia_auditiva` | `numberToBoolean()` | ✅ Default: false |
| `DEFICIENCIAMENTAL` | `deficiencia_mental` | `numberToBoolean()` | ✅ Default: false |
| `DEFICIENCIAINTELECTUAL` | `deficiencia_intelectual` | `numberToBoolean()` | ✅ Default: false |

**Transformação Boolean:**
```typescript
// Entrada: 0 → false
// Entrada: 1 → true
```

### 12. Escolaridade

| JSON (Firebird) | Supabase | Transformação | Validação |
|-----------------|----------|---------------|-----------|
| `ESCOLARIDADE_CODIGO` | `grau_instrucao` | `normalizeEscolaridadeCodigo()` | ⚪ Opcional, FK |
| `GRAUINSTRUCAO_DESC` | ❌ Não armazenado | - | - |

**Transformação Escolaridade:**
```typescript
// Entrada: "5"  → "05"
// Entrada: "07" → "07"
// Entrada: "12" → "12"
// Valida: 01-12
```

### 13. Campos Calculados

| JSON (Firebird) | Supabase | Transformação | Validação |
|-----------------|----------|---------------|-----------|
| - | `ativo` | `!DEMISSAO_DATA` | ✅ Default: true |

**Lógica:**
```typescript
// Se DEMISSAO_DATA existe e não é vazio → ativo = false
// Caso contrário → ativo = true
```

### 14. Campos NÃO Migrados (Informação Descritiva)

Estes campos do JSON **não são armazenados** no Supabase porque são descrições que podem ser obtidas via JOIN:

- `ESTADOCIVIL_DESC` → Obtido via JOIN com `tbestadocivil`
- `ADMISSAOTIPO_DESC` → Obtido via JOIN com `tbtipoadmissao`
- `ADMISSAOTIPOESOCIAL_DESC` → Obtido via JOIN com `tbtipoadmissaoesocial`
- `ADMISSAOVINCULO_DESC` → Obtido via JOIN com `tbtipovinculo`
- `GRAUINSTRUCAO_DESC` → Obtido via JOIN com `tbescolaridade`
- `CARGO_CODIGO`, `CARGO` → Não fazem parte de `tbfuncionario`
- `FUNCAO_CODIGO`, `FUNCAO` → Não fazem parte de `tbfuncionario`
- `LOTACAO_CODIGO`, `LOTACAO` → Não fazem parte de `tbfuncionario`

---

## ⚠️ Problemas Identificados no JSON

### 1. CPFs Inválidos

Alguns registros possuem CPF `"00000000000"`:

```json
{
  "MATRICULA": "000027",
  "NOME": "FRANCISCO UILTON DE ALMEIDA",
  "CPF": "00000000000"
}
```

**Solução:** Estes registros serão **ignorados** pela validação.

### 2. Campos Nulos em Massa

Alguns registros têm muitos campos nulos:

```json
{
  "ESTADOCIVIL": null,
  "ESTADOCIVIL_DESC": "Outro",
  "MAE": null,
  "PAI": null,
  "EMAIL": null,
  "ENDERECO": null,
  "UF": null,
  "CIDADE": null
}
```

**Solução:** Aceito, pois estes campos são opcionais.

### 3. Códigos de Escolaridade Inconsistentes

```json
"ESCOLARIDADE_CODIGO": "5"   // Sem zero à esquerda
"ESCOLARIDADE_CODIGO": "07"  // Com zero à esquerda
```

**Solução:** Função `normalizeEscolaridadeCodigo()` padroniza para 2 dígitos.

---

## 📈 Estatísticas do Arquivo JSON

- **Total de registros:** ~1.500+ (verificar arquivo completo)
- **Empresas únicas:** 2 (`0002`, `0004`)
- **Período:** 2002-2009 (baseado em datas de admissão/demissão)
- **Funcionários ativos:** ~0% (todos têm data de demissão)
- **CPFs inválidos:** ~10 registros com `00000000000`

---

## ✅ Validações Aplicadas

### Validação Obrigatória

```typescript
if (!record.emp_codigo) errors.push('emp_codigo é obrigatório');
if (!record.matricula) errors.push('matricula é obrigatória');
if (!record.nome) errors.push('nome é obrigatório');
if (!record.cpf) errors.push('cpf é obrigatório');
```

### Validação de CPF Inválido

```typescript
if (record.cpf === '000.000.000-00') {
  // Registro ignorado
}
```

---

## 🎯 Resumo de Transformações

| Tipo | Função | Entrada | Saída |
|------|--------|---------|-------|
| Data | `parseFirebirdDate()` | `"05.10.1983 00:00"` | `"1983-10-05"` |
| CPF | `formatCPF()` | `"00363035346"` | `"003.630.353-46"` |
| CEP | `formatCEP()` | `"63180000"` | `"63180-000"` |
| Boolean | `numberToBoolean()` | `0` ou `1` | `false` ou `true` |
| Estado Civil | `mapEstadoCivilId()` | `"01"` | `1` |
| Escolaridade | `normalizeEscolaridadeCodigo()` | `"5"` | `"05"` |
| Cidade | `resolveCidadeId()` | `"CE" + "Barbalha"` | `123` (ID) |

---

**Última atualização:** 2025-11-08  
**Autor:** Emanuel  
**Projeto:** FARMACE - Sistema de Gestão de Funcionários

