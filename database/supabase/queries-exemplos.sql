-- =====================================================
-- QUERIES DE EXEMPLO - Sistema de Funcionários FARMACE
-- =====================================================
-- Este arquivo contém exemplos práticos de queries
-- para uso com o schema PostgreSQL
-- =====================================================

-- =====================================================
-- 1. CONSULTAS BÁSICAS
-- =====================================================

-- Listar todos os funcionários ativos com cargo e lotação
SELECT
    matricula,
    nome,
    cpf,
    email,
    cargo,
    lotacao,
    admissaodata
FROM v_funcionarios_ativos
ORDER BY nome;

-- Buscar funcionário por CPF
SELECT * FROM v_funcionarios_completo
WHERE cpf = '123.456.789-00';

-- Buscar funcionários por nome (busca parcial)
SELECT matricula, nome, email, cargo
FROM v_funcionarios_ativos
WHERE nome ILIKE '%maria%'
ORDER BY nome;

-- Funcionários por empresa
SELECT emp_codigo, COUNT(*) as total_funcionarios
FROM v_funcionarios_ativos
GROUP BY emp_codigo
ORDER BY total_funcionarios DESC;

-- =====================================================
-- 2. CONSULTAS POR CARGO/LOTAÇÃO/FUNÇÃO
-- =====================================================

-- Funcionários de um cargo específico
SELECT matricula, nome, email, lotacao
FROM v_funcionarios_ativos
WHERE cargo ILIKE '%analista%'
ORDER BY nome;

-- Funcionários de uma lotação específica
SELECT matricula, nome, cargo, email
FROM v_funcionarios_ativos
WHERE lotacao_codigo = 10
ORDER BY nome;

-- Distribuição de funcionários por cargo
SELECT
    cargo,
    COUNT(*) as quantidade
FROM v_funcionarios_ativos
WHERE cargo IS NOT NULL
GROUP BY cargo
ORDER BY quantidade DESC;

-- Funcionários com função (além do cargo)
SELECT matricula, nome, cargo, funcao
FROM v_funcionarios_ativos
WHERE funcao IS NOT NULL
ORDER BY nome;

-- =====================================================
-- 3. CONSULTAS POR DADOS DEMOGRÁFICOS
-- =====================================================

-- Distribuição por sexo
SELECT
    sexo,
    COUNT(*) as quantidade,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM v_funcionarios_ativos), 2) as percentual
FROM v_funcionarios_ativos
GROUP BY sexo;

-- Distribuição por estado civil
SELECT
    estadocivil_desc,
    COUNT(*) as quantidade
FROM v_funcionarios_ativos
GROUP BY estadocivil_desc
ORDER BY quantidade DESC;

-- Distribuição por faixa etária
SELECT
    CASE
        WHEN EXTRACT(YEAR FROM AGE(dtnascimento)) < 25 THEN 'Até 24 anos'
        WHEN EXTRACT(YEAR FROM AGE(dtnascimento)) BETWEEN 25 AND 34 THEN '25-34 anos'
        WHEN EXTRACT(YEAR FROM AGE(dtnascimento)) BETWEEN 35 AND 44 THEN '35-44 anos'
        WHEN EXTRACT(YEAR FROM AGE(dtnascimento)) BETWEEN 45 AND 54 THEN '45-54 anos'
        ELSE '55+ anos'
    END as faixa_etaria,
    COUNT(*) as quantidade
FROM v_funcionarios_ativos
WHERE dtnascimento IS NOT NULL
GROUP BY faixa_etaria
ORDER BY faixa_etaria;

-- Idade média dos funcionários
SELECT
    ROUND(AVG(EXTRACT(YEAR FROM AGE(dtnascimento))), 1) as idade_media
FROM v_funcionarios_ativos
WHERE dtnascimento IS NOT NULL;

-- =====================================================
-- 4. CONSULTAS POR ESCOLARIDADE
-- =====================================================

-- Distribuição por nível de escolaridade
SELECT
    grauinstrucao_desc,
    COUNT(*) as quantidade
FROM v_funcionarios_ativos
WHERE grauinstrucao_desc IS NOT NULL
GROUP BY grauinstrucao_desc
ORDER BY quantidade DESC;

-- Funcionários com nível superior ou mais
SELECT matricula, nome, cargo, grauinstrucao_desc
FROM v_funcionarios_ativos
WHERE escolaridade_codigo IN ('09', '10', '11', '12')
ORDER BY nome;

