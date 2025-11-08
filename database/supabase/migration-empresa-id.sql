-- =====================================================
-- MIGRAÇÃO: Trocar foreign keys de 'codigo' para 'empresa_id'
-- =====================================================
-- OPÇÃO ALTERNATIVA (mais invasiva)
-- Use este script se quiser padronizar TUDO para usar empresa_id
-- =====================================================

-- ⚠️ ATENÇÃO: Esta migração é DESTRUTIVA se houver dados!
-- Faça backup antes de executar!

BEGIN;

-- 1. Adicionar PRIMARY KEY no empresa_id
ALTER TABLE tbempresa
    ADD CONSTRAINT pk_tbempresa PRIMARY KEY (empresa_id);

-- 2. Adicionar UNIQUE constraints
ALTER TABLE tbempresa
    ADD CONSTRAINT uk_tbempresa_codigo UNIQUE (codigo),
    ADD CONSTRAINT uk_tbempresa_cnpj UNIQUE (cnpj);

-- =====================================================
-- 3. REMOVER foreign keys antigas (que usam 'codigo')
-- =====================================================

-- tbcargo
ALTER TABLE tbcargo
    DROP CONSTRAINT IF EXISTS fk_tbcargo_empresa;

-- tbfuncao
ALTER TABLE tbfuncao
    DROP CONSTRAINT IF EXISTS fk_tbfuncao_empresa;

-- tblotacao
ALTER TABLE tblotacao
    DROP CONSTRAINT IF EXISTS fk_tblotacao_empresa;

-- tbfuncionario
ALTER TABLE tbfuncionario
    DROP CONSTRAINT IF EXISTS fk_tbfuncionario_empresa;

-- tbhistoricocargo
ALTER TABLE tbhistoricocargo
    DROP CONSTRAINT IF EXISTS fk_tbhistoricocargo_empresa;

-- tbhistoricofuncao
ALTER TABLE tbhistoricofuncao
    DROP CONSTRAINT IF EXISTS fk_tbhistoricofuncao_empresa;

-- =====================================================
-- 4. ALTERAR colunas nas tabelas filhas
-- =====================================================

-- Renomear 'emp_codigo' para 'empresa_id' e mudar tipo
ALTER TABLE tbcargo
    RENAME COLUMN emp_codigo TO empresa_id_old;

ALTER TABLE tbcargo
    ADD COLUMN empresa_id INTEGER;

-- ATENÇÃO: Se já existem dados, você precisa popular a nova coluna
-- UPDATE tbcargo c
-- SET empresa_id = e.empresa_id
-- FROM tbempresa e
-- WHERE c.empresa_id_old = e.codigo;

ALTER TABLE tbcargo
    ALTER COLUMN empresa_id SET NOT NULL,
    DROP COLUMN empresa_id_old;

-- Repetir para tbfuncao
ALTER TABLE tbfuncao
    RENAME COLUMN emp_codigo TO empresa_id_old;

ALTER TABLE tbfuncao
    ADD COLUMN empresa_id INTEGER;

ALTER TABLE tbfuncao
    ALTER COLUMN empresa_id SET NOT NULL,
    DROP COLUMN empresa_id_old;

-- Repetir para tblotacao
ALTER TABLE tblotacao
    RENAME COLUMN emp_codigo TO empresa_id_old;

ALTER TABLE tblotacao
    ADD COLUMN empresa_id INTEGER;

ALTER TABLE tblotacao
    ALTER COLUMN empresa_id SET NOT NULL,
    DROP COLUMN empresa_id_old;

-- Repetir para tbfuncionario
ALTER TABLE tbfuncionario
    RENAME COLUMN emp_codigo TO empresa_id_old;

ALTER TABLE tbfuncionario
    ADD COLUMN empresa_id INTEGER;

ALTER TABLE tbfuncionario
    ALTER COLUMN empresa_id SET NOT NULL,
    DROP COLUMN empresa_id_old;

-- Repetir para tbhistoricocargo
ALTER TABLE tbhistoricocargo
    RENAME COLUMN emp_codigo TO empresa_id_old;

ALTER TABLE tbhistoricocargo
    ADD COLUMN empresa_id INTEGER;

ALTER TABLE tbhistoricocargo
    ALTER COLUMN empresa_id SET NOT NULL,
    DROP COLUMN empresa_id_old;

-- Repetir para tbhistoricofuncao
ALTER TABLE tbhistoricofuncao
    RENAME COLUMN emp_codigo TO empresa_id_old;

ALTER TABLE tbhistoricofuncao
    ADD COLUMN empresa_id INTEGER;

ALTER TABLE tbhistoricofuncao
    ALTER COLUMN empresa_id SET NOT NULL,
    DROP COLUMN empresa_id_old;

-- =====================================================
-- 5. RECRIAR foreign keys usando empresa_id
-- =====================================================

-- tbcargo
ALTER TABLE tbcargo
    ADD CONSTRAINT fk_tbcargo_empresa FOREIGN KEY (empresa_id)
        REFERENCES tbempresa(empresa_id) ON DELETE RESTRICT,
    DROP CONSTRAINT IF EXISTS uk_tbcargo_emp_codigo,
    ADD CONSTRAINT uk_tbcargo_empresa_codigo UNIQUE (empresa_id, codigo);

