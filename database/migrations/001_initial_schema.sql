-- ============================================
-- MIGRATION 001: Initial Schema
-- ============================================
-- Data: 2025-10-31
-- Descrição: Cria a estrutura inicial do banco de dados
-- para o sistema de inscrições da II Corrida FARMACE
-- ============================================

-- Habilita extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- Cria enums
-- ============================================

CREATE TYPE tipo_participacao_enum AS ENUM (
    'corrida-natal',
    'apenas-natal',
    'retirar-cesta'
);

CREATE TYPE status_inscricao_enum AS ENUM (
    'Pendente',
    'Confirmada',
    'Cancelada',
    'Retirou Kit'
);

-- ============================================
-- Cria tabelas
-- ============================================

-- Tabela: colaboradores
CREATE TABLE colaboradores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    data_nascimento DATE NOT NULL,
    whatsapp VARCHAR(15),
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT cpf_valido CHECK (cpf ~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$'),
    CONSTRAINT email_valido CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Tabela: modalidades
CREATE TABLE modalidades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(10) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    distancia_km NUMERIC(5,2) NOT NULL,
    idade_minima INTEGER NOT NULL DEFAULT 16,
    ativo BOOLEAN NOT NULL DEFAULT true,
    premiacao BOOLEAN NOT NULL DEFAULT false,
    ordem_exibicao INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela: tamanhos_camiseta
CREATE TABLE tamanhos_camiseta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(10) NOT NULL UNIQUE,
    nome VARCHAR(50) NOT NULL,
    altura_cm NUMERIC(5,2) NOT NULL,
    largura_cm NUMERIC(5,2) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT true,
    ordem_exibicao INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela: inscricoes
CREATE TABLE inscricoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE RESTRICT,
    numero_participante VARCHAR(10) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(15) NOT NULL,
    tipo_participacao tipo_participacao_enum NOT NULL,
    modalidade_id UUID REFERENCES modalidades(id) ON DELETE RESTRICT,
    tamanho_camiseta_id UUID REFERENCES tamanhos_camiseta(id) ON DELETE RESTRICT,
    aceitou_regulamento BOOLEAN NOT NULL DEFAULT false,
    data_aceite_regulamento TIMESTAMPTZ,
    status status_inscricao_enum NOT NULL DEFAULT 'pendente',
    kit_retirado BOOLEAN NOT NULL DEFAULT false,
    data_retirada_kit TIMESTAMPTZ,
    data_inscricao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT whatsapp_valido CHECK (whatsapp ~ '^\(\d{2}\) \d{5}-\d{4}$'),
    CONSTRAINT regulamento_aceito CHECK (aceitou_regulamento = true),
    CONSTRAINT modalidade_obrigatoria_corrida CHECK (
        tipo_participacao != 'corrida-natal' OR modalidade_id IS NOT NULL
    ),
    CONSTRAINT camiseta_obrigatoria CHECK (
        tipo_participacao = 'retirar-cesta' OR tamanho_camiseta_id IS NOT NULL
    ),
    CONSTRAINT uma_inscricao_por_colaborador UNIQUE (colaborador_id) WHERE deleted_at IS NULL
);

-- Tabela: historico_inscricoes
CREATE TABLE historico_inscricoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inscricao_id UUID NOT NULL REFERENCES inscricoes(id) ON DELETE CASCADE,
    campo_alterado VARCHAR(100) NOT NULL,
    valor_anterior TEXT,
    valor_novo TEXT,
    alterado_por VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Cria índices
-- ============================================

