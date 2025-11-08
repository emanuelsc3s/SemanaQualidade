-- =====================================================
-- VALIDAÇÃO PÓS-MIGRAÇÃO
-- =====================================================
-- 
-- Script para validar a integridade dos dados após
-- a migração de funcionários do Firebird para Supabase
-- 
-- Autor: Emanuel
-- Data: 2025-11-08
-- Projeto: FARMACE - Sistema de Gestão de Funcionários
-- 
-- EXECUÇÃO:
-- Execute este script no Supabase SQL Editor após
-- completar a migração de dados
-- =====================================================

-- =====================================================
-- 1. ESTATÍSTICAS GERAIS
-- =====================================================

SELECT '=== ESTATÍSTICAS GERAIS ===' as secao;

-- Total de funcionários
SELECT 
    'Total de funcionários' as metrica,
    COUNT(*) as valor
FROM tbfuncionario;

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

-- Distribuição por empresa
SELECT 
    'Distribuição por Empresa' as metrica,
    emp_codigo,
    COUNT(*) as total
FROM tbfuncionario
GROUP BY emp_codigo
ORDER BY total DESC;

-- =====================================================
-- 2. VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS
-- =====================================================

SELECT '=== VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS ===' as secao;

-- Verificar campos obrigatórios nulos
SELECT 
    COUNT(*) FILTER (WHERE emp_codigo IS NULL) as sem_emp_codigo,
    COUNT(*) FILTER (WHERE matricula IS NULL) as sem_matricula,
    COUNT(*) FILTER (WHERE nome IS NULL) as sem_nome,
    COUNT(*) FILTER (WHERE cpf IS NULL) as sem_cpf
FROM tbfuncionario;

-- Se algum valor acima for > 0, há problema!

-- =====================================================
-- 3. VALIDAÇÃO DE UNICIDADE
-- =====================================================

SELECT '=== VALIDAÇÃO DE UNICIDADE ===' as secao;

-- CPFs duplicados
SELECT 
    'CPFs Duplicados' as problema,
    cpf,
    COUNT(*) as ocorrencias
FROM tbfuncionario
GROUP BY cpf
HAVING COUNT(*) > 1;

-- Matrícula + Empresa duplicados
SELECT 
    'Matrícula+Empresa Duplicados' as problema,
    emp_codigo,
    matricula,
    COUNT(*) as ocorrencias
FROM tbfuncionario
GROUP BY emp_codigo, matricula
HAVING COUNT(*) > 1;

-- =====================================================
-- 4. VALIDAÇÃO DE FOREIGN KEYS
-- =====================================================

SELECT '=== VALIDAÇÃO DE FOREIGN KEYS ===' as secao;

-- Empresas inexistentes
SELECT 
    'Empresas inexistentes' as problema,
    f.emp_codigo,
    COUNT(*) as funcionarios_afetados
FROM tbfuncionario f
LEFT JOIN tbempresa e ON e.codigo = f.emp_codigo
WHERE e.codigo IS NULL
  AND f.emp_codigo IS NOT NULL
GROUP BY f.emp_codigo;

-- Estados civis inválidos
SELECT 
    'Estados civis inválidos' as problema,
    f.estadocivil_id,
    COUNT(*) as funcionarios_afetados
FROM tbfuncionario f
LEFT JOIN tbestadocivil ec ON ec.estadocivil_id = f.estadocivil_id
WHERE ec.estadocivil_id IS NULL
  AND f.estadocivil_id IS NOT NULL
GROUP BY f.estadocivil_id;

-- Cidades inexistentes
SELECT 
    'Cidades inexistentes' as problema,
    f.cidade_id,
    f.cidade_nome,
    f.cidade_uf,
    COUNT(*) as funcionarios_afetados
FROM tbfuncionario f
LEFT JOIN tbcidade c ON c.cidade_id = f.cidade_id
WHERE c.cidade_id IS NULL
  AND f.cidade_id IS NOT NULL
GROUP BY f.cidade_id, f.cidade_nome, f.cidade_uf;

-- UFs de CTPS inválidas
SELECT 
    'UFs de CTPS inválidas' as problema,
    f.uf_ctps,
    COUNT(*) as funcionarios_afetados
FROM tbfuncionario f
LEFT JOIN tbuf u ON u.uf = f.uf_ctps
WHERE u.uf IS NULL
  AND f.uf_ctps IS NOT NULL
GROUP BY f.uf_ctps;

-- Tipos de admissão inválidos
SELECT 
    'Tipos de admissão inválidos' as problema,
    f.admissao_tipo,
    COUNT(*) as funcionarios_afetados
FROM tbfuncionario f
LEFT JOIN tbtipoadmissao ta ON ta.codigo = f.admissao_tipo
WHERE ta.codigo IS NULL
  AND f.admissao_tipo IS NOT NULL