-- tbfuncao
ALTER TABLE tbfuncao
    ADD CONSTRAINT fk_tbfuncao_empresa FOREIGN KEY (empresa_id)
        REFERENCES tbempresa(empresa_id) ON DELETE RESTRICT,
    DROP CONSTRAINT IF EXISTS uk_tbfuncao_emp_codigo,
    ADD CONSTRAINT uk_tbfuncao_empresa_codigo UNIQUE (empresa_id, codigo);

-- tblotacao
ALTER TABLE tblotacao
    ADD CONSTRAINT fk_tblotacao_empresa FOREIGN KEY (empresa_id)
        REFERENCES tbempresa(empresa_id) ON DELETE RESTRICT,
    DROP CONSTRAINT IF EXISTS uk_tblotacao_emp_codigo,
    ADD CONSTRAINT uk_tblotacao_empresa_codigo UNIQUE (empresa_id, codigo);

-- tbfuncionario
ALTER TABLE tbfuncionario
    ADD CONSTRAINT fk_tbfuncionario_empresa FOREIGN KEY (empresa_id)
        REFERENCES tbempresa(empresa_id) ON DELETE RESTRICT,
    DROP CONSTRAINT IF EXISTS uk_tbfuncionario_emp_matricula,
    ADD CONSTRAINT uk_tbfuncionario_empresa_matricula UNIQUE (empresa_id, matricula);

-- tbhistoricocargo
ALTER TABLE tbhistoricocargo
    ADD CONSTRAINT fk_tbhistoricocargo_empresa FOREIGN KEY (empresa_id)
        REFERENCES tbempresa(empresa_id) ON DELETE RESTRICT;

-- tbhistoricofuncao
ALTER TABLE tbhistoricofuncao
    ADD CONSTRAINT fk_tbhistoricofuncao_empresa FOREIGN KEY (empresa_id)
        REFERENCES tbempresa(empresa_id) ON DELETE RESTRICT;

-- =====================================================
-- 6. ATUALIZAR índices
-- =====================================================

DROP INDEX IF EXISTS idx_tbcargo_emp_codigo;
CREATE INDEX idx_tbcargo_empresa_id ON tbcargo(empresa_id);

DROP INDEX IF EXISTS idx_tbfuncao_emp_codigo;
CREATE INDEX idx_tbfuncao_empresa_id ON tbfuncao(empresa_id);

DROP INDEX IF EXISTS idx_tblotacao_emp_codigo;
CREATE INDEX idx_tblotacao_empresa_id ON tblotacao(empresa_id);

DROP INDEX IF EXISTS idx_tbfuncionario_emp_codigo;
DROP INDEX IF EXISTS idx_tbfuncionario_empresa_ativo;
DROP INDEX IF EXISTS idx_tbfuncionario_empresa_matricula;
CREATE INDEX idx_tbfuncionario_empresa_id ON tbfuncionario(empresa_id);
CREATE INDEX idx_tbfuncionario_empresa_ativo ON tbfuncionario(empresa_id, ativo);
CREATE INDEX idx_tbfuncionario_empresa_matricula ON tbfuncionario(empresa_id, matricula);

DROP INDEX IF EXISTS idx_tbhistoricocargo_emp_codigo;
CREATE INDEX idx_tbhistoricocargo_empresa_id ON tbhistoricocargo(empresa_id);

DROP INDEX IF EXISTS idx_tbhistoricofuncao_emp_codigo;
CREATE INDEX idx_tbhistoricofuncao_empresa_id ON tbhistoricofuncao(empresa_id);

-- =====================================================
-- 7. ATUALIZAR views (v_funcionarios_completo)
-- =====================================================

DROP VIEW IF EXISTS v_funcionarios_ativos;
DROP VIEW IF EXISTS v_funcionarios_completo;

