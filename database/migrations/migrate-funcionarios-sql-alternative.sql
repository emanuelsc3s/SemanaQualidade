-- =====================================================
-- MIGRAÇÃO ALTERNATIVA: Firebird → Supabase (SQL Puro)
-- =====================================================
-- 
-- Este script é uma alternativa ao script TypeScript.
-- Use este método se preferir fazer a migração via SQL.
-- 
-- IMPORTANTE: Este script assume que você já converteu
-- o arquivo JSON para CSV manualmente.
-- 
-- Autor: Emanuel
-- Data: 2025-11-08
-- Projeto: FARMACE - Sistema de Gestão de Funcionários
-- =====================================================

-- =====================================================
-- PASSO 1: CRIAR TABELA TEMPORÁRIA PARA IMPORTAÇÃO
-- =====================================================

-- Tabela temporária que espelha a estrutura do JSON
CREATE TEMP TABLE temp_funcionarios_firebird (
    emp_codigo TEXT,
    matricula TEXT,
    nome TEXT,
    nomesocial TEXT,
    cpf TEXT,
    pis TEXT,
    dtnascimento TEXT,
    sexo TEXT,
    estadocivil TEXT,
    estadocivil_desc TEXT,
    mae TEXT,
    pai TEXT,
    email TEXT,
    ddd TEXT,
    fone TEXT,
    celular TEXT,
    endereco TEXT,
    numero TEXT,
    complemento TEXT,
    bairro TEXT,
    cep TEXT,
    uf TEXT,
    cidade_codigo TEXT,
    cidade TEXT,
    ctps_numero TEXT,
    ctps_serie TEXT,
    ctps_dv TEXT,
    ctps_uf TEXT,
    ctps_dtexpedicao TEXT,
    identidadenumero TEXT,
    identidadeorgaoexpedidor TEXT,
    identidadedtexpedicao TEXT,
    titulo TEXT,
    zona TEXT,
    secao TEXT,
    admissaodata TEXT,
    admissaotipo TEXT,
    admissaotipo_desc TEXT,
    admissaotipoesocial TEXT,
    admissaotipoesocial_desc TEXT,
    admissaovinculo TEXT,
    admissaovinculo_desc TEXT,
    demissao_data TEXT,
    temdeficiencia INTEGER,
    preenchecotadeficiencia INTEGER,
    deficienciafisica INTEGER,
    deficienciavisual INTEGER,
    deficienciaauditiva INTEGER,
    deficienciamental INTEGER,
    deficienciaintelectual INTEGER,
    escolaridade_codigo TEXT,
    grauinstrucao_desc TEXT,
    cargo_codigo TEXT,
    cargo TEXT,
    funcao_codigo TEXT,
    funcao TEXT,
    lotacao_codigo TEXT,
    lotacao TEXT
);

-- =====================================================
-- PASSO 2: IMPORTAR DADOS DO CSV
-- =====================================================

-- OPÇÃO A: Se você tiver acesso ao servidor PostgreSQL
-- COPY temp_funcionarios_firebird FROM '/path/to/funcionarios.csv' 
-- DELIMITER ',' CSV HEADER ENCODING 'UTF8';

-- OPÇÃO B: Se estiver usando Supabase Dashboard
-- 1. Vá para Table Editor
-- 2. Selecione temp_funcionarios_firebird
-- 3. Clique em "Insert" > "Import data from CSV"
-- 4. Faça upload do arquivo funcionarios.csv

-- =====================================================
-- PASSO 3: FUNÇÃO AUXILIAR PARA CONVERTER DATAS
-- =====================================================

CREATE OR REPLACE FUNCTION parse_firebird_date(date_str TEXT)
RETURNS DATE AS $$
BEGIN
    -- Formato esperado: "DD.MM.YYYY HH:MM"
    IF date_str IS NULL OR TRIM(date_str) = '' THEN
        RETURN NULL;
    END IF;
    
    -- Extrai apenas a parte da data (antes do espaço)
    DECLARE
        date_part TEXT := SPLIT_PART(date_str, ' ', 1);
        parts TEXT[];
    BEGIN
        parts := STRING_TO_ARRAY(date_part, '.');
        
        IF ARRAY_LENGTH(parts, 1) <> 3 THEN
            RETURN NULL;
        END IF;
        
        -- Converte DD.MM.YYYY para YYYY-MM-DD
        RETURN TO_DATE(parts[3] || '-' || parts[2] || '-' || parts[1], 'YYYY-MM-DD');
    EXCEPTION
        WHEN OTHERS THEN
            RETURN NULL;
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- PASSO 4: FUNÇÃO PARA FORMATAR CPF
-- =====================================================