-- =====================================================
-- 5. CONSULTAS POR TEMPO DE EMPRESA
-- =====================================================

-- Tempo de empresa de cada funcionário
SELECT
    matricula,
    nome,
    cargo,
    admissaodata,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, admissaodata)) as anos_empresa,
    EXTRACT(MONTH FROM AGE(CURRENT_DATE, admissaodata)) as meses_adicionais
FROM v_funcionarios_ativos
WHERE admissaodata IS NOT NULL
ORDER BY admissaodata;

-- Funcionários com mais de 5 anos de casa
SELECT
    matricula,
    nome,
    cargo,
    admissaodata,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, admissaodata)) as anos_empresa
FROM v_funcionarios_ativos
WHERE admissaodata IS NOT NULL
  AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, admissaodata)) >= 5
ORDER BY admissaodata;

-- Aniversariantes de empresa do mês
SELECT
    matricula,
    nome,
    cargo,
    admissaodata,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, admissaodata)) as anos_completados
FROM v_funcionarios_ativos
WHERE EXTRACT(MONTH FROM admissaodata) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND EXTRACT(DAY FROM admissaodata) >= EXTRACT(DAY FROM CURRENT_DATE)
ORDER BY EXTRACT(DAY FROM admissaodata);

-- Admissões por ano
SELECT
    EXTRACT(YEAR FROM admissaodata) as ano,
    COUNT(*) as admissoes
FROM v_funcionarios_completo
WHERE admissaodata IS NOT NULL
GROUP BY ano
ORDER BY ano DESC;

-- =====================================================
-- 6. CONSULTAS POR PCD
-- =====================================================

-- Funcionários com deficiência
SELECT
    matricula,
    nome,
    cargo,
    CASE
        WHEN deficienciafisica THEN 'Física'
        WHEN deficienciavisual THEN 'Visual'
        WHEN deficienciaauditiva THEN 'Auditiva'
        WHEN deficienciamental THEN 'Mental'
        WHEN deficienciaintelectual THEN 'Intelectual'
        ELSE 'Não especificada'
    END as tipo_deficiencia
FROM v_funcionarios_ativos
WHERE temdeficiencia = true
ORDER BY nome;

-- Percentual de cota PCD cumprida
SELECT
    COUNT(*) FILTER (WHERE preenchecotadeficiencia = true) as funcionarios_cota,
    COUNT(*) as total_funcionarios,
    ROUND(
        COUNT(*) FILTER (WHERE preenchecotadeficiencia = true) * 100.0 / COUNT(*),
        2
    ) as percentual_cota
FROM v_funcionarios_ativos;

-- Distribuição por tipo de deficiência
SELECT
    'Física' as tipo,
    COUNT(*) as quantidade
FROM v_funcionarios_ativos
WHERE deficienciafisica = true
UNION ALL
SELECT 'Visual', COUNT(*)
FROM v_funcionarios_ativos
WHERE deficienciavisual = true
UNION ALL
SELECT 'Auditiva', COUNT(*)
FROM v_funcionarios_ativos
WHERE deficienciaauditiva = true
UNION ALL
SELECT 'Mental', COUNT(*)
FROM v_funcionarios_ativos
WHERE deficienciamental = true
UNION ALL
SELECT 'Intelectual', COUNT(*)
FROM v_funcionarios_ativos
WHERE deficienciaintelectual = true
ORDER BY quantidade DESC;

-- =====================================================
-- 7. CONSULTAS POR LOCALIZAÇÃO
-- =====================================================

-- Funcionários por estado
SELECT
    uf,
    COUNT(*) as quantidade
FROM v_funcionarios_ativos
WHERE uf IS NOT NULL
GROUP BY uf
ORDER BY quantidade DESC;

-- Funcionários por cidade
SELECT
    cidade,
    uf,
    COUNT(*) as quantidade
FROM v_funcionarios_ativos
WHERE cidade IS NOT NULL
GROUP BY cidade, uf
ORDER BY quantidade DESC;

-- Funcionários de uma cidade específica
SELECT matricula, nome, cargo, endereco, bairro
FROM v_funcionarios_ativos
WHERE cidade ILIKE '%fortaleza%'
ORDER BY nome;

-- =====================================================
-- 8. HISTÓRICO E MOVIMENTAÇÕES
-- =====================================================

