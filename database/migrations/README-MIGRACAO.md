# 🔄 Migração de Funcionários: Firebird → Supabase PostgreSQL

## 📋 Visão Geral

Este diretório contém o script de migração automatizada que transfere dados de funcionários do arquivo JSON (exportado do Firebird 2.5) para a tabela `tbfuncionario` no Supabase PostgreSQL 15+.

---

## 🗂️ Navegação Rápida

**Novo aqui?** Comece pelo [Guia Rápido](./GUIA-RAPIDO-MIGRACAO.md) (3 passos simples)

**Quer entender tudo?** Você está no lugar certo! Continue lendo.

**Precisa de detalhes técnicos?** Veja a [Análise de Mapeamento](./ANALISE-MAPEAMENTO.md)

**Procurando um arquivo específico?** Consulte o [Índice](./INDEX.md)

---

## 📁 Arquivos

```
database/migrations/
├── migrate-funcionarios-firebird-to-supabase.ts  # Script principal de migração
├── README-MIGRACAO.md                            # Este arquivo
└── migration-errors.json                         # Log de erros (gerado após execução)
```

---

## 🎯 Objetivo

Migrar **todos os registros** de funcionários do arquivo `database/firebird/funcionarios.json` para a tabela `tbfuncionario` no Supabase, realizando:

1. ✅ **Transformação de dados**: Conversão de formatos (datas, booleanos, CPF, CEP)
2. ✅ **Validação**: Verificação de campos obrigatórios
3. ✅ **Mapeamento**: Resolução de IDs (estado civil, cidade)
4. ✅ **Inserção em lotes**: Performance otimizada com batch inserts
5. ✅ **Tratamento de erros**: Identificação e log de problemas
6. ✅ **Feedback em tempo real**: Barra de progresso e estatísticas

---

## 🔧 Pré-requisitos

### 1. Node.js e Dependências

```bash
# Node.js 18+ instalado
node --version  # Deve ser >= 18.0.0

# Instalar dependências
npm install @supabase/supabase-js tsx
```

### 2. Variáveis de Ambiente

Configure as credenciais do Supabase:

```bash
# Opção 1: Arquivo .env na raiz do projeto
echo "SUPABASE_URL=https://dojavjvqvobnumebaouc.supabase.co" >> .env
echo "SUPABASE_SERVICE_KEY=sua_service_key_aqui" >> .env

# Opção 2: Exportar diretamente no terminal
export SUPABASE_URL="https://dojavjvqvobnumebaouc.supabase.co"
export SUPABASE_SERVICE_KEY="sua_service_key_aqui"
```

⚠️ **IMPORTANTE**: Use a **Service Role Key** (não a anon key) para ter permissões de escrita.

### 3. Schema do Banco de Dados

Certifique-se de que o schema foi criado no Supabase:

```bash
# Execute o schema SQL no Supabase SQL Editor
# Arquivo: database/supabase/schema.sql
```

Verifique se as seguintes tabelas existem:
- ✅ `tbempresa`
- ✅ `tbestadocivil`
- ✅ `tbescolaridade`
- ✅ `tbtipoadmissao`
- ✅ `tbtipoadmissaoesocial`
- ✅ `tbtipovinculo`
- ✅ `tbuf`
- ✅ `tbcidade`
- ✅ `tbfuncionario`

---

## 🚀 Como Executar

### Método 1: Usando npx tsx (Recomendado)

```bash
# Na raiz do projeto
npx tsx database/migrations/migrate-funcionarios-firebird-to-supabase.ts
```

### Método 2: Usando ts-node

```bash
# Instalar ts-node globalmente
npm install -g ts-node

# Executar
ts-node database/migrations/migrate-funcionarios-firebird-to-supabase.ts
```

### Método 3: Compilar e executar

```bash
# Compilar TypeScript para JavaScript
npx tsc database/migrations/migrate-funcionarios-firebird-to-supabase.ts

# Executar JavaScript gerado
node database/migrations/migrate-funcionarios-firebird-to-supabase.js
```

---

## 📊 Saída Esperada

### Durante a Execução

