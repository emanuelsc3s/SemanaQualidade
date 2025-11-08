-- ================================================================
-- FUNÇÃO GENÉRICA: exec_sql
-- ================================================================
--
-- DESCRIÇÃO:
-- Função que permite executar SQL arbitrário via RPC
-- Você cria ESTA função UMA ÚNICA VEZ no Supabase
-- Depois pode executar qualquer SQL direto do TypeScript
--
-- COMO EXECUTAR (APENAS 1 VEZ):
-- 1. Acessar: Supabase Dashboard → SQL Editor
-- 2. Colar este código
-- 3. Clicar em "Run"
--
-- USO NO TYPESCRIPT:
-- const { data } = await supabase.rpc('exec_sql', {
--   sql_query: 'SELECT * FROM ...'
-- })
--
-- ⚠️ ATENÇÃO: Use apenas em desenvolvimento ou com validação
-- ================================================================

CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Executa a query e retorna resultado como JSONB
  EXECUTE format('SELECT JSONB_AGG(row_to_json(t)) FROM (%s) t', sql_query) INTO result;
  RETURN COALESCE(result, '[]'::JSONB);
END;
$$;

-- ================================================================
-- TESTE (opcional)
-- ================================================================
-- SELECT exec_sql('SELECT 1 as teste, 2 as valor');
