# 🔄 Fluxo de Execução - Aba "Inscritos por Depto"

## ✅ Já Está Implementado!

O SQL customizado via RPC é executado automaticamente quando você clica na aba. Veja o fluxo:

---

## 📊 Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USUÁRIO CLICA NA ABA "Inscritos por Depto"             │
│    Arquivo: src/pages/DepartamentoDashboardCorrida.tsx     │
│    Linha: ~1117 (TabsContent value="inscritos")            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. React detecta mudança de aba (setAbaAtiva('inscritos')) │
│    Estado atualizado: abaAtiva = 'inscritos'               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. useEffect detecta mudança (linha 129-135)               │
│                                                             │
│    useEffect(() => {                                        │
│      if (abaAtiva === 'inscritos' && dadosInscritos === []) │
│        carregarDadosInscritos() ← CHAMA AQUI!              │
│    }, [abaAtiva])                                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. carregarDadosInscritos() (linha 174-186)                │
│                                                             │
│    - setLoadingInscritos(true)   ← Mostra loading          │
│    - await buscarDadosInscritosPorDepartamento()           │
│    - setDadosInscritos(dados)    ← Atualiza estado         │
│    - setLoadingInscritos(false)                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. buscarDadosInscritosPorDepartamento() (serviço)         │
│    Arquivo: src/services/inscricaoCorridaSupabaseService.ts│
│    Linha: 462-525                                           │
│                                                             │
│    const sqlQuery = `                                       │
│      SELECT                                                 │
│        UPPER(COALESCE(f.lotacao, ...)) AS lotacao,         │
│        COUNT(DISTINCT f.matricula) AS total_funcionarios,  │
│        COUNT(...) AS total_inscritos,                      │
│        COUNT(...) AS sem_inscricao,                        │
│        ROUND(...) AS percentual_adesao                     │
│      FROM tbfuncionario f                                  │
│      LEFT JOIN tbcorrida c ON ...                          │
│      WHERE (f.ativo IS TRUE OR f.ativo IS NULL)            │
│      GROUP BY ...                                           │
│      ORDER BY percentual_adesao DESC                        │
│    `                                                        │
│                                                             │
│    const { data, error } = await supabase.rpc('exec_sql', {│
│      sql_query: sqlQuery  ← SQL CUSTOMIZADO AQUI!         │
│    })                                                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Supabase executa função exec_sql                        │
│    (criada em: database/supabase/exec_sql_function.sql)    │
│                                                             │
│    CREATE FUNCTION exec_sql(sql_query TEXT)                │
│    - Recebe o SQL como parâmetro                           │
│    - Executa no PostgreSQL                                 │
│    - Retorna JSONB com resultados                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Dados retornam para o serviço                           │
│    Formato:                                                 │
│    [                                                        │
│      {                                                      │
│        lotacao: "GERÊNCIA TÉCNICA",                        │
│        total_funcionarios: 25,                             │
│        total_inscritos: 20,                                │
│        sem_inscricao: 5,                                   │
│        percentual_adesao: 80.0                             │
│      },                                                     │
│      ...                                                    │
│    ]                                                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. setDadosInscritos(data) atualiza estado React           │
│    - dadosInscritos agora contém os dados                  │
│    - loadingInscritos = false                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. React renderiza a tabela (linha 1144-1325)              │
│                                                             │
│    Desktop: Tabela 5 colunas                               │
│    ┌────────────┬──────────┬──────────┬───────────┬──────┐│
│    │ Depto      │ Total    │ Com Insc │ Sem Insc  │ %    ││
│    ├────────────┼──────────┼──────────┼───────────┼──────┤│
│    │ GERÊNCIA   │    25    │   20 🟢  │    5 🔴   │ 80%  ││
│    └────────────┴──────────┴──────────┴───────────┴──────┘│
│                                                             │
│    Mobile: Cards 2x2                                        │
│    ┌──────────────────────────────┐                        │
│    │ GERÊNCIA TÉCNICA             │                        │
│    ├──────────────┬───────────────┤                        │
│    │ Total: 25    │ Com: 20 🟢    │                        │
│    ├──────────────┼───────────────┤                        │
│    │ Sem: 5 🔴    │ Adesão: 80%   │                        │
│    └──────────────┴───────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Código-Fonte Relevante

