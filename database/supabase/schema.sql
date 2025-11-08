-- =====================================================
-- FARMACE - Sistema de Gestão de Funcionários
-- Script DDL para PostgreSQL 15+ (Supabase)
-- Migrado de Firebird 2.5
-- =====================================================
-- Nota: Este script NÃO utiliza ENUMs conforme solicitado
-- =====================================================

-- Habilitar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca full-text

-- =====================================================
-- 1. TABELAS AUXILIARES (DOMÍNIOS/CÓDIGOS)
-- =====================================================

-- Tabela de Estados Civis
CREATE TABLE tbestadocivil (
    estadocivil_id SERIAL PRIMARY KEY,
    codigo VARCHAR(2) UNIQUE NOT NULL,
    descricao VARCHAR(50) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE tbestadocivil IS 'Tabela de códigos de estado civil';
COMMENT ON COLUMN tbestadocivil.estadocivil_id IS 'ID autoincrementável do estado civil';
COMMENT ON COLUMN tbestadocivil.codigo IS 'Código do estado civil (01-05)';

-- Inserir valores padrão
INSERT INTO tbestadocivil (codigo, descricao) VALUES
('01', 'Solteiro'),
('02', 'Casado'),
('03', 'Divorciado'),
('04', 'Separado'),
('05', 'Viúvo');

-- Tabela de Escolaridade (Grau de Instrução - padrão S-2200 eSocial)
CREATE TABLE tbescolaridade (
    escolaridade_id SERIAL PRIMARY KEY,
    codigo VARCHAR(2) UNIQUE NOT NULL,
    descricao TEXT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE tbescolaridade IS 'Tabela de códigos de escolaridade conforme eSocial S-2200';
COMMENT ON COLUMN tbescolaridade.escolaridade_id IS 'ID autoincrementável da escolaridade';
COMMENT ON COLUMN tbescolaridade.codigo IS 'Código de escolaridade eSocial (01-12)';

-- Inserir valores padrão
INSERT INTO tbescolaridade (codigo, descricao) VALUES
('01', 'Analfabeto, inclusive o que, embora tenha recebido instrução, não se alfabetizou'),
('02', 'Até o 5º ano incompleto do ensino fundamental (antiga 4ª série) ou que se tenha alfabetizado sem ter frequentado escola regular'),
('03', '5º ano completo do ensino fundamental'),
('04', 'Do 6º ao 9º ano do ensino fundamental incompleto (antiga 5ª a 8ª série)'),
('05', 'Ensino fundamental completo'),
('06', 'Ensino médio incompleto'),
('07', 'Ensino médio completo'),
('08', 'Educação superior incompleta'),
('09', 'Educação superior completa'),
('10', 'Pós-graduação completa'),
('11', 'Mestrado completo'),
('12', 'Doutorado completo');

-- Tabela de Tipos de Admissão
CREATE TABLE tbtipoadmissao (
    tipoadmissao_id SERIAL PRIMARY KEY,
    codigo VARCHAR(2) UNIQUE NOT NULL,
    descricao VARCHAR(100) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE tbtipoadmissao IS 'Tipos de admissão de funcionários';
COMMENT ON COLUMN tbtipoadmissao.tipoadmissao_id IS 'ID autoincrementável do tipo de admissão';
COMMENT ON COLUMN tbtipoadmissao.codigo IS 'Código do tipo de admissão (10, 20, 35)';

-- Inserir valores padrão
INSERT INTO tbtipoadmissao (codigo, descricao) VALUES
('10', '1º Emprego'),
('20', 'Reemprego'),
('35', 'Reintegração');

-- Tabela de Tipos de Admissão eSocial
CREATE TABLE tbtipoadmissaoesocial (
    tipoadmissaoesocial_id SERIAL PRIMARY KEY,
    codigo VARCHAR(2) UNIQUE NOT NULL,
    descricao TEXT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE tbtipoadmissaoesocial IS 'Tipos de admissão conforme eSocial';
COMMENT ON COLUMN tbtipoadmissaoesocial.tipoadmissaoesocial_id IS 'ID autoincrementável do tipo de admissão eSocial';
COMMENT ON COLUMN tbtipoadmissaoesocial.codigo IS 'Código do tipo de admissão eSocial (01-07)';

-- Inserir valores padrão
INSERT INTO tbtipoadmissaoesocial (codigo, descricao) VALUES
('01', 'Admissão'),
('02', 'Transferência de empresa do mesmo grupo econômico ou transferência entre órgãos do mesmo Ente Federativo'),
('03', 'Transferência de empresa consorciada ou de consórcio'),
('04', 'Transferência por motivo de sucessão, incorporação, cisão ou fusão'),
('05', 'Transferência do empregado doméstico para outro representante da mesma unidade familiar'),
('06', 'Mudança de CPF'),
('07', 'Transferência quando a empresa sucedida é considerada inapta por inexistência de fato');

-- Tabela de Tipos de Vínculo Empregatício
CREATE TABLE tbtipovinculo (
    tipovinculo_id SERIAL PRIMARY KEY,
    codigo VARCHAR(2) UNIQUE NOT NULL,
    descricao TEXT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE tbtipovinculo IS 'Tipos de vínculo empregatício conforme eSocial';
COMMENT ON COLUMN tbtipovinculo.tipovinculo_id IS 'ID autoincrementável do tipo de vínculo';
COMMENT ON COLUMN tbtipovinculo.codigo IS 'Código do tipo de vínculo eSocial (10-90)';

-- Inserir valores padrão
INSERT INTO tbtipovinculo (codigo, descricao) VALUES
('10', 'Trabalhador Urbano, vinculado a empregador Pessoa Jurídica, por contrato de trabalho regido pela CLT, por prazo indeterminado'),
('15', 'Trabalhador Urbano, vinculado a empregador Pessoa Física, por contrato de trabalho regido pela CLT, por prazo indeterminado'),
('20', 'Trabalhador Rural, vinculado a empregador Pessoa Jurídica, por contrato de trabalho regido pela CLT, por prazo indeterminado'),
('25', 'Trabalhador Rural, vinculado a empregador Pessoa Física, por contrato de trabalho regido pela CLT, por prazo indeterminado'),
('30', 'Servidor regido pelo Regime Jurídico Único (Federal, Estadual e Municipal) e Militar'),
('35', 'Servidor público não-efetivo (demissível ad nutum ou admitido por legislação especial, não regida pela CLT)'),
('40', 'Trabalhador avulso (trabalho administrado pelo sindicato da categoria ou pelo órgão gestor de mão-de-obra)'),
('50', 'Trabalhador temporário, regido pela Lei nº 6.019, de 03/01/1974'),
('55', 'Menor aprendiz'),
('60', 'Trabalhador Urbano, vinculado a empregador Pessoa Jurídica, por contrato de trabalho regido pela CLT, por tempo determinado ou obra certa'),
('65', 'Trabalhador Urbano, vinculado a empregador Pessoa Física, por contrato de trabalho regido pela CLT, por tempo determinado ou obra certa'),
('70', 'Trabalhador Rural, vinculado a empregador Pessoa Jurídica, por contrato de trabalho regido pela Lei nº 5.889/73, por tempo determinado'),
('75', 'Trabalhador Rural, vinculado a empregador Pessoa Física, por contrato de trabalho regido pela Lei nº 5.889/73, por tempo determinado'),
('79', 'Aposentadoria especial'),
('80', 'Diretor, sem vínculo empregatício, para o qual a empresa/entidade tenha optado por recolhimento do FGTS'),
('90', 'Contrato de trabalho por prazo determinado, regido pela Lei nº 9.601, de 21/01/1998');

-- =====================================================
-- 2. TABELAS BASE (EMPRESAS, GEOGRAFIA)
-- =====================================================

-- Tabela de Empresas
CREATE TABLE tbempresa (
    empresa_id SERIAL NOT NULL,
    codigo TEXT,
    razao_social TEXT,
    nome_fantasia TEXT,
    cnpj TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP
);

COMMENT ON TABLE tbempresa IS 'Tabela de empresas do grupo';

-- Tabela de Unidades Federativas (Estados)
CREATE TABLE tbuf (
    uf_id SERIAL PRIMARY KEY,
    uf VARCHAR(2) UNIQUE NOT NULL,
    nome VARCHAR(50) NOT NULL,
    codigo_ibge VARCHAR(2) UNIQUE,
    regiao VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at
);

COMMENT ON TABLE tbuf IS 'Unidades Federativas (Estados) do Brasil';
COMMENT ON COLUMN tbuf.uf_id IS 'ID autoincrementável do estado';
COMMENT ON COLUMN tbuf.uf IS 'Sigla da UF (AC, AL, AM, etc.)';

-- Inserir UFs
INSERT INTO tbuf (uf, nome, codigo_ibge, regiao) VALUES
('AC', 'Acre', '12', 'Norte'),
('AL', 'Alagoas', '27', 'Nordeste'),
('AP', 'Amapá', '16', 'Norte'),
('AM', 'Amazonas', '13', 'Norte'),
('BA', 'Bahia', '29', 'Nordeste'),
('CE', 'Ceará', '23', 'Nordeste'),
('DF', 'Distrito Federal', '53', 'Centro-Oeste'),
('ES', 'Espírito Santo', '32', 'Sudeste'),
('GO', 'Goiás', '52', 'Centro-Oeste'),
('MA', 'Maranhão', '21', 'Nordeste'),
('MT', 'Mato Grosso', '51', 'Centro-Oeste'),
('MS', 'Mato Grosso do Sul', '50', 'Centro-Oeste'),
('MG', 'Minas Gerais', '31', 'Sudeste'),
('PA', 'Pará', '15', 'Norte'),
('PB', 'Paraíba', '25', 'Nordeste'),
('PR', 'Paraná', '41', 'Sul'),
('PE', 'Pernambuco', '26', 'Nordeste'),
('PI', 'Piauí', '22', 'Nordeste'),
('RJ', 'Rio de Janeiro', '33', 'Sudeste'),
('RN', 'Rio Grande do Norte', '24', 'Nordeste'),
('RS', 'Rio Grande do Sul', '43', 'Sul'),
('RO', 'Rondônia', '11', 'Norte'),
('RR', 'Roraima', '14', 'Norte'),
('SC', 'Santa Catarina', '42', 'Sul'),
('SP', 'São Paulo', '35', 'Sudeste'),
('SE', 'Sergipe', '28', 'Nordeste'),
('TO', 'Tocantins', '17', 'Norte');

-- Tabela de Cidades/Municípios
CREATE TABLE tbcidade (
    cidade_id SERIAL NOT NULL,
    uf VARCHAR(2) NOT NULL,
    codigo INTEGER NOT NULL,
    nome VARCHAR(100) NOT NULL,
    codigo_ibge VARCHAR(7) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_tbcidade_uf FOREIGN KEY (uf)
        REFERENCES tbuf(uf) ON DELETE RESTRICT,
    CONSTRAINT uk_tbcidade_uf_codigo UNIQUE (uf, codigo)
);

COMMENT ON TABLE tbcidade IS 'Municípios brasileiros';
COMMENT ON COLUMN tbcidade.cidade_id IS 'Identificador único da cidade (ex: CE-1, SP-1)';

-- Índices para busca de municípios
CREATE INDEX idx_tbcidade_nome ON tbcidade USING gin(nome gin_trgm_ops);
CREATE INDEX idx_tbcidade_codigo_ibge ON tbcidade(codigo_ibge);
CREATE INDEX idx_tbcidade_uf ON tbcidade(uf);

-- =====================================================
-- 3. TABELAS DE RH (CARGOS, FUNÇÕES, LOTAÇÕES)
-- =====================================================

-- Tabela de Cargos
CREATE TABLE tbcargo (
    cargo_id SERIAL PRIMARY KEY,
    emp_codigo TEXT NOT NULL,
    codigo INTEGER NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    cbo VARCHAR(10), -- Código Brasileiro de Ocupações
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_tbcargo_empresa FOREIGN KEY (emp_codigo)
        REFERENCES tbempresa(codigo) ON DELETE RESTRICT,
    CONSTRAINT uk_tbcargo_emp_codigo UNIQUE (emp_codigo, codigo)
);

COMMENT ON TABLE tbcargo IS 'Cargos disponíveis nas empresas';
COMMENT ON COLUMN tbcargo.cargo_id IS 'ID único autoincrementável do cargo';
COMMENT ON COLUMN tbcargo.codigo IS 'Código do cargo dentro da empresa (legado)';

-- Índices
CREATE INDEX idx_tbcargo_nome ON tbcargo USING gin(nome gin_trgm_ops);
CREATE INDEX idx_tbcargo_ativo ON tbcargo(ativo);
CREATE INDEX idx_tbcargo_emp_codigo ON tbcargo(emp_codigo);

-- Tabela de Funções
CREATE TABLE tbfuncao (
    funcao_id SERIAL PRIMARY KEY,
    emp_codigo TEXT NOT NULL,
    codigo INTEGER NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_tbfuncao_empresa FOREIGN KEY (emp_codigo)
        REFERENCES tbempresa(codigo) ON DELETE RESTRICT,
    CONSTRAINT uk_tbfuncao_emp_codigo UNIQUE (emp_codigo, codigo)
);

COMMENT ON TABLE tbfuncao IS 'Funções que podem ser exercidas pelos funcionários';
COMMENT ON COLUMN tbfuncao.funcao_id IS 'ID único autoincrementável da função';
COMMENT ON COLUMN tbfuncao.codigo IS 'Código da função dentro da empresa (legado)';

-- Índices
CREATE INDEX idx_tbfuncao_nome ON tbfuncao USING gin(nome gin_trgm_ops);
CREATE INDEX idx_tbfuncao_ativo ON tbfuncao(ativo);
CREATE INDEX idx_tbfuncao_emp_codigo ON tbfuncao(emp_codigo);

-- Tabela de Lotações
CREATE TABLE tblotacao (
    lotacao_id SERIAL PRIMARY KEY,
    emp_codigo TEXT NOT NULL,
    codigo INTEGER NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_tblotacao_empresa FOREIGN KEY (emp_codigo)
        REFERENCES tbempresa(codigo) ON DELETE RESTRICT,
    CONSTRAINT uk_tblotacao_emp_codigo UNIQUE (emp_codigo, codigo)
);

COMMENT ON TABLE tblotacao IS 'Lotações/departamentos das empresas';
COMMENT ON COLUMN tblotacao.lotacao_id IS 'ID único autoincrementável da lotação';
COMMENT ON COLUMN tblotacao.codigo IS 'Código da lotação dentro da empresa (legado)';

-- Índices
CREATE INDEX idx_tblotacao_nome ON tblotacao USING gin(nome gin_trgm_ops);
CREATE INDEX idx_tblotacao_ativo ON tblotacao(ativo);
CREATE INDEX idx_tblotacao_emp_codigo ON tblotacao(emp_codigo);

-- =====================================================
-- 4. TABELA PRINCIPAL - FUNCIONÁRIOS
-- =====================================================

CREATE TABLE tbfuncionario (
    -- Identificação
    funcionario_id SERIAL NOT NULL,
    emp_codigo TEXT,
    matricula TEXT, -- Matrícula
    nome TEXT,
    nome_social TEXT,

    -- Documentos
    cpf VARCHAR(14) NOT NULL,
    pis VARCHAR(15),

    -- Dados Pessoais
    dtnascimento DATE,
    sexo TEXT,
    estadocivil_id INTEGER,
    estadocivil_descricao VARCHAR(50),
    mae_nome TEXT,
    pai_nome TEXT,

    -- Contato
    email TEXT,
    ddd VARCHAR(3),
    fone VARCHAR(15),
    celular VARCHAR(15),

    -- Endereço
    endereco TEXT,
    numero TEXT,
    complemento TEXT,
    bairro TEXT,
    cep VARCHAR(9),
    cidade_id INTEGER,
    cidade_nome VARCHAR(100),
    cidade_uf VARCHAR(2),

    -- CTPS
    ctps_numero VARCHAR(20),
    ctps_serie VARCHAR(10),
    ctps_dv VARCHAR(2),
    uf_ctps VARCHAR(2),
    ctps_dtexpedicao DATE,

    -- RG
    identidade_numero VARCHAR(20),
    identidade_orgao_expedidor VARCHAR(20),
    identidade_dtexpedicao DATE,

    -- Título de Eleitor
    titulo VARCHAR(20),
    zona VARCHAR(10),
    secao VARCHAR(10),

    -- Admissão
    admissao_data DATE,
    admissao_tipo VARCHAR(2),
    admissao_tipo_esocial VARCHAR(2),
    admissao_vinculo VARCHAR(2),

    -- Demissão/Rescisão
    dt_rescisao DATE,

    -- PCD (Pessoa com Deficiência)
    tem_deficiencia BOOLEAN DEFAULT FALSE,
    preenche_cota_deficiencia BOOLEAN DEFAULT FALSE,
    deficiencia_fisica BOOLEAN DEFAULT FALSE,
    deficiencia_visual BOOLEAN DEFAULT FALSE,
    deficiencia_auditiva BOOLEAN DEFAULT FALSE,
    deficiencia_mental BOOLEAN DEFAULT FALSE,
    deficiencia_intelectual BOOLEAN DEFAULT FALSE,

    -- Escolaridade
    grau_instrucao VARCHAR(2),

    -- Metadados
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP,

    -- Constraints
    PRIMARY KEY (funcionario_id),
    CONSTRAINT fk_tbfuncionario_empresa FOREIGN KEY (emp_codigo)
        REFERENCES tbempresa(codigo) ON DELETE RESTRICT,
    CONSTRAINT fk_tbfuncionario_estadocivil FOREIGN KEY (estadocivil_id)
        REFERENCES tbestadocivil(estadocivil_id) ON DELETE RESTRICT,
    CONSTRAINT fk_tbfuncionario_cidade FOREIGN KEY (cidade_id)
        REFERENCES tbcidade(cidade_id) ON DELETE RESTRICT,
    CONSTRAINT fk_tbfuncionario_uf_ctps FOREIGN KEY (uf_ctps)
        REFERENCES tbuf(uf) ON DELETE RESTRICT,
    CONSTRAINT fk_tbfuncionario_tipoadmissao FOREIGN KEY (admissao_tipo)
        REFERENCES tbtipoadmissao(codigo) ON DELETE RESTRICT,
    CONSTRAINT fk_tbfuncionario_tipoadmissaoesocial FOREIGN KEY (admissao_tipo_esocial)
        REFERENCES tbtipoadmissaoesocial(codigo) ON DELETE RESTRICT,
    CONSTRAINT fk_tbfuncionario_tipovinculo FOREIGN KEY (admissao_vinculo)
        REFERENCES tbtipovinculo(codigo) ON DELETE RESTRICT,
    CONSTRAINT fk_tbfuncionario_escolaridade FOREIGN KEY (grau_instrucao)
        REFERENCES tbescolaridade(codigo) ON DELETE RESTRICT,
    CONSTRAINT uk_tbfuncionario_emp_matricula UNIQUE (emp_codigo, matricula),
    CONSTRAINT chk_tbfuncionario_cpf CHECK (cpf ~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$'),
    CONSTRAINT chk_tbfuncionario_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE tbfuncionario IS 'Tabela principal de funcionários (Empregados)';
COMMENT ON COLUMN tbfuncionario.funcionario_id IS 'ID único autoincrementável do funcionário';
COMMENT ON COLUMN tbfuncionario.matricula IS 'Matrícula do funcionário (código legado)';
COMMENT ON COLUMN tbfuncionario.nome_social IS 'Nome social (para pessoas trans/não-binárias)';
COMMENT ON COLUMN tbfuncionario.estadocivil_id IS 'ID do estado civil (FK para tbestadocivil.estadocivil_id)';
COMMENT ON COLUMN tbfuncionario.estadocivil_descricao IS 'Descrição do estado civil (desnormalizado para performance)';
COMMENT ON COLUMN tbfuncionario.cidade_id IS 'ID da cidade (FK para tbcidade.cidade_id)';
COMMENT ON COLUMN tbfuncionario.cidade_nome IS 'Nome da cidade (desnormalizado para performance)';
COMMENT ON COLUMN tbfuncionario.cidade_uf IS 'UF da cidade (desnormalizado para performance)';
COMMENT ON COLUMN tbfuncionario.tem_deficiencia IS 'Indica se o funcionário possui alguma deficiência';
COMMENT ON COLUMN tbfuncionario.preenche_cota_deficiencia IS 'Indica se preenche cota PCD da empresa';

-- Índices importantes para performance
CREATE UNIQUE INDEX idx_tbfuncionario_cpf ON tbfuncionario(cpf);
CREATE INDEX idx_tbfuncionario_nome ON tbfuncionario USING gin(nome gin_trgm_ops);
CREATE INDEX idx_tbfuncionario_nome_social ON tbfuncionario USING gin(nome_social gin_trgm_ops);
CREATE INDEX idx_tbfuncionario_email ON tbfuncionario(email);
CREATE INDEX idx_tbfuncionario_admissao_data ON tbfuncionario(admissao_data);
CREATE INDEX idx_tbfuncionario_ativo ON tbfuncionario(ativo);
CREATE INDEX idx_tbfuncionario_dt_rescisao ON tbfuncionario(dt_rescisao);
CREATE INDEX idx_tbfuncionario_emp_codigo ON tbfuncionario(emp_codigo);
CREATE INDEX idx_tbfuncionario_matricula ON tbfuncionario(matricula);