-- Últimas 10 movimentações de cargo
SELECT
    e.nome as funcionario,
    c.nome as novo_cargo,
    l.nome as nova_lotacao,
    s.data,
    s.observacao
FROM sep s
JOIN epg e ON e.emp_codigo = s.emp_codigo AND e.codigo = s.epg_codigo
JOIN car c ON c.emp_codigo = s.emp_codigo AND c.codigo = s.car_codigo
LEFT JOIN lot l ON l.emp_codigo = s.emp_codigo AND l.codigo = s.lot_codigo
ORDER BY s.data DESC
LIMIT 10;

-- Histórico completo de um funcionário (CPF)
SELECT
    'Cargo' as tipo_movimentacao,
    s.data,
    c.nome as descricao,
    l.nome as lotacao,
    s.observacao
FROM sep s
JOIN epg e ON e.emp_codigo = s.emp_codigo AND e.codigo = s.epg_codigo
JOIN car c ON c.emp_codigo = s.emp_codigo AND c.codigo = s.car_codigo
LEFT JOIN lot l ON l.emp_codigo = s.emp_codigo AND l.codigo = s.lot_codigo
WHERE e.cpf = '123.456.789-00'
UNION ALL
SELECT
    'Função' as tipo_movimentacao,
    r.data,
    f.nome as descricao,
    NULL as lotacao,
    r.observacao
FROM rhsep r
JOIN epg e ON e.emp_codigo = r.emp_codigo AND e.codigo = r.epg_codigo
JOIN fun f ON f.emp_codigo = r.emp_codigo AND f.codigo = r.fun_codigo
WHERE e.cpf = '123.456.789-00'
ORDER BY data DESC;

-- Funcionários que mudaram de cargo nos últimos 6 meses
SELECT DISTINCT
    e.matricula,
    e.nome,
    s.data as data_mudanca,
    c.nome as novo_cargo
FROM sep s
JOIN v_funcionarios_ativos e ON e.emp_codigo = s.emp_codigo AND e.matricula = s.epg_codigo
JOIN car c ON c.emp_codigo = s.emp_codigo AND c.codigo = s.car_codigo
WHERE s.data >= CURRENT_DATE - INTERVAL '6 months'
ORDER BY s.data DESC;

-- =====================================================
-- 9. ANIVERSARIANTES E DATAS COMEMORATIVAS
-- =====================================================

-- Aniversariantes do mês (nascimento)
SELECT
    matricula,
    nome,
    TO_CHAR(dtnascimento, 'DD/MM') as data_nascimento,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, dtnascimento)) as idade,
    cargo,
    email,
    celular
FROM v_funcionarios_ativos
WHERE EXTRACT(MONTH FROM dtnascimento) = EXTRACT(MONTH FROM CURRENT_DATE)
ORDER BY EXTRACT(DAY FROM dtnascimento);

-- Aniversariantes da próxima semana
SELECT
    nome,
    TO_CHAR(dtnascimento, 'DD/MM') as data_nascimento,
    cargo,
    email
FROM v_funcionarios_ativos
WHERE
    (EXTRACT(MONTH FROM dtnascimento) = EXTRACT(MONTH FROM CURRENT_DATE + INTERVAL '7 days')
     AND EXTRACT(DAY FROM dtnascimento) <= EXTRACT(DAY FROM CURRENT_DATE + INTERVAL '7 days'))
    OR
    (EXTRACT(MONTH FROM dtnascimento) = EXTRACT(MONTH FROM CURRENT_DATE)
     AND EXTRACT(DAY FROM dtnascimento) >= EXTRACT(DAY FROM CURRENT_DATE))
ORDER BY
    EXTRACT(MONTH FROM dtnascimento),
    EXTRACT(DAY FROM dtnascimento);

-- =====================================================
-- 10. ANÁLISES E RELATÓRIOS
-- =====================================================

-- Dashboard resumo geral
SELECT
    COUNT(*) as total_funcionarios,
    COUNT(*) FILTER (WHERE sexo = 'Masculino') as masculino,
    COUNT(*) FILTER (WHERE sexo = 'Feminino') as feminino,
    COUNT(*) FILTER (WHERE temdeficiencia = true) as pcd,
    ROUND(AVG(EXTRACT(YEAR FROM AGE(dtnascimento))), 1) as idade_media,
    ROUND(AVG(EXTRACT(YEAR FROM AGE(CURRENT_DATE, admissaodata))), 1) as tempo_medio_empresa