CREATE INDEX idx_colaboradores_email ON colaboradores(email);
CREATE INDEX idx_colaboradores_cpf ON colaboradores(cpf);
CREATE INDEX idx_colaboradores_ativo ON colaboradores(ativo) WHERE ativo = true;
CREATE INDEX idx_colaboradores_deleted ON colaboradores(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_inscricoes_colaborador ON inscricoes(colaborador_id);
CREATE INDEX idx_inscricoes_numero_participante ON inscricoes(numero_participante);
CREATE INDEX idx_inscricoes_status ON inscricoes(status);
CREATE INDEX idx_inscricoes_tipo_participacao ON inscricoes(tipo_participacao);
CREATE INDEX idx_inscricoes_modalidade ON inscricoes(modalidade_id);
CREATE INDEX idx_inscricoes_data_inscricao ON inscricoes(data_inscricao);
CREATE INDEX idx_inscricoes_deleted ON inscricoes(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_historico_inscricao ON historico_inscricoes(inscricao_id);
CREATE INDEX idx_historico_created_at ON historico_inscricoes(created_at);

-- ============================================
-- Cria functions e triggers
-- ============================================

-- Function: atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER trigger_colaboradores_updated_at
    BEFORE UPDATE ON colaboradores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_inscricoes_updated_at
    BEFORE UPDATE ON inscricoes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_modalidades_updated_at
    BEFORE UPDATE ON modalidades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_tamanhos_updated_at
    BEFORE UPDATE ON tamanhos_camiseta
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function: registrar histórico
CREATE OR REPLACE FUNCTION registrar_historico_inscricao()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO historico_inscricoes (inscricao_id, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, 'status', OLD.status::text, NEW.status::text);
    END IF;
    IF OLD.tipo_participacao IS DISTINCT FROM NEW.tipo_participacao THEN
        INSERT INTO historico_inscricoes (inscricao_id, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, 'tipo_participacao', OLD.tipo_participacao::text, NEW.tipo_participacao::text);
    END IF;
    IF OLD.modalidade_id IS DISTINCT FROM NEW.modalidade_id THEN
        INSERT INTO historico_inscricoes (inscricao_id, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, 'modalidade_id', OLD.modalidade_id::text, NEW.modalidade_id::text);
    END IF;
    IF OLD.kit_retirado = false AND NEW.kit_retirado = true THEN
        INSERT INTO historico_inscricoes (inscricao_id, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, 'kit_retirado', 'false', 'true');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_inscricoes_historico
    AFTER UPDATE ON inscricoes
    FOR EACH ROW
    EXECUTE FUNCTION registrar_historico_inscricao();

-- Function: gerar número do participante
CREATE OR REPLACE FUNCTION gerar_numero_participante()
RETURNS TRIGGER AS $$
DECLARE
    proximo_numero INTEGER;
    numero_formatado VARCHAR(10);
BEGIN
    IF NEW.numero_participante IS NOT NULL THEN
        RETURN NEW;
    END IF;
    SELECT COALESCE(MAX(numero_participante::INTEGER), 0) + 1
    INTO proximo_numero
    FROM inscricoes
    WHERE numero_participante ~ '^\d+$';
    numero_formatado := LPAD(proximo_numero::TEXT, 4, '0');
    NEW.numero_participante := numero_formatado;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_gerar_numero_participante
    BEFORE INSERT ON inscricoes
    FOR EACH ROW
    EXECUTE FUNCTION gerar_numero_participante();

-- Function: validar idade mínima
CREATE OR REPLACE FUNCTION validar_idade_modalidade()
RETURNS TRIGGER AS $$
DECLARE
    idade INTEGER;
    idade_minima_modalidade INTEGER;
BEGIN
    IF NEW.modalidade_id IS NULL THEN
        RETURN NEW;
    END IF;
    SELECT EXTRACT(YEAR FROM AGE(c.data_nascimento))
    INTO idade
    FROM colaboradores c
    WHERE c.id = NEW.colaborador_id;
    SELECT m.idade_minima
    INTO idade_minima_modalidade
    FROM modalidades m
    WHERE m.id = NEW.modalidade_id;
    IF idade < idade_minima_modalidade THEN
        RAISE EXCEPTION 'Idade mínima para esta modalidade é % anos. Idade atual: % anos',
            idade_minima_modalidade, idade;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validar_idade_modalidade
    BEFORE INSERT OR UPDATE OF modalidade_id ON inscricoes
    FOR EACH ROW
    EXECUTE FUNCTION validar_idade_modalidade();

-- ============================================
-- Cria views
-- ============================================

CREATE OR REPLACE VIEW v_inscricoes_completas AS
SELECT
    i.id,
    i.numero_participante,
    i.status,
    i.tipo_participacao,
    i.data_inscricao,
    i.kit_retirado,
    c.id as colaborador_id,
    c.nome as colaborador_nome,
    c.email as colaborador_email,
    c.cpf as colaborador_cpf,
    c.data_nascimento,
    EXTRACT(YEAR FROM AGE(c.data_nascimento)) as idade,
    i.email as email_inscricao,
    i.whatsapp,
    m.codigo as modalidade_codigo,
    m.nome as modalidade_nome,
    m.distancia_km,
    t.codigo as tamanho_codigo,
    t.nome as tamanho_nome,
    t.altura_cm,
    t.largura_cm
FROM inscricoes i
INNER JOIN colaboradores c ON i.colaborador_id = c.id
LEFT JOIN modalidades m ON i.modalidade_id = m.id
LEFT JOIN tamanhos_camiseta t ON i.tamanho_camiseta_id = t.id
WHERE i.deleted_at IS NULL
ORDER BY i.data_inscricao DESC;

CREATE OR REPLACE VIEW v_estatisticas_inscricoes AS
SELECT
    COUNT(*) as total_inscricoes,
    COUNT(*) FILTER (WHERE status = 'pendente') as pendentes,
    COUNT(*) FILTER (WHERE status = 'confirmada') as confirmadas,
    COUNT(*) FILTER (WHERE status = 'cancelada') as canceladas,
    COUNT(*) FILTER (WHERE tipo_participacao = 'corrida-natal') as total_corrida,
    COUNT(*) FILTER (WHERE tipo_participacao = 'apenas-natal') as total_apenas_natal,
    COUNT(*) FILTER (WHERE tipo_participacao = 'retirar-cesta') as total_retirar_cesta,
    COUNT(*) FILTER (WHERE kit_retirado = true) as kits_retirados,
    COUNT(*) FILTER (WHERE kit_retirado = false AND deleted_at IS NULL) as kits_pendentes
FROM inscricoes
WHERE deleted_at IS NULL;

-- ============================================
-- Define permissões
-- ============================================

GRANT SELECT ON colaboradores TO authenticated;
GRANT SELECT, INSERT, UPDATE ON inscricoes TO authenticated;
GRANT SELECT ON modalidades TO authenticated;
GRANT SELECT ON tamanhos_camiseta TO authenticated;
GRANT SELECT ON v_inscricoes_completas TO authenticated;
GRANT SELECT ON v_estatisticas_inscricoes TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================
-- FIM DA MIGRATION 001
-- ============================================
