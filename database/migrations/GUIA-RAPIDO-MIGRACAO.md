# 🚀 Guia Rápido: Migração de Funcionários

## 📌 Resumo Executivo

Este guia fornece um passo a passo simplificado para migrar dados de funcionários do Firebird (arquivo JSON) para o Supabase PostgreSQL.

---

## 🎯 Objetivo

Migrar **todos os funcionários** do arquivo `database/firebird/funcionarios.json` para a tabela `tbfuncionario` no Supabase.

---

## ⚡ Início Rápido (3 Passos)

### 1️⃣ Configurar Ambiente

```bash
# Instalar dependências
npm install @supabase/supabase-js tsx

# Configurar credenciais
export SUPABASE_URL="https://dojavjvqvobnumebaouc.supabase.co"
export SUPABASE_SERVICE_KEY="sua_service_key_aqui"
```

### 2️⃣ Executar Migração

```bash
# Executar script TypeScript
npx tsx database/migrations/migrate-funcionarios-firebird-to-supabase.ts
```

### 3️⃣ Validar Dados

```bash
# No Supabase SQL Editor, executar:
# database/migrations/validacao-pos-migracao.sql
```

---

## 📂 Arquivos Criados

```
database/migrations/
├── migrate-funcionarios-firebird-to-supabase.ts  # ⭐ Script principal (TypeScript)
├── migrate-funcionarios-sql-alternative.sql      # 🔄 Alternativa SQL pura
├── json-to-csv-converter.ts                      # 🔧 Conversor JSON→CSV
├── validacao-pos-migracao.sql                    # ✅ Validação de dados
├── README-MIGRACAO.md                            # 📖 Documentação completa
├── ANALISE-MAPEAMENTO.md                         # 📊 Análise detalhada
└── GUIA-RAPIDO-MIGRACAO.md                       # ⚡ Este arquivo
```

---

## 🛠️ Métodos de Migração

### Método 1: TypeScript (Recomendado) ⭐

**Vantagens:**
- ✅ Automático e rápido
- ✅ Validação em tempo real
- ✅ Tratamento de erros robusto
- ✅ Barra de progresso
- ✅ Log de erros detalhado

**Como usar:**
```bash
npx tsx database/migrations/migrate-funcionarios-firebird-to-supabase.ts
```

**Saída esperada:**
```
🚀 Iniciando migração de funcionários Firebird → Supabase
✅ Conectado ao Supabase
✅ Arquivo lido com sucesso: 1234 registros encontrados
[████████████████████████████████████████] 100.0%
✅ Migração concluída!
📊 Total: 1234 | ✅ Sucesso: 1200 | ❌ Falhas: 10 | ⏭️ Ignorados: 24
```

---

### Método 2: SQL Puro 🔄

**Vantagens:**
- ✅ Não requer Node.js
- ✅ Execução direta no Supabase
- ✅ Controle total via SQL

**Como usar:**

**Passo 1:** Converter JSON para CSV
```bash
npx tsx database/migrations/json-to-csv-converter.ts
```

**Passo 2:** Executar SQL no Supabase
```sql
-- No Supabase SQL Editor
-- Copiar e colar: database/migrations/migrate-funcionarios-sql-alternative.sql
```

**Passo 3:** Fazer upload do CSV quando solicitado

---

## 📊 Mapeamento de Dados

### Transformações Principais

| Origem (JSON) | Destino (Supabase) | Transformação |
|---------------|-------------------|---------------|
| `"05.10.1983 00:00"` | `"1983-10-05"` | Conversão de data |
| `"00363035346"` | `"003.630.353-46"` | Formatação CPF |
| `"63180000"` | `"63180-000"` | Formatação CEP |
| `0` ou `1` | `false` ou `true` | Boolean |
| `"01"` (código) | `1` (ID) | Estado civil |
| `"CE" + "Barbalha"` | `123` (ID) | Lookup cidade |

### Campos Obrigatórios

- ✅ `emp_codigo` - Código da empresa
- ✅ `matricula` - Matrícula do funcionário
- ✅ `nome` - Nome completo
- ✅ `cpf` - CPF (único)

---

## ⚙️ Configurações

### Variáveis de Ambiente

```bash
# Obrigatórias
SUPABASE_URL=https://dojavjvqvobnumebaouc.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Opcionais (valores padrão)
BATCH_SIZE=50  # Tamanho do lote para inserções
```

### Onde Obter a Service Key

1. Acesse: https://supabase.com/dashboard/project/dojavjvqvobnumebaouc
2. Vá em: **Settings** → **API**
3. Copie: **service_role** key (não a anon key!)

---

## ✅ Checklist de Execução

### Antes da Migração