CREATE OR REPLACE FUNCTION format_cpf(cpf_raw TEXT)
RETURNS TEXT AS $$
BEGIN
    IF cpf_raw IS NULL OR TRIM(cpf_raw) = '' THEN
        RETURN NULL;
    END IF;
    
    -- Remove caracteres não numéricos
    DECLARE
        cleaned TEXT := REGEXP_REPLACE(cpf_raw, '[^0-9]', '', 'g');
    BEGIN
        -- Garante 11 dígitos (preenche com zeros à esquerda)
        cleaned := LPAD(cleaned, 11, '0');
        
        -- Formata: XXX.XXX.XXX-XX
        RETURN SUBSTRING(cleaned, 1, 3) || '.' ||
               SUBSTRING(cleaned, 4, 3) || '.' ||
               SUBSTRING(cleaned, 7, 3) || '-' ||
               SUBSTRING(cleaned, 10, 2);
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- PASSO 5: FUNÇÃO PARA FORMATAR CEP
-- =====================================================

CREATE OR REPLACE FUNCTION format_cep(cep_raw TEXT)
RETURNS TEXT AS $$
BEGIN
    IF cep_raw IS NULL OR TRIM(cep_raw) = '' THEN
        RETURN NULL;
    END IF;
    
    DECLARE
        cleaned TEXT := REGEXP_REPLACE(cep_raw, '[^0-9]', '', 'g');
    BEGIN
        IF LENGTH(cleaned) <> 8 THEN
            RETURN cep_raw; -- Retorna original se não tiver 8 dígitos
        END IF;
        
        -- Formata: XXXXX-XXX
        RETURN SUBSTRING(cleaned, 1, 5) || '-' || SUBSTRING(cleaned, 6, 3);
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- PASSO 6: FUNÇÃO PARA MAPEAR ESTADO CIVIL
-- =====================================================

