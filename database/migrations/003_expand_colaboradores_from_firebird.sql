-- ============================================
-- MIGRATION 003: Expandir Tabela Colaboradores
-- ============================================
-- Data: 2025-10-31
-- Descrição: Adiciona campos extras à tabela colaboradores
-- convertidos do sistema Firebird 2.5 (EPG) da FARMACE
--
-- Fonte: database/migrations/colaboradores.sql (Firebird)
-- Destino: tbfuncionario (Supabase PostgreSQL)
-- ============================================

-- ============================================
-- 1. ADICIONAR NOVOS CAMPOS À TABELA colaboradores
-- ============================================

-- Dados da empresa e código do funcionário (EPG)
ALTER TABLE colaboradores
ADD COLUMN IF NOT EXISTS emp_codigo VARCHAR(10),
ADD COLUMN IF NOT EXISTS epg_codigo INTEGER,

-- Nome social
ADD COLUMN IF NOT EXISTS nome_social VARCHAR(255),

-- PIS/PASEP
ADD COLUMN IF NOT EXISTS pis VARCHAR(15),

-- Sexo (já convertido para extenso: 'Masculino' ou 'Feminino')
ADD COLUMN IF NOT EXISTS sexo VARCHAR(20),

-- Estado Civil (código 2 dígitos e descrição)
ADD COLUMN IF NOT EXISTS estado_civil_codigo VARCHAR(2),
ADD COLUMN IF NOT EXISTS estado_civil_descr VARCHAR(50),

-- Filiação
ADD COLUMN IF NOT EXISTS mae_nome VARCHAR(255),
ADD COLUMN IF NOT EXISTS pai_nome VARCHAR(255),

-- Contatos adicionais
ADD COLUMN IF NOT EXISTS ddd VARCHAR(3),
ADD COLUMN IF NOT EXISTS fone VARCHAR(15),
ADD COLUMN IF NOT EXISTS celular VARCHAR(15),

-- Endereço completo
ADD COLUMN IF NOT EXISTS end_logradouro VARCHAR(255),
ADD COLUMN IF NOT EXISTS end_numero VARCHAR(20),
ADD COLUMN IF NOT EXISTS end_complemento VARCHAR(100),
ADD COLUMN IF NOT EXISTS bairro VARCHAR(100),
ADD COLUMN IF NOT EXISTS cep VARCHAR(10),

-- Município (UF + Código + Nome)
ADD COLUMN IF NOT EXISTS uf_sigla VARCHAR(2),
ADD COLUMN IF NOT EXISTS mun_codigo VARCHAR(10),
ADD COLUMN IF NOT EXISTS municipio_nome VARCHAR(255),

-- Documentos - CTPS
ADD COLUMN IF NOT EXISTS ctps_numero VARCHAR(20),
ADD COLUMN IF NOT EXISTS ctps_serie VARCHAR(10),
ADD COLUMN IF NOT EXISTS ctps_dv VARCHAR(2),
ADD COLUMN IF NOT EXISTS ctps_uf_sigla VARCHAR(2),
ADD COLUMN IF NOT EXISTS ctps_dt_expedicao DATE,

-- Documentos - Identidade
ADD COLUMN IF NOT EXISTS identidade_numero VARCHAR(20),
ADD COLUMN IF NOT EXISTS identidade_orgao_expedidor VARCHAR(20),
ADD COLUMN IF NOT EXISTS identidade_dt_expedicao DATE,

-- Documentos - Título de Eleitor
ADD COLUMN IF NOT EXISTS titulo VARCHAR(20),
ADD COLUMN IF NOT EXISTS zona VARCHAR(10),
ADD COLUMN IF NOT EXISTS secao VARCHAR(10),