```
🚀 Iniciando migração de funcionários Firebird → Supabase

🔌 Conectando ao Supabase...
✅ Conectado ao Supabase

📂 Lendo arquivo: /home/emanuel/SemanaQualidade/database/firebird/funcionarios.json
✅ Arquivo lido com sucesso: 1234 registros encontrados

⚙️  Processando em lotes de 50 registros...

📦 Total de lotes: 25

🔄 Iniciando inserção...

[████████████████████████████████████████] 100.0% | ✅ 1200 | ❌ 10 | ⏭️  24 | Total: 1234/1234

✅ Migração concluída!

═══════════════════════════════════════════════════════
                    RESUMO DA MIGRAÇÃO                 
═══════════════════════════════════════════════════════
📊 Total de registros:        1234
✅ Inseridos com sucesso:     1200
❌ Falharam:                  10
⏭️  Ignorados (validação):     24
═══════════════════════════════════════════════════════

🎉 Processo finalizado!
```

### Log de Erros (se houver)

Se ocorrerem erros, um arquivo `migration-errors.json` será criado:

```json
[
  {
    "record": {
      "cpf": "000.000.000-00",
      "nome": "FRANCISCO UILTON DE ALMEIDA",
      "matricula": "000027"
    },
    "error": "duplicate key value violates unique constraint \"idx_tbfuncionario_cpf\""
  }
]
```

---

## 🔍 Mapeamento de Campos

### Transformações Aplicadas

| Campo Firebird | Campo Supabase | Transformação |
|----------------|----------------|---------------|
| `DTNASCIMENTO` | `dtnascimento` | `"05.10.1983 00:00"` → `"1983-10-05"` |
| `CPF` | `cpf` | `"00363035346"` → `"003.630.353-46"` |
| `CEP` | `cep` | `"63180000"` → `"63180-000"` |
| `TEMDEFICIENCIA` | `tem_deficiencia` | `0` → `false`, `1` → `true` |
| `ESTADOCIVIL` | `estadocivil_id` | `"01"` → `1` (FK para tbestadocivil) |
| `ESCOLARIDADE_CODIGO` | `grau_instrucao` | `"5"` → `"05"` (normalizado) |
| `ADMISSAOTIPOESOCIAL` | `admissao_tipo_esocial` | `"1"` → `"01"` (padded) |
| `CIDADE` + `UF` | `cidade_id` | Lookup em `tbcidade` |

### Campos Calculados

- **`ativo`**: `true` se `DEMISSAO_DATA` for `null`, caso contrário `false`
- **`cidade_id`**: Resolvido via query em `tbcidade` usando `UF` + `nome da cidade`

---

## ⚙️ Configurações

### Tamanho do Lote (Batch Size)

Por padrão, o script insere **50 registros por vez**. Para alterar:

```typescript
// No arquivo migrate-funcionarios-firebird-to-supabase.ts
const BATCH_SIZE = 100; // Altere para o valor desejado
```

**Recomendações:**
- **50-100**: Ideal para a maioria dos casos
- **10-30**: Se houver muitos erros de constraint
- **100-200**: Para datasets muito grandes (>10k registros)

---

## 🛠️ Tratamento de Erros

### Tipos de Erros Comuns

#### 1. **CPF Duplicado**

```
duplicate key value violates unique constraint "idx_tbfuncionario_cpf"
```

**Solução**: Verificar se o funcionário já existe no banco. Pode ser necessário atualizar ao invés de inserir.

#### 2. **Violação de Foreign Key**

```
insert or update on table "tbfuncionario" violates foreign key constraint "fk_tbfuncionario_empresa"
```

**Solução**: Garantir que `emp_codigo` existe na tabela `tbempresa`.

#### 3. **Campo Obrigatório Nulo**

```
null value in column "cpf" violates not-null constraint
```

**Solução**: O registro será ignorado automaticamente pela validação.

#### 4. **Formato de Data Inválido**

```
invalid input syntax for type date
```

**Solução**: A função `parseFirebirdDate()` trata isso retornando `null`.

---

## 📈 Performance

### Estimativas de Tempo

| Registros | Tempo Estimado | Batch Size |
|-----------|----------------|------------|
| 100       | ~5 segundos    | 50         |
| 1.000     | ~30 segundos   | 50         |
| 10.000    | ~5 minutos     | 100        |
| 100.000   | ~45 minutos    | 200        |