CREATE OR REPLACE FUNCTION map_estadocivil_id(codigo TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN CASE codigo
        WHEN '01' THEN 1
        WHEN '02' THEN 2
        WHEN '03' THEN 3
        WHEN '04' THEN 4
        WHEN '05' THEN 5
        ELSE NULL
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- PASSO 7: FUNÇÃO PARA NORMALIZAR ESCOLARIDADE
-- =====================================================

CREATE OR REPLACE FUNCTION normalize_escolaridade(codigo TEXT)
RETURNS TEXT AS $$
BEGIN
    IF codigo IS NULL OR TRIM(codigo) = '' THEN
        RETURN NULL;
    END IF;
    
    DECLARE
        num INTEGER := CAST(codigo AS INTEGER);
    BEGIN
        IF num >= 1 AND num <= 12 THEN
            RETURN LPAD(num::TEXT, 2, '0');
        ELSE
            RETURN NULL;
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN NULL;
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- PASSO 8: INSERIR DADOS NA TABELA FINAL
-- =====================================================

-- Inserir funcionários transformados
INSERT INTO tbfuncionario (
    emp_codigo,
    matricula,
    nome,
    nome_social,
    cpf,
    pis,
    dtnascimento,
    sexo,
    estadocivil_id,
    estadocivil_descricao,
    mae_nome,
    pai_nome,
    email,
    ddd,
    fone,
    celular,
    endereco,
    numero,
    complemento,
    bairro,
    cep,
    cidade_id,
    cidade_nome,
    cidade_uf,
    ctps_numero,
    ctps_serie,
    ctps_dv,
    uf_ctps,
    ctps_dtexpedicao,
    identidade_numero,
    identidade_orgao_expedidor,
    identidade_dtexpedicao,
    titulo,
    zona,
    secao,
    admissao_data,
    admissao_tipo,
    admissao_tipo_esocial,
    admissao_vinculo,
    dt_rescisao,
    tem_deficiencia,
    preenche_cota_deficiencia,
    deficiencia_fisica,
    deficiencia_visual,
    deficiencia_auditiva,
    deficiencia_mental,
    deficiencia_intelectual,
    grau_instrucao,
    ativo
)
SELECT
    t.emp_codigo,
    t.matricula,
    t.nome,
    NULLIF(t.nomesocial, ''),
    format_cpf(t.cpf),
    NULLIF(t.pis, ''),
    parse_firebird_date(t.dtnascimento),
    NULLIF(t.sexo, ''),
    map_estadocivil_id(t.estadocivil),
    NULLIF(t.estadocivil_desc, ''),
    NULLIF(t.mae, ''),
    NULLIF(t.pai, ''),
    NULLIF(t.email, ''),
    NULLIF(t.ddd, ''),
    NULLIF(t.fone, ''),
    NULLIF(t.celular, ''),
    NULLIF(t.endereco, ''),
    NULLIF(t.numero, ''),
    NULLIF(t.complemento, ''),
    NULLIF(t.bairro, ''),
    format_cep(t.cep),
    -- Lookup cidade_id
    (SELECT c.cidade_id 
     FROM tbcidade c 
     WHERE c.uf = t.uf 
       AND UPPER(c.nome) = UPPER(t.cidade)
     LIMIT 1),
    NULLIF(t.cidade, ''),
    NULLIF(t.uf, ''),
    NULLIF(t.ctps_numero, ''),
    NULLIF(t.ctps_serie, ''),
    NULLIF(t.ctps_dv, ''),
    NULLIF(t.ctps_uf, ''),
    parse_firebird_date(t.ctps_dtexpedicao),
    NULLIF(t.identidadenumero, ''),
    NULLIF(t.identidadeorgaoexpedidor, ''),
    parse_firebird_date(t.identidadedtexpedicao),
    NULLIF(t.titulo, ''),
    NULLIF(t.zona, ''),
    NULLIF(t.secao, ''),
    parse_firebird_date(t.admissaodata),
    NULLIF(t.admissaotipo, ''),
    LPAD(NULLIF(t.admissaotipoesocial, ''), 2, '0'),
    NULLIF(t.admissaovinculo, ''),
    parse_firebird_date(t.demissao_data),
    COALESCE(t.temdeficiencia, 0) = 1,
    COALESCE(t.preenchecotadeficiencia, 0) = 1,
    COALESCE(t.deficienciafisica, 0) = 1,
    COALESCE(t.deficienciavisual, 0) = 1,
    COALESCE(t.deficienciaauditiva, 0) = 1,
    COALESCE(t.deficienciamental, 0) = 1,
    COALESCE(t.deficienciaintelectual, 0) = 1,
    normalize_escolaridade(t.escolaridade_codigo),
    t.demissao_data IS NULL OR TRIM(t.demissao_data) = ''
FROM temp_funcionarios_firebird t
WHERE t.emp_codigo IS NOT NULL
  AND t.matricula IS NOT NULL
  AND t.nome IS NOT NULL
  AND t.cpf IS NOT NULL
  AND t.cpf <> '00000000000'; -- Ignora CPFs inválidos

-- =====================================================
-- PASSO 9: VALIDAÇÃO E ESTATÍSTICAS
-- =====================================================

-- Contar registros importados
SELECT 
    'Total importado' as metrica,
    COUNT(*) as valor
FROM tbfuncionario

UNION ALL

SELECT 
    'Ativos' as metrica,
    COUNT(*) as valor
FROM tbfuncionario
WHERE ativo = true

UNION ALL

SELECT 
    'Inativos' as metrica,
    COUNT(*) as valor
FROM tbfuncionario
WHERE ativo = false

UNION ALL

SELECT 
    'Com deficiência' as metrica,
    COUNT(*) as valor
FROM tbfuncionario
WHERE tem_deficiencia = true;

-- Verificar CPFs duplicados
SELECT 
    cpf,
    COUNT(*) as duplicados
FROM tbfuncionario
GROUP BY cpf
HAVING COUNT(*) > 1;

-- Distribuição por empresa
SELECT 
    emp_codigo,
    COUNT(*) as total_funcionarios
FROM tbfuncionario
GROUP BY emp_codigo
ORDER BY total_funcionarios DESC;

-- =====================================================
-- PASSO 10: LIMPEZA
-- =====================================================

-- Remover tabela temporária
DROP TABLE IF EXISTS temp_funcionarios_firebird;

-- Remover funções auxiliares (opcional)
-- DROP FUNCTION IF EXISTS parse_firebird_date(TEXT);
-- DROP FUNCTION IF EXISTS format_cpf(TEXT);
-- DROP FUNCTION IF EXISTS format_cep(TEXT);
-- DROP FUNCTION IF EXISTS map_estadocivil_id(TEXT);
-- DROP FUNCTION IF EXISTS normalize_escolaridade(TEXT);

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- NOTAS:
-- 1. Este script deve ser executado no Supabase SQL Editor
-- 2. Certifique-se de ter convertido o JSON para CSV antes
-- 3. Ajuste o caminho do arquivo CSV no PASSO 2
-- 4. Verifique os resultados das queries de validação
-- 5. Faça backup antes de executar em produção