-- Admissão
ADD COLUMN IF NOT EXISTS admissao_data DATE,
ADD COLUMN IF NOT EXISTS admissao_tipo VARCHAR(2),
ADD COLUMN IF NOT EXISTS admissao_tipo_desc VARCHAR(50),
ADD COLUMN IF NOT EXISTS admissao_tipo_esocial VARCHAR(2),
ADD COLUMN IF NOT EXISTS admissao_tipo_esocial_desc TEXT,
ADD COLUMN IF NOT EXISTS admissao_vinculo VARCHAR(2),
ADD COLUMN IF NOT EXISTS admissao_vinculo_desc TEXT,

-- Demissão/Rescisão
ADD COLUMN IF NOT EXISTS demissao_data DATE,

-- PCD - Pessoa com Deficiência
ADD COLUMN IF NOT EXISTS tem_deficiencia BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS preenche_cota_deficiencia BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deficiencia_fisica BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deficiencia_visual BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deficiencia_auditiva BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deficiencia_mental BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deficiencia_intelectual BOOLEAN DEFAULT false,

-- Escolaridade (código e descrição conforme eSocial S-2200)
ADD COLUMN IF NOT EXISTS escolaridade_codigo VARCHAR(2),
ADD COLUMN IF NOT EXISTS escolaridade_descr VARCHAR(255),

-- Cargo atual (último registro da tabela SEP do Firebird)
ADD COLUMN IF NOT EXISTS cargo_codigo VARCHAR(10),
ADD COLUMN IF NOT EXISTS cargo_descr VARCHAR(100),

-- Função atual (último registro da tabela RHSEP do Firebird)
ADD COLUMN IF NOT EXISTS funcao_codigo VARCHAR(10),
ADD COLUMN IF NOT EXISTS funcao_descr VARCHAR(100),

-- Lotação atual (último registro SEP + LOT do Firebird)
ADD COLUMN IF NOT EXISTS lotacao_codigo VARCHAR(10),
ADD COLUMN IF NOT EXISTS lotacao_nome VARCHAR(100);

-- ============================================
-- 2. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices para códigos de empresa e funcionário (chave composta)
CREATE INDEX IF NOT EXISTS idx_colaboradores_emp_epg
ON colaboradores(emp_codigo, epg_codigo)
WHERE emp_codigo IS NOT NULL AND epg_codigo IS NOT NULL;

-- Índice para PIS
CREATE INDEX IF NOT EXISTS idx_colaboradores_pis
ON colaboradores(pis)
WHERE pis IS NOT NULL;

-- Índice para UF e município
CREATE INDEX IF NOT EXISTS idx_colaboradores_municipio
ON colaboradores(uf_sigla, mun_codigo)
WHERE uf_sigla IS NOT NULL AND mun_codigo IS NOT NULL;

-- Índice para cargo
CREATE INDEX IF NOT EXISTS idx_colaboradores_cargo
ON colaboradores(cargo_codigo)
WHERE cargo_codigo IS NOT NULL;

-- Índice para lotação
CREATE INDEX IF NOT EXISTS idx_colaboradores_lotacao
ON colaboradores(lotacao_codigo)
WHERE lotacao_codigo IS NOT NULL;

-- Índice para data de admissão
CREATE INDEX IF NOT EXISTS idx_colaboradores_admissao
ON colaboradores(admissao_data)
WHERE admissao_data IS NOT NULL;

-- Índice para colaboradores ativos (não demitidos)
CREATE INDEX IF NOT EXISTS idx_colaboradores_nao_demitidos
ON colaboradores(ativo)
WHERE ativo = true AND demissao_data IS NULL;

-- Índice para PCD
CREATE INDEX IF NOT EXISTS idx_colaboradores_pcd
ON colaboradores(tem_deficiencia)
WHERE tem_deficiencia = true;

-- ============================================
-- 3. ADICIONAR CONSTRAINTS DE VALIDAÇÃO
-- ============================================

-- Validação de PIS (11 dígitos)
ALTER TABLE colaboradores
ADD CONSTRAINT IF NOT EXISTS pis_valido
CHECK (pis IS NULL OR pis ~ '^\d{11}$' OR pis ~ '^\d{3}\.\d{5}\.\d{2}-\d{1}$');