GROUP BY f.admissao_tipo;

-- Tipos de admissão eSocial inválidos
SELECT 
    'Tipos de admissão eSocial inválidos' as problema,
    f.admissao_tipo_esocial,
    COUNT(*) as funcionarios_afetados
FROM tbfuncionario f
LEFT JOIN tbtipoadmissaoesocial tae ON tae.codigo = f.admissao_tipo_esocial
WHERE tae.codigo IS NULL
  AND f.admissao_tipo_esocial IS NOT NULL
GROUP BY f.admissao_tipo_esocial;

-- Tipos de vínculo inválidos
SELECT 
    'Tipos de vínculo inválidos' as problema,
    f.admissao_vinculo,
    COUNT(*) as funcionarios_afetados
FROM tbfuncionario f
LEFT JOIN tbtipovinculo tv ON tv.codigo = f.admissao_vinculo
WHERE tv.codigo IS NULL
  AND f.admissao_vinculo IS NOT NULL
GROUP BY f.admissao_vinculo;

-- Escolaridade inválida
SELECT 
    'Escolaridade inválida' as problema,
    f.grau_instrucao,
    COUNT(*) as funcionarios_afetados
FROM tbfuncionario f
LEFT JOIN tbescolaridade e ON e.codigo = f.grau_instrucao
WHERE e.codigo IS NULL
  AND f.grau_instrucao IS NOT NULL
GROUP BY f.grau_instrucao;

-- =====================================================
-- 5. VALIDAÇÃO DE FORMATOS
-- =====================================================

SELECT '=== VALIDAÇÃO DE FORMATOS ===' as secao;

-- CPFs com formato inválido (deve ter 14 caracteres: XXX.XXX.XXX-XX)
SELECT 
    'CPFs com formato inválido' as problema,
    cpf,
    LENGTH(cpf) as tamanho,
    COUNT(*) as ocorrencias
FROM tbfuncionario
WHERE cpf IS NOT NULL
  AND LENGTH(cpf) <> 14
GROUP BY cpf, LENGTH(cpf);

-- CPFs com valor inválido (00000000000)
SELECT 
    'CPFs inválidos (zeros)' as problema,
    COUNT(*) as total
FROM tbfuncionario
WHERE cpf = '000.000.000-00';

-- CEPs com formato inválido (deve ter 9 caracteres: XXXXX-XXX)
SELECT 
    'CEPs com formato inválido' as problema,
    cep,
    LENGTH(cep) as tamanho,
    COUNT(*) as ocorrencias
FROM tbfuncionario
WHERE cep IS NOT NULL
  AND LENGTH(cep) <> 9
GROUP BY cep, LENGTH(cep);

-- Emails com formato suspeito (sem @)
SELECT 
    'Emails sem @' as problema,
    email,
    COUNT(*) as ocorrencias
FROM tbfuncionario
WHERE email IS NOT NULL
  AND email NOT LIKE '%@%'
GROUP BY email;

-- =====================================================
-- 6. VALIDAÇÃO DE DATAS
-- =====================================================

SELECT '=== VALIDAÇÃO DE DATAS ===' as secao;

-- Datas de nascimento futuras
SELECT 
    'Datas de nascimento futuras' as problema,
    cpf,
    nome,
    dtnascimento
FROM tbfuncionario
WHERE dtnascimento > CURRENT_DATE;

-- Datas de nascimento muito antigas (antes de 1900)
SELECT 
    'Datas de nascimento < 1900' as problema,
    cpf,
    nome,
    dtnascimento
FROM tbfuncionario
WHERE dtnascimento < '1900-01-01';

-- Admissão antes do nascimento
SELECT 
    'Admissão antes do nascimento' as problema,
    cpf,
    nome,
    dtnascimento,
    admissao_data
FROM tbfuncionario
WHERE admissao_data < dtnascimento;

-- Demissão antes da admissão
SELECT 
    'Demissão antes da admissão' as problema,
    cpf,
    nome,
    admissao_data,
    dt_rescisao
FROM tbfuncionario
WHERE dt_rescisao < admissao_data;

-- Admissão futura
SELECT 
    'Admissão futura' as problema,
    cpf,
    nome,
    admissao_data
FROM tbfuncionario
WHERE admissao_data > CURRENT_DATE;

-- =====================================================
-- 7. VALIDAÇÃO DE CONSISTÊNCIA
-- =====================================================

SELECT '=== VALIDAÇÃO DE CONSISTÊNCIA ===' as secao;

-- Funcionários marcados como ativos mas com data de demissão
SELECT 
    'Ativos com data de demissão' as problema,
    cpf,
    nome,
    ativo,
    dt_rescisao
FROM tbfuncionario
WHERE ativo = true
  AND dt_rescisao IS NOT NULL;