### 1. Detecção de clique na aba
**Arquivo:** `src/pages/DepartamentoDashboardCorrida.tsx:129-135`
```typescript
useEffect(() => {
  if (abaAtiva === 'tipo' && dadosTipoParticipacao.length === 0) {
    carregarDadosTipoParticipacao()
  } else if (abaAtiva === 'inscritos' && dadosInscritos.length === 0) {
    carregarDadosInscritos() // ← TRIGGER AQUI
  }
}, [abaAtiva])
```

### 2. Função de carregamento
**Arquivo:** `src/pages/DepartamentoDashboardCorrida.tsx:174-186`
```typescript
const carregarDadosInscritos = async () => {
  try {
    setLoadingInscritos(true)
    setErrorInscritos(null)
    const dados = await buscarDadosInscritosPorDepartamento()
    setDadosInscritos(dados)
  } catch (err) {
    console.error('Erro ao carregar dados de inscritos:', err)
    setErrorInscritos('Erro ao carregar dados. Tente novamente.')
  } finally {
    setLoadingInscritos(false)
  }
}
```

### 3. Execução do SQL customizado
**Arquivo:** `src/services/inscricaoCorridaSupabaseService.ts:462-525`
```typescript
export async function buscarDadosInscritosPorDepartamento() {
  const sqlQuery = `
    SELECT
        UPPER(COALESCE(f.lotacao, 'Não informado')) AS lotacao,
        COUNT(DISTINCT f.matricula) AS total_funcionarios,
        COUNT(DISTINCT CASE WHEN c.corrida_id IS NOT NULL THEN f.matricula END) AS total_inscritos,
        COUNT(DISTINCT f.matricula) - COUNT(DISTINCT CASE WHEN c.corrida_id IS NOT NULL THEN f.matricula END) AS sem_inscricao,
        ROUND((COUNT(DISTINCT CASE WHEN c.corrida_id IS NOT NULL THEN f.matricula END)::NUMERIC / NULLIF(COUNT(DISTINCT f.matricula), 0)) * 100, 1) AS percentual_adesao
    FROM tbfuncionario f
    LEFT JOIN tbcorrida c ON TRIM(c.matricula) = TRIM(f.matricula) AND c.deleted_at IS NULL AND c.status = 'Confirmada'
    WHERE (f.ativo IS TRUE OR f.ativo IS NULL)
    GROUP BY UPPER(COALESCE(f.lotacao, 'Não informado'))
    ORDER BY percentual_adesao DESC NULLS LAST, total_funcionarios DESC, lotacao
  `

  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: sqlQuery  // ← SQL EXECUTADO AQUI
  })

  return data
}
```

---

## ✅ Checklist - Está Tudo Pronto

- [x] **useEffect detecta clique na aba** (`abaAtiva === 'inscritos'`)
- [x] **Função carregarDadosInscritos() chamada**
- [x] **SQL customizado definido no código**
- [x] **Chamada RPC configurada** (`.rpc('exec_sql', { sql_query })`)
- [x] **Interface TypeScript atualizada** (campo `sem_inscricao`)
- [x] **Tabela renderiza os dados** (5 colunas no desktop)
- [x] **Cards mobile atualizados** (grid 2x2)

---

## 🚨 Único Requisito Pendente

**Criar a função `exec_sql` no Supabase (1 única vez):**

1. Supabase Dashboard → SQL Editor
2. Executar: `database/supabase/exec_sql_function.sql`
3. Pronto! ✅

Após isso, ao clicar na aba "Inscritos por Depto", o SQL será executado automaticamente!

---

## 🎯 Console Logs Esperados

Quando você clicar na aba, verá no console:

```
🔍 [Dashboard Inscritos/Departamento] Executando SQL via RPC...
✅ [Dashboard Inscritos/Departamento] 42 departamentos retornados
📈 [Dashboard Inscritos/Departamento] Top 3 departamentos por adesão: ["GERÊNCIA: 80.0%", "RH: 75.5%", "TI: 70.2%"]
```

---

**Resumo:** Tudo já está conectado! Só falta criar a função `exec_sql` no Supabase.
