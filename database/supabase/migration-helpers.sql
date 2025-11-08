-- =====================================================
-- HELPERS DE MIGRAÇÃO - Firebird para PostgreSQL
-- =====================================================
-- Scripts auxiliares para facilitar a migração de dados
-- do Firebird 2.5 para PostgreSQL 15+
-- =====================================================

-- =====================================================
-- 1. FUNÇÕES DE LIMPEZA E NORMALIZAÇÃO
-- =====================================================

-- Função para limpar e formatar CPF
CREATE OR REPLACE FUNCTION formatar_cpf(cpf_input VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
    -- Remove tudo que não é número
    cpf_input := REGEXP_REPLACE(cpf_input, '[^0-9]', '', 'g');

    -- Se tem 11 dígitos, formata
    IF LENGTH(cpf_input) = 11 THEN
        RETURN SUBSTRING(cpf_input, 1, 3) || '.' ||
               SUBSTRING(cpf_input, 4, 3) || '.' ||
               SUBSTRING(cpf_input, 7, 3) || '-' ||
               SUBSTRING(cpf_input, 10, 2);
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para limpar e formatar telefone
CREATE OR REPLACE FUNCTION formatar_telefone(tel_input VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
    -- Remove tudo que não é número
    tel_input := REGEXP_REPLACE(tel_input, '[^0-9]', '', 'g');

    -- Se tem 11 dígitos (celular com 9)
    IF LENGTH(tel_input) = 11 THEN
        RETURN '(' || SUBSTRING(tel_input, 1, 2) || ') ' ||
               SUBSTRING(tel_input, 3, 5) || '-' ||
               SUBSTRING(tel_input, 8, 4);
    -- Se tem 10 dígitos (fixo)
    ELSIF LENGTH(tel_input) = 10 THEN
        RETURN '(' || SUBSTRING(tel_input, 1, 2) || ') ' ||
               SUBSTRING(tel_input, 3, 4) || '-' ||
               SUBSTRING(tel_input, 7, 4);
    END IF;

    RETURN tel_input;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para limpar e formatar CEP
CREATE OR REPLACE FUNCTION formatar_cep(cep_input VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
    -- Remove tudo que não é número
    cep_input := REGEXP_REPLACE(cep_input, '[^0-9]', '', 'g');

    -- Se tem 8 dígitos
    IF LENGTH(cep_input) = 8 THEN
        RETURN SUBSTRING(cep_input, 1, 5) || '-' || SUBSTRING(cep_input, 6, 3);
    END IF;

    RETURN cep_input;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para normalizar código de 1 dígito para 2 dígitos
CREATE OR REPLACE FUNCTION normalizar_codigo_2d(codigo_input VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
    IF codigo_input IS NULL THEN
        RETURN NULL;
    END IF;

    codigo_input := TRIM(codigo_input);

    IF LENGTH(codigo_input) = 1 THEN
        RETURN '0' || codigo_input;
    END IF;

    RETURN codigo_input;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 2. TABELA TEMPORÁRIA PARA STAGING DE DADOS
-- =====================================================

-- Criar tabela temporária para importação inicial (formato Firebird)
CREATE TABLE IF NOT EXISTS staging_epg (
    emp_codigo INTEGER,
    codigo INTEGER,
    nome VARCHAR(200),
    nomesocial VARCHAR(200),
    cpf VARCHAR(50), -- Sem formatação inicial
    pis VARCHAR(50),
    dtnascimento DATE,
    sexo VARCHAR(10),
    estadocivil VARCHAR(10),
    maenome VARCHAR(200),
    painome VARCHAR(200),
    email VARCHAR(200),
    ddd VARCHAR(10),
    fone VARCHAR(50),
    celular VARCHAR(50),
    endlogradouro VARCHAR(200),
    endnumero VARCHAR(20),
    endcomplemento VARCHAR(100),
    bairro VARCHAR(100),
    cep VARCHAR(20),
    mun_ufd_sigla VARCHAR(5),
    mun_codigo INTEGER,
    ctpsnumero VARCHAR(20),
    ctpsserie VARCHAR(10),
    ctpsdv VARCHAR(2),
    ufd_sigla_ctps VARCHAR(5),
    ctpsdtexpedicao DATE,
    identidadenumero VARCHAR(20),
    identidadeorgaoexpedidor VARCHAR(20),
    identidadedtexpedicao DATE,
    titulo VARCHAR(20),
    zona VARCHAR(10),
    secao VARCHAR(10),
    admissaodata DATE,
    admissaotipo VARCHAR(10),
    admissaotipoesocial VARCHAR(10),
    admissaovinculo VARCHAR(10),
    dtrescisao DATE,
    temdeficiencia VARCHAR(10),
    preenchecotadeficiencia VARCHAR(10),
    deficienciafisica VARCHAR(10),
    deficienciavisual VARCHAR(10),
    deficienciaauditiva VARCHAR(10),
    deficienciamental VARCHAR(10),
    deficienciaintelectual VARCHAR(10),
    grauinstrucao VARCHAR(10)
);

COMMENT ON TABLE staging_epg IS 'Tabela temporária para staging de dados do Firebird';

-- =====================================================
-- 3. SCRIPT DE MIGRAÇÃO DE STAGING PARA EPG
-- =====================================================

-- Procedure para migrar dados de staging para tabela final
CREATE OR REPLACE FUNCTION migrar_staging_para_epg()
RETURNS TABLE (
    processados INTEGER,
    sucesso INTEGER,
    erro INTEGER,
    mensagem TEXT
) AS $$
DECLARE
    v_processados INTEGER := 0;
    v_sucesso INTEGER := 0;
    v_erro INTEGER := 0;
    v_record RECORD;
BEGIN
    -- Processar cada registro da staging
    FOR v_record IN SELECT * FROM staging_epg LOOP
        BEGIN
            v_processados := v_processados + 1;

            INSERT INTO epg (
                emp_codigo,
                codigo,
                nome,
                nome_social,
                cpf,
                pis,
                dtnascimento,
                sexo,
                estadocivil,
                mae_nome,
                pai_nome,
                email,
                ddd,
                fone,
                celular,
                end_logradouro,
                end_numero,
                end_complemento,
                bairro,
                cep,
                mun_ufd_sigla,
                mun_codigo,
                ctps_numero,
                ctps_serie,
                ctps_dv,
                ufd_sigla_ctps,
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
                grau_instrucao
            ) VALUES (
                v_record.emp_codigo,
                v_record.codigo,
                TRIM(v_record.nome),
                NULLIF(TRIM(v_record.nomesocial), ''),
                formatar_cpf(v_record.cpf),
                NULLIF(TRIM(v_record.pis), ''),
                v_record.dtnascimento,
                CASE UPPER(TRIM(v_record.sexo))
                    WHEN 'M' THEN 'M'
                    WHEN 'MASCULINO' THEN 'M'
                    WHEN 'F' THEN 'F'
                    WHEN 'FEMININO' THEN 'F'
                    ELSE NULL
                END,
                normalizar_codigo_2d(v_record.estadocivil),
                NULLIF(TRIM(v_record.maenome), ''),
                NULLIF(TRIM(v_record.painome), ''),
                LOWER(NULLIF(TRIM(v_record.email), '')),
                NULLIF(TRIM(v_record.ddd), ''),
                formatar_telefone(v_record.fone),
                formatar_telefone(v_record.celular),
                NULLIF(TRIM(v_record.endlogradouro), ''),
                NULLIF(TRIM(v_record.endnumero), ''),
                NULLIF(TRIM(v_record.endcomplemento), ''),
                NULLIF(TRIM(v_record.bairro), ''),
                formatar_cep(v_record.cep),
                NULLIF(TRIM(v_record.mun_ufd_sigla), ''),
                v_record.mun_codigo,
                NULLIF(TRIM(v_record.ctpsnumero), ''),
                NULLIF(TRIM(v_record.ctpsserie), ''),
                NULLIF(TRIM(v_record.ctpsdv), ''),
                NULLIF(TRIM(v_record.ufd_sigla_ctps), ''),
                v_record.ctpsdtexpedicao,
                NULLIF(TRIM(v_record.identidadenumero), ''),
                NULLIF(TRIM(v_record.identidadeorgaoexpedidor), ''),
                v_record.identidadedtexpedicao,
                NULLIF(TRIM(v_record.titulo), ''),
                NULLIF(TRIM(v_record.zona), ''),
                NULLIF(TRIM(v_record.secao), ''),
                v_record.admissaodata,
                normalizar_codigo_2d(v_record.admissaotipo),
                normalizar_codigo_2d(v_record.admissaotipoesocial),
                NULLIF(TRIM(v_record.admissaovinculo), ''),
                v_record.dtrescisao,
                COALESCE(UPPER(TRIM(v_record.temdeficiencia)) IN ('T', 'TRUE', 'S', 'SIM', '1'), FALSE),
                COALESCE(UPPER(TRIM(v_record.preenchecotadeficiencia)) IN ('T', 'TRUE', 'S', 'SIM', '1'), FALSE),
                COALESCE(UPPER(TRIM(v_record.deficienciafisica)) IN ('T', 'TRUE', 'S', 'SIM', '1'), FALSE),
                COALESCE(UPPER(TRIM(v_record.deficienciavisual)) IN ('T', 'TRUE', 'S', 'SIM', '1'), FALSE),
                COALESCE(UPPER(TRIM(v_record.deficienciaauditiva)) IN ('T', 'TRUE', 'S', 'SIM', '1'), FALSE),
                COALESCE(UPPER(TRIM(v_record.deficienciamental)) IN ('T', 'TRUE', 'S', 'SIM', '1'), FALSE),
                COALESCE(UPPER(TRIM(v_record.deficienciaintelectual)) IN ('T', 'TRUE', 'S', 'SIM', '1'), FALSE),
                normalizar_codigo_2d(v_record.grauinstrucao)
            )
            ON CONFLICT (emp_codigo, codigo) DO UPDATE SET
                nome = EXCLUDED.nome,
                updated_at = NOW();

            v_sucesso := v_sucesso + 1;

        EXCEPTION WHEN OTHERS THEN
            v_erro := v_erro + 1;
            RAISE NOTICE 'Erro ao processar matrícula % - %: %',
                v_record.emp_codigo, v_record.codigo, SQLERRM;
        END;
    END LOOP;

    RETURN QUERY SELECT
        v_processados,
        v_sucesso,
        v_erro,
        format('Processados: %s | Sucesso: %s | Erro: %s',
               v_processados, v_sucesso, v_erro);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. VALIDAÇÕES PÓS-MIGRAÇÃO
-- =====================================================

-- View para validar dados migrados
CREATE OR REPLACE VIEW v_validacao_migracao AS
SELECT
    'CPF Inválido' as tipo_erro,
    emp_codigo,
    codigo as matricula,
    nome,
    cpf as valor_problema
FROM epg
WHERE cpf !~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$'
UNION ALL
SELECT
    'Email Inválido',
    emp_codigo,
    codigo,
    nome,
    email
FROM epg
WHERE email IS NOT NULL
  AND email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
UNION ALL
SELECT
    'Sexo Inválido',
    emp_codigo,
    codigo,
    nome,
    sexo
FROM epg
WHERE sexo IS NOT NULL
  AND sexo NOT IN ('M', 'F')
UNION ALL
SELECT
    'Data Nascimento Futura',
    emp_codigo,
    codigo,
    nome,
    TO_CHAR(dtnascimento, 'DD/MM/YYYY')
FROM epg
WHERE dtnascimento > CURRENT_DATE
UNION ALL
SELECT
    'Admissão antes do Nascimento',
    emp_codigo,
    codigo,
    nome,
    TO_CHAR(admissao_data, 'DD/MM/YYYY')
FROM epg
WHERE admissao_data < dtnascimento;

COMMENT ON VIEW v_validacao_migracao IS 'Validações de integridade após migração';

-- =====================================================
-- 5. SCRIPTS PARA IMPORTAÇÃO VIA CSV
-- =====================================================

-- Comando para importar CSV para staging (executar no psql)
/*
\COPY staging_epg FROM '/caminho/para/arquivo.csv' WITH (
    FORMAT CSV,
    HEADER TRUE,
    DELIMITER ',',
    ENCODING 'UTF8',
    NULL ''
);
*/

-- Após importar, executar migração:
-- SELECT * FROM migrar_staging_para_epg();

-- Verificar erros:
-- SELECT * FROM v_validacao_migracao;

-- =====================================================
-- 6. FUNÇÕES PARA POPULAR MUNICÍPIOS
-- =====================================================

-- Função para inserir município (helper)
CREATE OR REPLACE FUNCTION inserir_municipio(
    p_ufd_sigla VARCHAR(2),
    p_codigo INTEGER,
    p_nome VARCHAR(100),
    p_codigo_ibge VARCHAR(7) DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO mun (ufd_sigla, codigo, nome, codigo_ibge)
    VALUES (p_ufd_sigla, p_codigo, UPPER(p_nome), p_codigo_ibge)
    ON CONFLICT (ufd_sigla, codigo) DO UPDATE
    SET nome = EXCLUDED.nome,
        codigo_ibge = COALESCE(EXCLUDED.codigo_ibge, mun.codigo_ibge);

    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao inserir município %-%: %', p_ufd_sigla, p_codigo, SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Tabela temporária para importar municípios via CSV
CREATE TABLE IF NOT EXISTS staging_municipios (
    codigo_ibge VARCHAR(7),
    nome VARCHAR(100),
    uf VARCHAR(2),
    codigo_municipio INTEGER
);

-- Função para migrar municípios de staging
CREATE OR REPLACE FUNCTION migrar_municipios_staging()
RETURNS TABLE (
    importados INTEGER,
    mensagem TEXT
) AS $$
DECLARE
    v_count INTEGER := 0;
BEGIN
    INSERT INTO mun (ufd_sigla, codigo, nome, codigo_ibge)
    SELECT
        UPPER(TRIM(uf)),
        codigo_municipio,
        UPPER(TRIM(nome)),
        TRIM(codigo_ibge)
    FROM staging_municipios
    ON CONFLICT (ufd_sigla, codigo) DO UPDATE
    SET nome = EXCLUDED.nome,
        codigo_ibge = EXCLUDED.codigo_ibge;

    GET DIAGNOSTICS v_count = ROW_COUNT;

    RETURN QUERY SELECT v_count, format('%s municípios importados', v_count);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. EXEMPLOS DE INSERÇÃO DE DADOS DE TESTE
-- =====================================================

-- Inserir empresa de exemplo
INSERT INTO emp (codigo, razao_social, nome_fantasia, cnpj)
VALUES (1, 'FARMACE INDÚSTRIA QUÍMICA FARMACÊUTICA CEARENSE LTDA', 'FARMACE', '07.954.905/0001-66')
ON CONFLICT (codigo) DO NOTHING;

-- Inserir alguns cargos de exemplo
INSERT INTO car (emp_codigo, codigo, nome, cbo) VALUES
(1, 1, 'ANALISTA DE QUALIDADE', '2031-05'),
(1, 2, 'FARMACÊUTICO', '2234-05'),
(1, 3, 'AUXILIAR DE PRODUÇÃO', '7842-05'),
(1, 4, 'GERENTE DE PRODUÇÃO', '1412-05'),
(1, 5, 'ANALISTA DE RH', '2521-05')
ON CONFLICT (emp_codigo, codigo) DO NOTHING;

-- Inserir algumas lotações de exemplo
INSERT INTO lot (emp_codigo, codigo, nome) VALUES
(1, 1, 'CONTROLE DE QUALIDADE'),
(1, 2, 'PRODUÇÃO'),
(1, 3, 'RECURSOS HUMANOS'),
(1, 4, 'FINANCEIRO'),
(1, 5, 'COMERCIAL')
ON CONFLICT (emp_codigo, codigo) DO NOTHING;

-- Inserir algumas funções de exemplo
INSERT INTO fun (emp_codigo, codigo, nome) VALUES
(1, 1, 'LÍDER DE EQUIPE'),
(1, 2, 'COORDENADOR'),
(1, 3, 'SUPERVISOR')
ON CONFLICT (emp_codigo, codigo) DO NOTHING;

-- =====================================================
-- 8. QUERIES DE DIAGNÓSTICO
-- =====================================================

-- Contar registros por tabela
CREATE OR REPLACE FUNCTION diagnostico_tabelas()
RETURNS TABLE (
    tabela VARCHAR,
    total_registros BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'emp'::VARCHAR, COUNT(*) FROM emp
    UNION ALL
    SELECT 'ufd', COUNT(*) FROM ufd
    UNION ALL
    SELECT 'mun', COUNT(*) FROM mun
    UNION ALL
    SELECT 'car', COUNT(*) FROM car
    UNION ALL
    SELECT 'fun', COUNT(*) FROM fun
    UNION ALL
    SELECT 'lot', COUNT(*) FROM lot
    UNION ALL
    SELECT 'epg', COUNT(*) FROM epg
    UNION ALL
    SELECT 'sep', COUNT(*) FROM sep
    UNION ALL
    SELECT 'rhsep', COUNT(*) FROM rhsep;
END;
$$ LANGUAGE plpgsql;

-- Ver diagnóstico
-- SELECT * FROM diagnostico_tabelas();

-- =====================================================
-- 9. LIMPEZA DE DADOS TEMPORÁRIOS
-- =====================================================

-- Limpar tabelas de staging após migração bem-sucedida
CREATE OR REPLACE FUNCTION limpar_staging()
RETURNS VOID AS $$
BEGIN
    TRUNCATE TABLE staging_epg;
    TRUNCATE TABLE staging_municipios;
    RAISE NOTICE 'Tabelas de staging limpas com sucesso';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FIM DOS HELPERS DE MIGRAÇÃO
-- =====================================================

COMMENT ON FUNCTION migrar_staging_para_epg IS 'Migra dados da tabela staging_epg para epg com formatações e validações';
COMMENT ON FUNCTION formatar_cpf IS 'Formata CPF para padrão 999.999.999-99';
COMMENT ON FUNCTION formatar_telefone IS 'Formata telefone para padrão (99) 99999-9999';
COMMENT ON FUNCTION formatar_cep IS 'Formata CEP para padrão 99999-999';
COMMENT ON FUNCTION normalizar_codigo_2d IS 'Normaliza códigos de 1 dígito para 2 dígitos com zero à esquerda';