-- Funcionários marcados como inativos mas sem data de demissão
SELECT 
    'Inativos sem data de demissão' as problema,
    cpf,
    nome,
    ativo,
    dt_rescisao
FROM tbfuncionario
WHERE ativo = false
  AND dt_rescisao IS NULL;

-- Funcionários com deficiência mas sem especificar qual
SELECT 
    'Com deficiência mas sem tipo especificado' as problema,
    cpf,
    nome,
    tem_deficiencia,
    deficiencia_fisica,
    deficiencia_visual,
    deficiencia_auditiva,
    deficiencia_mental,
    deficiencia_intelectual
FROM tbfuncionario
WHERE tem_deficiencia = true
  AND deficiencia_fisica = false
  AND deficiencia_visual = false
  AND deficiencia_auditiva = false
  AND deficiencia_mental = false
  AND deficiencia_intelectual = false;

-- =====================================================
-- 8. ESTATÍSTICAS DETALHADAS
-- =====================================================

SELECT '=== ESTATÍSTICAS DETALHADAS ===' as secao;

-- Distribuição por sexo
SELECT 
    'Distribuição por Sexo' as metrica,
    sexo,
    COUNT(*) as total,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM tbfuncionario), 2) as percentual
FROM tbfuncionario
GROUP BY sexo
ORDER BY total DESC;

-- Distribuição por estado civil
SELECT 
    'Distribuição por Estado Civil' as metrica,
    ec.descricao as estado_civil,
    COUNT(*) as total,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM tbfuncionario), 2) as percentual
FROM tbfuncionario f
LEFT JOIN tbestadocivil ec ON ec.estadocivil_id = f.estadocivil_id
GROUP BY ec.descricao
ORDER BY total DESC;

-- Distribuição por escolaridade
SELECT 
    'Distribuição por Escolaridade' as metrica,
    e.descricao as escolaridade,
    COUNT(*) as total,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM tbfuncionario), 2) as percentual
FROM tbfuncionario f
LEFT JOIN tbescolaridade e ON e.codigo = f.grau_instrucao
GROUP BY e.descricao
ORDER BY total DESC;

-- Funcionários com deficiência
SELECT 
    'Funcionários com Deficiência' as metrica,
    COUNT(*) FILTER (WHERE tem_deficiencia = true) as com_deficiencia,
    COUNT(*) FILTER (WHERE preenche_cota_deficiencia = true) as preenche_cota,
    COUNT(*) FILTER (WHERE deficiencia_fisica = true) as fisica,
    COUNT(*) FILTER (WHERE deficiencia_visual = true) as visual,
    COUNT(*) FILTER (WHERE deficiencia_auditiva = true) as auditiva,
    COUNT(*) FILTER (WHERE deficiencia_mental = true) as mental,
    COUNT(*) FILTER (WHERE deficiencia_intelectual = true) as intelectual
FROM tbfuncionario;

-- Distribuição por UF
SELECT 
    'Distribuição por UF' as metrica,
    cidade_uf,
    COUNT(*) as total
FROM tbfuncionario
WHERE cidade_uf IS NOT NULL
GROUP BY cidade_uf
ORDER BY total DESC;

-- =====================================================
-- 9. RESUMO FINAL
-- =====================================================

SELECT '=== RESUMO FINAL ===' as secao;

SELECT 
    'RESUMO DA MIGRAÇÃO' as titulo,
    (SELECT COUNT(*) FROM tbfuncionario) as total_registros,
    (SELECT COUNT(*) FROM tbfuncionario WHERE ativo = true) as ativos,
    (SELECT COUNT(*) FROM tbfuncionario WHERE ativo = false) as inativos,
    (SELECT COUNT(DISTINCT emp_codigo) FROM tbfuncionario) as empresas,
    (SELECT COUNT(*) FROM tbfuncionario WHERE tem_deficiencia = true) as com_deficiencia,
    (SELECT COUNT(*) FROM tbfuncionario WHERE email IS NOT NULL) as com_email,
    (SELECT COUNT(*) FROM tbfuncionario WHERE celular IS NOT NULL) as com_celular;

-- =====================================================
-- FIM DO SCRIPT DE VALIDAÇÃO
-- =====================================================

-- INTERPRETAÇÃO DOS RESULTADOS:
-- 
-- ✅ SUCESSO: Se todas as queries de validação retornarem 0 registros
-- ⚠️  ATENÇÃO: Se houver alguns registros com problemas menores (emails, etc)
-- ❌ ERRO: Se houver violações de FK ou campos obrigatórios nulos
-- 
-- PRÓXIMOS PASSOS:
-- 1. Revisar todos os problemas encontrados
-- 2. Corrigir dados inconsistentes
-- 3. Re-executar validação
-- 4. Aplicar RLS policies (database/policies.sql)
-- 5. Fazer backup do banco de dados

