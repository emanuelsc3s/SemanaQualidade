-- =====================================================
-- LIMPEZA DE DADOS DE TESTE
-- =====================================================
-- 
-- Script para limpar dados de teste da tabela tbfuncionario
-- 
-- ⚠️  ATENÇÃO: Este script DELETA dados permanentemente!
-- Use apenas em ambiente de desenvolvimento/teste
-- 
-- Autor: Emanuel
-- Data: 2025-11-08
-- Projeto: FARMACE - Sistema de Gestão de Funcionários
-- =====================================================

-- =====================================================
-- OPÇÃO 1: LIMPAR TODOS OS FUNCIONÁRIOS
-- =====================================================

-- ⚠️  CUIDADO: Isto remove TODOS os funcionários!
-- Descomente apenas se tiver certeza:

-- DELETE FROM tbfuncionario;

-- Verificar se foi deletado
-- SELECT COUNT(*) as total_funcionarios FROM tbfuncionario;

-- =====================================================
-- OPÇÃO 2: LIMPAR APENAS FUNCIONÁRIOS DE TESTE
-- =====================================================

-- Deletar funcionários com CPF inválido (zeros)
DELETE FROM tbfuncionario
WHERE cpf = '000.000.000-00';

-- Verificar quantos foram deletados
SELECT 'Funcionários com CPF inválido deletados' as acao;

-- =====================================================
-- OPÇÃO 3: LIMPAR FUNCIONÁRIOS DE EMPRESA ESPECÍFICA
-- =====================================================

-- Exemplo: Deletar funcionários da empresa '0002'
-- Descomente e ajuste o código da empresa:

-- DELETE FROM tbfuncionario
-- WHERE emp_codigo = '0002';

-- SELECT 'Funcionários da empresa 0002 deletados' as acao;

-- =====================================================
-- OPÇÃO 4: LIMPAR FUNCIONÁRIOS INATIVOS
-- =====================================================

-- Deletar apenas funcionários inativos (com data de demissão)
-- Descomente se necessário:

-- DELETE FROM tbfuncionario
-- WHERE ativo = false;

-- SELECT 'Funcionários inativos deletados' as acao;

-- =====================================================
-- OPÇÃO 5: LIMPAR FUNCIONÁRIOS POR PERÍODO
-- =====================================================

-- Deletar funcionários admitidos antes de uma data específica
-- Exemplo: antes de 2010
-- Descomente e ajuste a data:

-- DELETE FROM tbfuncionario
-- WHERE admissao_data < '2010-01-01';

-- SELECT 'Funcionários admitidos antes de 2010 deletados' as acao;

-- =====================================================
-- OPÇÃO 6: LIMPAR FUNCIONÁRIOS SEM DADOS ESSENCIAIS
-- =====================================================

-- Deletar funcionários sem email E sem celular
-- Descomente se necessário:

-- DELETE FROM tbfuncionario
-- WHERE (email IS NULL OR email = '')
--   AND (celular IS NULL OR celular = '');

-- SELECT 'Funcionários sem contato deletados' as acao;

-- =====================================================
-- OPÇÃO 7: LIMPAR DUPLICATAS (MANTER APENAS O PRIMEIRO)
-- =====================================================

-- Deletar CPFs duplicados, mantendo apenas o primeiro registro
-- Descomente se necessário:

-- DELETE FROM tbfuncionario
-- WHERE funcionario_id NOT IN (
--     SELECT MIN(funcionario_id)
--     FROM tbfuncionario
--     GROUP BY cpf
-- );

-- SELECT 'Duplicatas de CPF deletadas' as acao;

-- =====================================================
-- OPÇÃO 8: RESETAR SEQUÊNCIA DE IDs
-- =====================================================

-- Resetar a sequência de IDs após deletar registros
-- Descomente se necessário:

-- SELECT setval('tbfuncionario_funcionario_id_seq', 
--                COALESCE((SELECT MAX(funcionario_id) FROM tbfuncionario), 0) + 1, 
--                false);

