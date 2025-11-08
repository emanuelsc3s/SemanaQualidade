-- ================================================================
-- RPC: buscar_inscritos_por_departamento
-- ================================================================
--
-- DESCRIÇÃO:
-- Função RPC para buscar dados de inscrição por departamento.
-- Retorna quantidade de funcionários, inscritos, sem inscrição e percentual.
--
-- COMO EXECUTAR:
-- 1. Acessar: Supabase Dashboard → SQL Editor
-- 2. Colar este código completo
-- 3. Clicar em "Run" ou pressionar Ctrl+Enter
--
-- USO NO CÓDIGO:
-- await supabase.rpc('buscar_inscritos_por_departamento')
--
-- RETORNO:
-- lotacao: TEXT (departamento em MAIÚSCULAS)
-- total_funcionarios: BIGINT (total de funcionários ativos ou nulos)
-- total_inscritos: BIGINT (funcionários com inscrição confirmada)
-- sem_inscricao: BIGINT (funcionários sem inscrição)
-- percentual_adesao: NUMERIC (percentual com 1 casa decimal)
--
-- ================================================================

CREATE OR REPLACE FUNCTION buscar_inscritos_por_departamento()
RETURNS TABLE (
  lotacao TEXT,
  total_funcionarios BIGINT,
  total_inscritos BIGINT,
  sem_inscricao BIGINT,
  percentual_adesao NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
      UPPER(COALESCE(f.lotacao, 'Não informado')) AS lotacao,
      COUNT(DISTINCT f.matricula) AS total_funcionarios,
      COUNT(DISTINCT CASE
          WHEN c.corrida_id IS NOT NULL THEN f.matricula
      END) AS total_inscritos,
      COUNT(DISTINCT f.matricula)
        - COUNT(DISTINCT CASE
              WHEN c.corrida_id IS NOT NULL THEN f.matricula
          END) AS sem_inscricao,
      ROUND(
        (COUNT(DISTINCT CASE WHEN c.corrida_id IS NOT NULL THEN f.matricula END)::NUMERIC
         / NULLIF(COUNT(DISTINCT f.matricula), 0)) * 100,
        1
      ) AS percentual_adesao
  FROM
      tbfuncionario f
      LEFT JOIN tbcorrida c
          ON TRIM(c.matricula) = TRIM(f.matricula)
          AND c.deleted_at IS NULL
          AND c.status = 'Confirmada'
  WHERE
      (f.ativo IS TRUE OR f.ativo IS NULL)
  GROUP BY
      UPPER(COALESCE(f.lotacao, 'Não informado'))
  ORDER BY
      percentual_adesao DESC NULLS LAST,
      total_funcionarios DESC,
      lotacao;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- TESTE DA FUNÇÃO
-- ================================================================
-- Descomente a linha abaixo para testar após criar a função:
-- SELECT * FROM buscar_inscritos_por_departamento();