FROM v_funcionarios_ativos;

-- Turnover (entrada e saída)
SELECT
    'Admissões' as tipo,
    COUNT(*) as quantidade
FROM epg
WHERE EXTRACT(YEAR FROM admissao_data) = EXTRACT(YEAR FROM CURRENT_DATE)
UNION ALL
SELECT
    'Demissões',
    COUNT(*)
FROM epg
WHERE EXTRACT(YEAR FROM dt_rescisao) = EXTRACT(YEAR FROM CURRENT_DATE);

-- Cargos mais comuns
SELECT
    cargo,
    COUNT(*) as quantidade,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM v_funcionarios_ativos WHERE cargo IS NOT NULL), 2) as percentual
FROM v_funcionarios_ativos
WHERE cargo IS NOT NULL
GROUP BY cargo
ORDER BY quantidade DESC
LIMIT 10;

-- Lotações com mais funcionários
SELECT
    lotacao,
    COUNT(*) as quantidade_funcionarios
FROM v_funcionarios_ativos
WHERE lotacao IS NOT NULL
GROUP BY lotacao
ORDER BY quantidade_funcionarios DESC;

-- Funcionários sem email cadastrado
SELECT matricula, nome, cargo, celular
FROM v_funcionarios_ativos
WHERE email IS NULL OR email = ''
ORDER BY nome;

-- Funcionários sem telefone cadastrado
SELECT matricula, nome, cargo, email
FROM v_funcionarios_ativos
WHERE (celular IS NULL OR celular = '')
  AND (fone IS NULL OR fone = '')
ORDER BY nome;

-- =====================================================
-- 11. QUERIES PARA INTEGRAÇÃO COM SISTEMA DE EVENTOS
-- =====================================================

-- Buscar funcionário para inscrição em evento (por CPF)
-- Útil para integração com sistema de corrida/eventos
SELECT
    matricula,
    nome,
    nome_social,
    cpf,
    email,
    celular,
    dtnascimento,
    sexo,
    endereco,
    numero,
    complemento,
    bairro,
    cep,
    cidade,
    uf,
    cargo,
    lotacao
FROM v_funcionarios_ativos
WHERE cpf = $1; -- Placeholder para prepared statement

-- Validar se CPF é de funcionário ativo
SELECT
    CASE
        WHEN COUNT(*) > 0 THEN true
        ELSE false
    END as is_funcionario_ativo
FROM v_funcionarios_ativos
WHERE cpf = $1;

-- Lista de emails para divulgação de eventos
SELECT DISTINCT
    email,
    nome
FROM v_funcionarios_ativos
WHERE email IS NOT NULL
  AND email LIKE '%@%'
ORDER BY nome;

-- =====================================================
-- 12. QUERIES DE MANUTENÇÃO
-- =====================================================

-- Verificar duplicatas de CPF
SELECT cpf, COUNT(*) as quantidade
FROM epg
GROUP BY cpf
HAVING COUNT(*) > 1;

-- Verificar funcionários sem cargo
SELECT matricula, nome, admissaodata
FROM v_funcionarios_ativos
WHERE cargo IS NULL;

-- Verificar inconsistências de data
SELECT matricula, nome, dtnascimento, admissaodata
FROM v_funcionarios_ativos
WHERE admissaodata < dtnascimento; -- Admitido antes de nascer!

-- Funcionários com dados incompletos
SELECT
    matricula,
    nome,
    CASE WHEN email IS NULL THEN 'Email' END as campo_faltante
FROM v_funcionarios_ativos
WHERE email IS NULL
UNION ALL
SELECT
    matricula,
    nome,
    'Telefone'
FROM v_funcionarios_ativos
WHERE celular IS NULL AND fone IS NULL
UNION ALL
SELECT
    matricula,
    nome,
    'Data Nascimento'
FROM v_funcionarios_ativos
WHERE dtnascimento IS NULL;

-- =====================================================
-- FIM DOS EXEMPLOS
-- =====================================================

-- Para executar uma query com parâmetro:
-- PREPARE busca_cpf (VARCHAR) AS
-- SELECT * FROM v_funcionarios_ativos WHERE cpf = $1;
-- EXECUTE busca_cpf('123.456.789-00');