- [ ] Node.js 18+ instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] `SUPABASE_SERVICE_KEY` configurada
- [ ] Schema SQL executado no Supabase
- [ ] Tabelas auxiliares populadas (tbestadocivil, tbescolaridade, etc.)
- [ ] Arquivo `funcionarios.json` existe e é válido

### Durante a Migração

- [ ] Executar script de migração
- [ ] Acompanhar barra de progresso
- [ ] Verificar mensagens de erro (se houver)
- [ ] Aguardar conclusão (pode levar alguns minutos)

### Após a Migração

- [ ] Executar script de validação
- [ ] Verificar total de registros importados
- [ ] Revisar log de erros (se houver)
- [ ] Corrigir problemas identificados
- [ ] Aplicar RLS policies
- [ ] Fazer backup do banco de dados

---

## 🔍 Validação Rápida

### No Terminal (após migração)

```bash
# Verificar se o script foi executado com sucesso
# Deve mostrar estatísticas finais
```

### No Supabase SQL Editor

```sql
-- 1. Contar registros
SELECT COUNT(*) FROM tbfuncionario;

-- 2. Verificar CPFs únicos
SELECT cpf, COUNT(*) 
FROM tbfuncionario 
GROUP BY cpf 
HAVING COUNT(*) > 1;

-- 3. Funcionários ativos
SELECT COUNT(*) 
FROM tbfuncionario 
WHERE ativo = true;
```

---

## ⚠️ Problemas Comuns

### Erro: "SUPABASE_SERVICE_KEY não configurada"

**Solução:**
```bash
export SUPABASE_SERVICE_KEY="sua_key_aqui"
```

### Erro: "Arquivo não encontrado"

**Solução:**
```bash
# Execute da raiz do projeto
cd /home/emanuel/SemanaQualidade
npx tsx database/migrations/migrate-funcionarios-firebird-to-supabase.ts
```

### Erro: "duplicate key value violates unique constraint"

**Causa:** CPF duplicado no banco

**Solução:**
1. Verificar se o funcionário já existe
2. Atualizar ao invés de inserir
3. Ou limpar tabela antes: `DELETE FROM tbfuncionario;`

### Erro: "violates foreign key constraint"

**Causa:** Empresa não existe na tabela `tbempresa`

**Solução:**
1. Inserir empresa primeiro:
```sql
INSERT INTO tbempresa (codigo, razao_social, ativo)
VALUES ('0002', 'FARMACE', true);
```

---

## 📈 Performance

### Estimativas de Tempo

| Registros | Tempo Estimado |
|-----------|----------------|
| 100       | ~5 segundos    |
| 1.000     | ~30 segundos   |
| 10.000    | ~5 minutos     |

### Otimizações

- **Batch Size:** Ajuste para 100-200 em datasets grandes
- **Índices:** Desabilite temporariamente se muito lento
- **Conexão:** Use rede estável e rápida

---

## 🔒 Segurança

### Dados Sensíveis

⚠️ **IMPORTANTE:** Este script manipula dados sensíveis (CPF, PIS, documentos)

**Recomendações:**
1. ✅ Nunca commitar `SUPABASE_SERVICE_KEY` no Git
2. ✅ Executar em ambiente seguro
3. ✅ Deletar logs de erro após análise
4. ✅ Aplicar RLS após migração

### Aplicar RLS (Row Level Security)

```sql
-- No Supabase SQL Editor
-- Executar: database/policies.sql
```

---

## 📞 Suporte

### Documentação Completa

- **README-MIGRACAO.md** - Documentação detalhada
- **ANALISE-MAPEAMENTO.md** - Análise técnica completa

### Logs e Debugging

- **migration-errors.json** - Log de erros (gerado automaticamente)
- **Console output** - Mensagens em tempo real

### Contato

**Desenvolvedor:** Emanuel  
**Projeto:** FARMACE - Sistema de Gestão de Funcionários  
**Data:** 2025-11-08

---

## 🎯 Próximos Passos

Após migração bem-sucedida:

1. ✅ Validar dados (executar `validacao-pos-migracao.sql`)
2. ✅ Aplicar RLS policies (`database/policies.sql`)
3. ✅ Fazer backup do banco de dados
4. ✅ Atualizar aplicação frontend para usar novos dados
5. ✅ Testar autenticação com dados reais
6. ✅ Implementar máscaras de dados sensíveis na UI

---

## 📝 Notas Finais

- **Backup:** Sempre faça backup antes de migrar em produção
- **Teste:** Execute primeiro com amostra pequena (10-20 registros)
- **Validação:** Sempre execute o script de validação após migração
- **Documentação:** Mantenha este guia atualizado com suas experiências

---

**Última atualização:** 2025-11-08  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para uso