-- Validação de CEP
ALTER TABLE colaboradores
ADD CONSTRAINT IF NOT EXISTS cep_valido
CHECK (cep IS NULL OR cep ~ '^\d{5}-\d{3}$' OR cep ~ '^\d{8}$');

-- Validação de UF
ALTER TABLE colaboradores
ADD CONSTRAINT IF NOT EXISTS uf_valida
CHECK (uf_sigla IS NULL OR LENGTH(uf_sigla) = 2);

-- Validação de telefone DDD
ALTER TABLE colaboradores
ADD CONSTRAINT IF NOT EXISTS ddd_valido
CHECK (ddd IS NULL OR ddd ~ '^\d{2}$');

-- Estado civil: código deve ser 01 a 05
ALTER TABLE colaboradores
ADD CONSTRAINT IF NOT EXISTS estado_civil_codigo_valido
CHECK (estado_civil_codigo IS NULL OR estado_civil_codigo IN ('01', '02', '03', '04', '05'));

-- Sexo: Masculino ou Feminino
ALTER TABLE colaboradores
ADD CONSTRAINT IF NOT EXISTS sexo_valido
CHECK (sexo IS NULL OR sexo IN ('Masculino', 'Feminino'));

-- Escolaridade: código conforme eSocial (01 a 12)
ALTER TABLE colaboradores
ADD CONSTRAINT IF NOT EXISTS escolaridade_codigo_valido
CHECK (escolaridade_codigo IS NULL OR escolaridade_codigo IN (
    '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'
));

-- Admissão tipo: 10, 20, 35
ALTER TABLE colaboradores
ADD CONSTRAINT IF NOT EXISTS admissao_tipo_valido
CHECK (admissao_tipo IS NULL OR admissao_tipo IN ('10', '20', '35'));

-- Admissão tipo eSocial: 01 a 07
ALTER TABLE colaboradores
ADD CONSTRAINT IF NOT EXISTS admissao_tipo_esocial_valido
CHECK (admissao_tipo_esocial IS NULL OR admissao_tipo_esocial IN (
    '01', '02', '03', '04', '05', '06', '07'
));

-- Data de demissão deve ser posterior à admissão
ALTER TABLE colaboradores
ADD CONSTRAINT IF NOT EXISTS demissao_apos_admissao
CHECK (demissao_data IS NULL OR admissao_data IS NULL OR demissao_data >= admissao_data);

-- ============================================
-- 4. COMENTÁRIOS DESCRITIVOS
-- ============================================