**Fatores que afetam:**
- Velocidade da conexão com Supabase
- Complexidade das validações
- Número de lookups (cidade_id)
- Constraints e índices no banco

---

## 🔒 Segurança

### Dados Sensíveis

O script manipula dados sensíveis (CPF, PIS, documentos). **Recomendações:**

1. ✅ **Nunca commitar** a `SUPABASE_SERVICE_KEY` no Git
2. ✅ Usar variáveis de ambiente
3. ✅ Executar em ambiente seguro
4. ✅ Deletar logs de erro após análise
5. ✅ Aplicar RLS (Row Level Security) no Supabase após migração

### RLS (Row Level Security)

Após a migração, ative as políticas de segurança:

```sql
-- No Supabase SQL Editor
-- Arquivo: database/policies.sql
```

---

## 🧪 Testes

### Teste com Amostra Pequena

Antes de migrar todos os dados, teste com uma amostra:

```typescript
// Edite o arquivo migrate-funcionarios-firebird-to-supabase.ts
// Linha ~380 (aproximadamente)

const funcionarios: FuncionarioFirebird[] = (jsonData.RecordSet || []).slice(0, 10); // Apenas 10 registros
```

### Validação Pós-Migração

```sql
-- 1. Contar registros
SELECT COUNT(*) FROM tbfuncionario;

-- 2. Verificar CPFs únicos
SELECT cpf, COUNT(*) 
FROM tbfuncionario 
GROUP BY cpf 
HAVING COUNT(*) > 1;

-- 3. Verificar campos obrigatórios
SELECT 
  COUNT(*) FILTER (WHERE nome IS NULL) as sem_nome,
  COUNT(*) FILTER (WHERE cpf IS NULL) as sem_cpf,
  COUNT(*) FILTER (WHERE emp_codigo IS NULL) as sem_empresa
FROM tbfuncionario;

-- 4. Distribuição por empresa
SELECT emp_codigo, COUNT(*) as total
FROM tbfuncionario
GROUP BY emp_codigo
ORDER BY total DESC;

-- 5. Funcionários ativos vs inativos
SELECT 
  COUNT(*) FILTER (WHERE ativo = true) as ativos,
  COUNT(*) FILTER (WHERE ativo = false) as inativos
FROM tbfuncionario;
```

---

## 🐛 Troubleshooting

### Problema: "SUPABASE_SERVICE_KEY não configurada"

**Solução:**
```bash
export SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Problema: "Arquivo não encontrado"

**Solução:**
```bash
# Verifique se o arquivo existe
ls -la database/firebird/funcionarios.json

# Execute o script da raiz do projeto
cd /home/emanuel/SemanaQualidade
npx tsx database/migrations/migrate-funcionarios-firebird-to-supabase.ts
```

### Problema: "Cannot find module '@supabase/supabase-js'"

**Solução:**
```bash
npm install @supabase/supabase-js
```

### Problema: Muitos erros de constraint

**Solução:**
1. Verifique se as tabelas auxiliares estão populadas (tbestadocivil, tbescolaridade, etc.)
2. Execute o schema.sql completo
3. Reduza o BATCH_SIZE para 10-20

---

## 📝 Checklist de Execução

- [ ] Node.js 18+ instalado
- [ ] Dependências instaladas (`@supabase/supabase-js`, `tsx`)
- [ ] `SUPABASE_SERVICE_KEY` configurada
- [ ] Schema SQL executado no Supabase
- [ ] Tabelas auxiliares populadas
- [ ] Arquivo `funcionarios.json` existe
- [ ] Teste com amostra pequena (10 registros)
- [ ] Executar migração completa
- [ ] Validar dados no Supabase
- [ ] Aplicar RLS policies
- [ ] Deletar logs de erro sensíveis
- [ ] Backup do banco de dados

---

## 📞 Suporte

**Desenvolvedor:** Emanuel  
**Projeto:** FARMACE - Sistema de Gestão de Funcionários  
**Data:** 2025-11-08

---

**Última atualização:** 2025-11-08  
**Versão do Script:** 1.0.0