CREATE OR REPLACE VIEW v_funcionarios_completo AS
SELECT
    e.funcionario_id,
    e.empresa_id,  -- ✅ Mudou de emp_codigo para empresa_id
    e.matricula,
    e.nome,
    e.nome_social,
    e.cpf,
    e.pis,
    e.dtnascimento,

    -- Sexo por extenso
    CASE e.sexo
        WHEN 'M' THEN 'Masculino'
        WHEN 'F' THEN 'Feminino'
        ELSE NULL
    END AS sexo,

    -- Estado Civil
    e.estadocivil,
    ec.descricao AS estadocivil_desc,

    e.mae_nome AS mae,
    e.pai_nome AS pai,
    e.email,
    e.ddd,
    e.fone,
    e.celular,
    e.end_logradouro AS endereco,
    e.end_numero AS numero,
    e.end_complemento AS complemento,
    e.bairro,
    e.cep,

    -- Município/Cidade
    e.cidade_id,
    c.uf,
    c.codigo AS cidade_codigo,
    c.nome AS cidade,

    e.ctps_numero,
    e.ctps_serie,
    e.ctps_dv,
    e.uf_ctps AS ctps_uf,
    e.ctps_dtexpedicao,
    e.identidade_numero,
    e.identidade_orgao_expedidor,
    e.identidade_dtexpedicao,
    e.titulo,
    e.zona,
    e.secao,

    -- Admissão
    e.admissao_data AS admissaodata,
    e.admissao_tipo AS admissaotipo,
    ta.descricao AS admissaotipo_desc,
    e.admissao_tipo_esocial AS admissaotipoesocial,
    tae.descricao AS admissaotipoesocial_desc,
    e.admissao_vinculo AS admissaovinculo,
    tv.descricao AS admissaovinculo_desc,

    e.dt_rescisao AS demissao_data,

    -- PCD
    e.tem_deficiencia AS temdeficiencia,
    e.preenche_cota_deficiencia AS preenchecotadeficiencia,
    e.deficiencia_fisica AS deficienciafisica,
    e.deficiencia_visual AS deficienciavisual,
    e.deficiencia_auditiva AS deficienciaauditiva,
    e.deficiencia_mental AS deficienciamental,
    e.deficiencia_intelectual AS deficienciaintelectual,

    -- Escolaridade
    e.grau_instrucao AS escolaridade_codigo,
    esc.descricao AS grauinstrucao_desc,

    -- Cargo vigente (último por data)
    (SELECT h.cargo_id
       FROM tbhistoricocargo h
      WHERE h.funcionario_id = e.funcionario_id
      ORDER BY h.data DESC
      LIMIT 1) AS cargo_id,

    (SELECT c.nome
       FROM tbhistoricocargo h
       JOIN tbcargo c ON c.cargo_id = h.cargo_id
      WHERE h.funcionario_id = e.funcionario_id
      ORDER BY h.data DESC
      LIMIT 1) AS cargo,

    -- Função vigente (último por data)
    (SELECT hf.funcao_id
       FROM tbhistoricofuncao hf
      WHERE hf.funcionario_id = e.funcionario_id
      ORDER BY hf.data DESC
      LIMIT 1) AS funcao_id,

    (SELECT f.nome
       FROM tbhistoricofuncao hf
       JOIN tbfuncao f ON f.funcao_id = hf.funcao_id
      WHERE hf.funcionario_id = e.funcionario_id
      ORDER BY hf.data DESC
      LIMIT 1) AS funcao,

    -- Lotação vigente (último por data)
    (SELECT h.lotacao_id
       FROM tbhistoricocargo h
      WHERE h.funcionario_id = e.funcionario_id
      ORDER BY h.data DESC
      LIMIT 1) AS lotacao_id,

    (SELECT l.nome
       FROM tbhistoricocargo h
       JOIN tblotacao l ON l.lotacao_id = h.lotacao_id
      WHERE h.funcionario_id = e.funcionario_id
      ORDER BY h.data DESC
      LIMIT 1) AS lotacao

FROM tbfuncionario e
LEFT JOIN tbcidade c ON c.cidade_id = e.cidade_id
LEFT JOIN tbestadocivil ec ON ec.codigo = e.estadocivil
LEFT JOIN tbtipoadmissao ta ON ta.codigo = e.admissao_tipo
LEFT JOIN tbtipoadmissaoesocial tae ON tae.codigo = e.admissao_tipo_esocial
LEFT JOIN tbtipovinculo tv ON tv.codigo = e.admissao_vinculo
LEFT JOIN tbescolaridade esc ON esc.codigo = e.grau_instrucao;

COMMENT ON VIEW v_funcionarios_completo IS 'View completa de funcionários com todas as informações e descrições';

CREATE OR REPLACE VIEW v_funcionarios_ativos AS
SELECT * FROM v_funcionarios_completo
WHERE demissao_data IS NULL;

COMMENT ON VIEW v_funcionarios_ativos IS 'Funcionários ativos (sem data de rescisão)';

-- =====================================================
-- 8. ATUALIZAR funções
-- =====================================================

DROP FUNCTION IF EXISTS listar_funcionarios_lotacao(TEXT, INTEGER);

CREATE OR REPLACE FUNCTION listar_funcionarios_lotacao(
    p_empresa_id INTEGER,  -- ✅ Mudou de p_emp_codigo TEXT
    p_lotacao_id INTEGER
)
RETURNS TABLE (
    matricula TEXT,
    nome VARCHAR,
    cargo VARCHAR,
    email VARCHAR,
    celular VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.matricula,
        v.nome,
        v.cargo,
        v.email,
        v.celular
    FROM v_funcionarios_ativos v
    WHERE v.empresa_id = p_empresa_id  -- ✅ Mudou de v.emp_codigo
      AND v.lotacao_id = p_lotacao_id
    ORDER BY v.nome;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION listar_funcionarios_lotacao IS 'Lista funcionários ativos de uma lotação específica usando empresa_id';

COMMIT;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
-- \d tbempresa
-- \d tbcargo
-- \d tbfuncao
-- \d tblotacao
-- \d tbfuncionario
-- \d tbhistoricocargo
-- \d tbhistoricofuncao