-- SELECT 'Sequência de IDs resetada' as acao;

-- =====================================================
-- OPÇÃO 9: TRUNCATE (LIMPAR TUDO E RESETAR IDs)
-- =====================================================

-- ⚠️  CUIDADO: Isto remove TODOS os funcionários E reseta os IDs!
-- Use apenas se quiser começar do zero
-- Descomente apenas se tiver certeza:

-- TRUNCATE TABLE tbfuncionario RESTART IDENTITY CASCADE;

-- SELECT 'Tabela tbfuncionario truncada' as acao;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Contar registros restantes
SELECT 
    'Total de funcionários restantes' as metrica,
    COUNT(*) as valor
FROM tbfuncionario;

-- Distribuição por empresa
SELECT 
    'Distribuição por empresa' as metrica,
    emp_codigo,
    COUNT(*) as total
FROM tbfuncionario
GROUP BY emp_codigo
ORDER BY total DESC;

-- Funcionários ativos vs inativos
SELECT 
    'Funcionários ATIVOS' as metrica,
    COUNT(*) as valor
FROM tbfuncionario
WHERE ativo = true

UNION ALL

SELECT 
    'Funcionários INATIVOS' as metrica,
    COUNT(*) as valor
FROM tbfuncionario
WHERE ativo = false;

-- =====================================================
-- BACKUP ANTES DE DELETAR (RECOMENDADO)
-- =====================================================

-- Antes de executar qualquer DELETE, considere fazer backup:

-- OPÇÃO A: Exportar para CSV (via Supabase Dashboard)
-- 1. Vá para Table Editor
-- 2. Selecione tbfuncionario
-- 3. Clique em "Export" > "CSV"

-- OPÇÃO B: Criar tabela de backup
-- CREATE TABLE tbfuncionario_backup AS 
-- SELECT * FROM tbfuncionario;

-- Para restaurar:
-- INSERT INTO tbfuncionario 
-- SELECT * FROM tbfuncionario_backup;

-- =====================================================
-- EXEMPLOS DE USO
-- =====================================================

-- EXEMPLO 1: Limpar apenas dados de teste (CPFs inválidos)
-- DELETE FROM tbfuncionario WHERE cpf = '000.000.000-00';

-- EXEMPLO 2: Limpar tudo e começar do zero
-- TRUNCATE TABLE tbfuncionario RESTART IDENTITY CASCADE;

-- EXEMPLO 3: Limpar funcionários de uma empresa específica
-- DELETE FROM tbfuncionario WHERE emp_codigo = '0002';

-- EXEMPLO 4: Limpar funcionários inativos antigos
-- DELETE FROM tbfuncionario 
-- WHERE ativo = false 
--   AND dt_rescisao < '2015-01-01';

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================

-- 1. SEMPRE faça backup antes de deletar dados em produção
-- 2. Teste primeiro em ambiente de desenvolvimento
-- 3. Use transações para poder fazer rollback:
--    BEGIN;
--    DELETE FROM tbfuncionario WHERE ...;
--    -- Verificar se está correto
--    SELECT COUNT(*) FROM tbfuncionario;
--    -- Se estiver OK:
--    COMMIT;
--    -- Se não estiver OK:
--    ROLLBACK;

-- 4. Considere usar soft delete ao invés de DELETE:
--    UPDATE tbfuncionario SET ativo = false WHERE ...;

-- 5. Verifique dependências antes de deletar:
--    SELECT * FROM information_schema.table_constraints
--    WHERE constraint_type = 'FOREIGN KEY'
--      AND table_name = 'tbfuncionario';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- PRÓXIMOS PASSOS APÓS LIMPEZA:
-- 1. Verificar se os dados corretos foram deletados
-- 2. Executar validacao-pos-migracao.sql
-- 3. Re-executar migração se necessário
-- 4. Aplicar RLS policies
-- 5. Fazer backup do banco limpo