COMMENT ON COLUMN colaboradores.emp_codigo IS 'Código da empresa no sistema Firebird (ERP antigo)';
COMMENT ON COLUMN colaboradores.epg_codigo IS 'Código do funcionário no sistema Firebird (tabela EPG)';
COMMENT ON COLUMN colaboradores.nome_social IS 'Nome social do colaborador (quando aplicável)';
COMMENT ON COLUMN colaboradores.pis IS 'PIS/PASEP/NIS';
COMMENT ON COLUMN colaboradores.sexo IS 'Sexo: Masculino ou Feminino';
COMMENT ON COLUMN colaboradores.estado_civil_codigo IS 'Código do estado civil: 01-Solteiro, 02-Casado, 03-Divorciado, 04-Separado, 05-Viúvo';
COMMENT ON COLUMN colaboradores.estado_civil_descr IS 'Descrição do estado civil por extenso';
COMMENT ON COLUMN colaboradores.mae_nome IS 'Nome completo da mãe';
COMMENT ON COLUMN colaboradores.pai_nome IS 'Nome completo do pai';
COMMENT ON COLUMN colaboradores.uf_sigla IS 'Sigla da UF do município de residência';
COMMENT ON COLUMN colaboradores.mun_codigo IS 'Código IBGE do município de residência';
COMMENT ON COLUMN colaboradores.municipio_nome IS 'Nome do município de residência';
COMMENT ON COLUMN colaboradores.escolaridade_codigo IS 'Código de escolaridade conforme tabela eSocial S-2200';
COMMENT ON COLUMN colaboradores.escolaridade_descr IS 'Descrição da escolaridade por extenso';
COMMENT ON COLUMN colaboradores.admissao_tipo IS '10-1º Emprego, 20-Reemprego, 35-Reintegração';
COMMENT ON COLUMN colaboradores.admissao_tipo_esocial IS 'Tipo de admissão conforme eSocial (01 a 07)';
COMMENT ON COLUMN colaboradores.admissao_vinculo IS 'Tipo de vínculo empregatício conforme eSocial';
COMMENT ON COLUMN colaboradores.admissao_vinculo_desc IS 'Descrição completa do tipo de vínculo';
COMMENT ON COLUMN colaboradores.demissao_data IS 'Data de rescisão/demissão (quando aplicável)';
COMMENT ON COLUMN colaboradores.tem_deficiencia IS 'Indica se o colaborador tem alguma deficiência (PCD)';
COMMENT ON COLUMN colaboradores.preenche_cota_deficiencia IS 'Indica se preenche a cota de deficiência da empresa';
COMMENT ON COLUMN colaboradores.cargo_codigo IS 'Código do cargo atual do colaborador';
COMMENT ON COLUMN colaboradores.cargo_descr IS 'Descrição do cargo atual';
COMMENT ON COLUMN colaboradores.funcao_codigo IS 'Código da função atual do colaborador';
COMMENT ON COLUMN colaboradores.funcao_descr IS 'Descrição da função atual';
COMMENT ON COLUMN colaboradores.lotacao_codigo IS 'Código da lotação/departamento atual';
COMMENT ON COLUMN colaboradores.lotacao_nome IS 'Nome da lotação/departamento atual';

-- ============================================
-- 5. CRIAR VIEW PARA COMPATIBILIDADE COM FIREBIRD
-- ============================================
-- Esta view replica a estrutura do SELECT original do Firebird
-- facilitando a migração e comparação de dados

CREATE OR REPLACE VIEW v_colaboradores_completo AS
SELECT
    -- Dados básicos
    c.emp_codigo,
    c.epg_codigo AS codigo,
    c.nome,
    c.nome_social AS nomesocial,
    c.cpf,
    c.pis,
    c.data_nascimento AS dtnascimento,

    -- Sexo
    c.sexo,

    -- Estado Civil
    c.estado_civil_codigo,
    c.estado_civil_descr,

    -- Filiação
    c.mae_nome AS maenome,
    c.pai_nome AS painome,

    -- Contatos
    c.email,
    c.ddd,
    c.fone,
    c.celular,
    c.whatsapp,

    -- Endereço
    c.end_logradouro AS endlogradouro,
    c.end_numero AS endnumero,
    c.end_complemento AS endcomplemento,
    c.bairro,
    c.cep,

    -- Município
    c.uf_sigla AS uf_sigla,
    c.mun_codigo AS mun_codigo,
    c.municipio_nome,

    -- Documentos - CTPS
    c.ctps_numero AS ctpsnumero,
    c.ctps_serie AS ctpsserie,
    c.ctps_dv AS ctpsdv,
    c.ctps_uf_sigla AS ufd_sigla_ctps,
    c.ctps_dt_expedicao AS ctpsdtexpedicao,

    -- Documentos - Identidade
    c.identidade_numero AS identidadenumero,
    c.identidade_orgao_expedidor AS identidadeorgaoexpedidor,
    c.identidade_dt_expedicao AS identidadedtexpedicao,

    -- Documentos - Título
    c.titulo,
    c.zona,
    c.secao,

    -- Admissão
    c.admissao_data AS admissaodata,
    c.admissao_tipo AS admissaotipo,
    c.admissao_tipo_desc AS admissaotipo_desc,
    c.admissao_tipo_esocial AS admissaotipoesocial,
    c.admissao_tipo_esocial_desc AS admissaotipoesocial_desc,
    c.admissao_vinculo AS admissaovinculo,
    c.admissao_vinculo_desc AS admissaovinculo_desc,

    -- Demissão
    c.demissao_data AS dtrescisao,

    -- PCD
    c.tem_deficiencia AS temdeficiencia,
    c.preenche_cota_deficiencia AS preenchecotadeficiencia,
    c.deficiencia_fisica AS deficienciafisica,
    c.deficiencia_visual AS deficienciavisual,
    c.deficiencia_auditiva AS deficienciaauditiva,
    c.deficiencia_mental AS deficienciamental,
    c.deficiencia_intelectual AS deficienciaintelectual,

    -- Escolaridade
    c.escolaridade_codigo AS grauinstrucao,
    c.escolaridade_descr AS escolaridade_descr,

    -- Cargo
    c.cargo_codigo AS car_codigo,
    c.cargo_descr AS car_descr,

    -- Função
    c.funcao_codigo AS fun_codigo,
    c.funcao_descr AS fun_descr,

    -- Lotação
    c.lotacao_codigo AS lot_codigo,
    c.lotacao_nome AS lot_nome,

    -- Campos de controle
    c.ativo,
    c.created_at,
    c.updated_at,
    c.deleted_at
FROM colaboradores c
WHERE c.deleted_at IS NULL;

COMMENT ON VIEW v_colaboradores_completo IS
'View com estrutura compatível ao SELECT do Firebird para facilitar migração e comparação de dados';

-- ============================================
-- 6. ATUALIZAR GRANTS
-- ============================================

-- Permitir leitura da view para usuários autenticados
GRANT SELECT ON v_colaboradores_completo TO authenticated;

-- ============================================
-- 7. SCRIPT DE MIGRAÇÃO DE DADOS (EXEMPLO)
-- ============================================

/*
  ATENÇÃO: Este é um exemplo de como importar dados do Firebird

  Os dados devem ser exportados do Firebird para CSV e então
  importados para o Supabase usando este formato.

  Exemplo de importação via CSV:

  COPY colaboradores (
      emp_codigo,
      epg_codigo,
      nome,
      nome_social,
      cpf,
      pis,
      data_nascimento,
      sexo,
      estado_civil_codigo,
      estado_civil_descr,
      mae_nome,
      pai_nome,
      email,
      ddd,
      fone,
      celular,
      whatsapp,
      end_logradouro,
      end_numero,
      end_complemento,
      bairro,
      cep,
      uf_sigla,
      mun_codigo,
      municipio_nome,
      -- ... outros campos
      ativo
  )
  FROM '/path/to/colaboradores.csv'
  DELIMITER ','
  CSV HEADER;
*/

-- ============================================
-- 8. QUERIES ÚTEIS PARA VALIDAÇÃO
-- ============================================

-- Contar colaboradores por empresa
-- SELECT emp_codigo, COUNT(*) as total
-- FROM colaboradores
-- WHERE deleted_at IS NULL
-- GROUP BY emp_codigo;

-- Listar colaboradores ativos (não demitidos)
-- SELECT nome, cargo_descr, lotacao_nome, admissao_data
-- FROM colaboradores
-- WHERE ativo = true
--   AND demissao_data IS NULL
--   AND deleted_at IS NULL
-- ORDER BY nome;

-- Listar colaboradores PCD
-- SELECT nome, cargo_descr,
--        deficiencia_fisica, deficiencia_visual, deficiencia_auditiva
-- FROM colaboradores
-- WHERE tem_deficiencia = true
--   AND deleted_at IS NULL;

-- Distribuição por escolaridade
-- SELECT escolaridade_descr, COUNT(*) as total
-- FROM colaboradores
-- WHERE deleted_at IS NULL
--   AND escolaridade_descr IS NOT NULL
-- GROUP BY escolaridade_descr
-- ORDER BY total DESC;

-- ============================================
-- FIM DA MIGRATION 003
-- ============================================
