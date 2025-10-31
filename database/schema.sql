-- ============================================
-- SCHEMA SQL - II CORRIDA DA QUALIDADE FARMACE
-- ============================================
-- Database: Supabase PostgreSQL
-- Versão: 1.0.0
-- Data: 2025-10-31
--
-- Descrição: Schema completo para gerenciamento de inscrições
-- da II Corrida e Caminhada da Qualidade FARMACE 2025
-- ============================================

-- ============================================
-- EXTENSIONS
-- ============================================

-- Extension para geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extension para criptografia (opcional, para dados sensíveis)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS (Tipos Enumerados)
-- ============================================

-- Enum para tipos de participação no evento
CREATE TYPE tipo_participacao_enum AS ENUM (
    'corrida-natal',  -- Participar da corrida e da comemoração de Natal
    'apenas-natal',   -- Participar apenas da comemoração de Natal
    'retirar-cesta'   -- Não participar de nenhum evento, apenas retirar cesta
);

-- Enum para status da inscrição
CREATE TYPE status_inscricao_enum AS ENUM (
    'pendente',       -- Inscrição realizada, aguardando revisão
    'confirmada',     -- Inscrição confirmada pela organização
    'cancelada',      -- Inscrição cancelada
    'compareceu'      -- Participante compareceu no evento
);

-- ============================================
-- TABELA: colaboradores
-- ============================================
-- Armazena os dados dos funcionários da FARMACE
-- que estão autorizados a se inscrever no evento
-- ============================================

CREATE TABLE colaboradores (
    -- Chave primária
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Dados pessoais
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    cpf VARCHAR(14) NOT NULL UNIQUE, -- Formato: XXX.XXX.XXX-XX
    data_nascimento DATE NOT NULL,

    -- Dados de contato (opcional, pode ser atualizado na inscrição)
    whatsapp VARCHAR(15), -- Formato: (XX) XXXXX-XXXX

    -- Status do colaborador
    ativo BOOLEAN NOT NULL DEFAULT true,

    -- Campos de auditoria
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ, -- Soft delete

    -- Constraints
    CONSTRAINT cpf_valido CHECK (cpf ~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$'),
    CONSTRAINT email_valido CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Comentários descritivos
COMMENT ON TABLE colaboradores IS 'Funcionários da FARMACE autorizados a participar do evento';
COMMENT ON COLUMN colaboradores.cpf IS 'CPF do colaborador (formato XXX.XXX.XXX-XX). Dado sensível - LGPD';
COMMENT ON COLUMN colaboradores.data_nascimento IS 'Data de nascimento (idade mínima: 16 anos para 3km/5km, 18 anos para 10km)';
COMMENT ON COLUMN colaboradores.deleted_at IS 'Data de exclusão lógica (soft delete)';

-- ============================================
-- TABELA: modalidades
-- ============================================
-- Modalidades de corrida disponíveis
-- ============================================

CREATE TABLE modalidades (
    -- Chave primária
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Dados da modalidade
    codigo VARCHAR(10) NOT NULL UNIQUE, -- Ex: '3km', '5km', '10km'
    nome VARCHAR(100) NOT NULL, -- Ex: 'Corrida 3KM', 'Corrida 5KM'
    descricao TEXT,
    distancia_km NUMERIC(5,2) NOT NULL, -- Distância em quilômetros
    idade_minima INTEGER NOT NULL DEFAULT 16, -- Idade mínima para participar

    -- Configuração
    ativo BOOLEAN NOT NULL DEFAULT true,
    premiacao BOOLEAN NOT NULL DEFAULT false, -- Se tem premiação (troféus)
    ordem_exibicao INTEGER NOT NULL DEFAULT 0, -- Ordem de exibição na interface

    -- Campos de auditoria
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE modalidades IS 'Modalidades de corrida disponíveis no evento';
COMMENT ON COLUMN modalidades.premiacao IS 'Indica se a modalidade tem premiação com troféus (5km e 10km)';

-- ============================================
-- TABELA: tamanhos_camiseta
-- ============================================
-- Tamanhos de camiseta disponíveis
-- ============================================

CREATE TABLE tamanhos_camiseta (
    -- Chave primária
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Dados do tamanho
    codigo VARCHAR(10) NOT NULL UNIQUE, -- Ex: 'P', 'M', 'G', 'GG', 'XG', 'EXG'
    nome VARCHAR(50) NOT NULL, -- Ex: 'Pequeno', 'Médio', 'Grande'
    altura_cm NUMERIC(5,2) NOT NULL, -- Altura da camiseta em cm
    largura_cm NUMERIC(5,2) NOT NULL, -- Largura da camiseta em cm

    -- Configuração
    ativo BOOLEAN NOT NULL DEFAULT true,
    ordem_exibicao INTEGER NOT NULL DEFAULT 0, -- Ordem de exibição (P, M, G...)

    -- Campos de auditoria
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE tamanhos_camiseta IS 'Tamanhos de camiseta disponíveis para o evento';
COMMENT ON COLUMN tamanhos_camiseta.altura_cm IS 'Altura da camiseta (do ombro à barra) em centímetros';
COMMENT ON COLUMN tamanhos_camiseta.largura_cm IS 'Largura da camiseta (de axila a axila) em centímetros';

-- ============================================
-- TABELA: inscricoes
-- ============================================
-- Inscrições dos colaboradores no evento
-- ============================================

CREATE TABLE inscricoes (
    -- Chave primária
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relacionamento com colaborador
    colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE RESTRICT,

    -- Número do participante (sequencial, único)
    numero_participante VARCHAR(10) NOT NULL UNIQUE, -- Formato: '0001', '0002', etc

    -- Dados de contato (podem ser diferentes dos dados do colaborador)
    email VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(15) NOT NULL, -- Obrigatório para confirmação

    -- Tipo de participação
    tipo_participacao tipo_participacao_enum NOT NULL,

    -- Modalidade (obrigatório se tipo_participacao = 'corrida-natal')
    modalidade_id UUID REFERENCES modalidades(id) ON DELETE RESTRICT,

    -- Tamanho da camiseta (obrigatório se tipo_participacao != 'retirar-cesta')
    tamanho_camiseta_id UUID REFERENCES tamanhos_camiseta(id) ON DELETE RESTRICT,

    -- Regulamento
    aceitou_regulamento BOOLEAN NOT NULL DEFAULT false,
    data_aceite_regulamento TIMESTAMPTZ,

    -- Status da inscrição
    status status_inscricao_enum NOT NULL DEFAULT 'pendente',

    -- Controle de kit
    kit_retirado BOOLEAN NOT NULL DEFAULT false,
    data_retirada_kit TIMESTAMPTZ,

    -- Dados de auditoria e timestamps
    data_inscricao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ, -- Soft delete

    -- Constraints
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

COMMENT ON TABLE inscricoes IS 'Inscrições dos colaboradores na II Corrida da Qualidade FARMACE';
COMMENT ON COLUMN inscricoes.numero_participante IS 'Número único do participante (formato 0001, 0002, etc)';
COMMENT ON COLUMN inscricoes.whatsapp IS 'WhatsApp para receber confirmação (formato: (XX) XXXXX-XXXX)';
COMMENT ON COLUMN inscricoes.tipo_participacao IS 'Tipo de participação: corrida+natal, apenas natal, ou apenas retirar cesta';
COMMENT ON COLUMN inscricoes.aceitou_regulamento IS 'Indica se o participante leu e aceitou o regulamento do evento';
COMMENT ON COLUMN inscricoes.kit_retirado IS 'Indica se o participante já retirou o kit (camiseta + número de peito)';
COMMENT ON COLUMN inscricoes.deleted_at IS 'Data de cancelamento/exclusão lógica (soft delete)';

-- ============================================
-- TABELA: historico_inscricoes
-- ============================================
-- Auditoria de mudanças nas inscrições
-- ============================================

CREATE TABLE historico_inscricoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inscricao_id UUID NOT NULL REFERENCES inscricoes(id) ON DELETE CASCADE,

    -- Dados da mudança
    campo_alterado VARCHAR(100) NOT NULL,
    valor_anterior TEXT,
    valor_novo TEXT,

    -- Usuário que fez a alteração (futura integração com auth)
    alterado_por VARCHAR(255),

    -- Timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE historico_inscricoes IS 'Histórico de alterações nas inscrições (auditoria)';

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices em colaboradores
CREATE INDEX idx_colaboradores_email ON colaboradores(email);
CREATE INDEX idx_colaboradores_cpf ON colaboradores(cpf);
CREATE INDEX idx_colaboradores_ativo ON colaboradores(ativo) WHERE ativo = true;
CREATE INDEX idx_colaboradores_deleted ON colaboradores(deleted_at) WHERE deleted_at IS NULL;

-- Índices em inscrições
CREATE INDEX idx_inscricoes_colaborador ON inscricoes(colaborador_id);
CREATE INDEX idx_inscricoes_numero_participante ON inscricoes(numero_participante);
CREATE INDEX idx_inscricoes_status ON inscricoes(status);
CREATE INDEX idx_inscricoes_tipo_participacao ON inscricoes(tipo_participacao);
CREATE INDEX idx_inscricoes_modalidade ON inscricoes(modalidade_id);
CREATE INDEX idx_inscricoes_data_inscricao ON inscricoes(data_inscricao);
CREATE INDEX idx_inscricoes_deleted ON inscricoes(deleted_at) WHERE deleted_at IS NULL;

-- Índice para histórico
CREATE INDEX idx_historico_inscricao ON historico_inscricoes(inscricao_id);
CREATE INDEX idx_historico_created_at ON historico_inscricoes(created_at);

-- ============================================
-- FUNCTIONS E TRIGGERS
-- ============================================

-- Function para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para colaboradores
CREATE TRIGGER trigger_colaboradores_updated_at
    BEFORE UPDATE ON colaboradores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para inscrições
CREATE TRIGGER trigger_inscricoes_updated_at
    BEFORE UPDATE ON inscricoes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para modalidades
CREATE TRIGGER trigger_modalidades_updated_at
    BEFORE UPDATE ON modalidades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tamanhos_camiseta
CREATE TRIGGER trigger_tamanhos_updated_at
    BEFORE UPDATE ON tamanhos_camiseta
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Registrar mudanças no histórico
-- ============================================

CREATE OR REPLACE FUNCTION registrar_historico_inscricao()
RETURNS TRIGGER AS $$
BEGIN
    -- Registra mudança de status
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO historico_inscricoes (inscricao_id, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, 'status', OLD.status::text, NEW.status::text);
    END IF;

    -- Registra mudança de tipo de participação
    IF OLD.tipo_participacao IS DISTINCT FROM NEW.tipo_participacao THEN
        INSERT INTO historico_inscricoes (inscricao_id, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, 'tipo_participacao', OLD.tipo_participacao::text, NEW.tipo_participacao::text);
    END IF;

    -- Registra mudança de modalidade
    IF OLD.modalidade_id IS DISTINCT FROM NEW.modalidade_id THEN
        INSERT INTO historico_inscricoes (inscricao_id, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, 'modalidade_id', OLD.modalidade_id::text, NEW.modalidade_id::text);
    END IF;

    -- Registra retirada de kit
    IF OLD.kit_retirado = false AND NEW.kit_retirado = true THEN
        INSERT INTO historico_inscricoes (inscricao_id, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, 'kit_retirado', 'false', 'true');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar histórico
CREATE TRIGGER trigger_inscricoes_historico
    AFTER UPDATE ON inscricoes
    FOR EACH ROW
    EXECUTE FUNCTION registrar_historico_inscricao();

-- ============================================
-- FUNCTION: Gerar número do participante
-- ============================================

CREATE OR REPLACE FUNCTION gerar_numero_participante()
RETURNS TRIGGER AS $$
DECLARE
    proximo_numero INTEGER;
    numero_formatado VARCHAR(10);
BEGIN
    -- Se o número já foi definido, não gera novamente
    IF NEW.numero_participante IS NOT NULL THEN
        RETURN NEW;
    END IF;

    -- Obtém o próximo número sequencial
    SELECT COALESCE(MAX(numero_participante::INTEGER), 0) + 1
    INTO proximo_numero
    FROM inscricoes
    WHERE numero_participante ~ '^\d+$'; -- Apenas números

    -- Formata com zeros à esquerda (0001, 0002, etc)
    numero_formatado := LPAD(proximo_numero::TEXT, 4, '0');

    -- Atribui o número gerado
    NEW.numero_participante := numero_formatado;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar número do participante automaticamente
CREATE TRIGGER trigger_gerar_numero_participante
    BEFORE INSERT ON inscricoes
    FOR EACH ROW
    EXECUTE FUNCTION gerar_numero_participante();

-- ============================================
-- FUNCTION: Validar idade mínima para modalidade
-- ============================================

CREATE OR REPLACE FUNCTION validar_idade_modalidade()
RETURNS TRIGGER AS $$
DECLARE
    idade INTEGER;
    idade_minima_modalidade INTEGER;
BEGIN
    -- Se não há modalidade, não valida
    IF NEW.modalidade_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Calcula a idade do colaborador
    SELECT EXTRACT(YEAR FROM AGE(c.data_nascimento))
    INTO idade
    FROM colaboradores c
    WHERE c.id = NEW.colaborador_id;

    -- Obtém a idade mínima da modalidade
    SELECT m.idade_minima
    INTO idade_minima_modalidade
    FROM modalidades m
    WHERE m.id = NEW.modalidade_id;

    -- Valida a idade
    IF idade < idade_minima_modalidade THEN
        RAISE EXCEPTION 'Idade mínima para esta modalidade é % anos. Idade atual: % anos',
            idade_minima_modalidade, idade;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar idade antes de inserir/atualizar
CREATE TRIGGER trigger_validar_idade_modalidade
    BEFORE INSERT OR UPDATE OF modalidade_id ON inscricoes
    FOR EACH ROW
    EXECUTE FUNCTION validar_idade_modalidade();

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View: Inscrições com dados completos
CREATE OR REPLACE VIEW v_inscricoes_completas AS
SELECT
    i.id,
    i.numero_participante,
    i.status,
    i.tipo_participacao,
    i.data_inscricao,
    i.kit_retirado,
    -- Dados do colaborador
    c.id as colaborador_id,
    c.nome as colaborador_nome,
    c.email as colaborador_email,
    c.cpf as colaborador_cpf,
    c.data_nascimento,
    EXTRACT(YEAR FROM AGE(c.data_nascimento)) as idade,
    -- Contato da inscrição
    i.email as email_inscricao,
    i.whatsapp,
    -- Modalidade
    m.codigo as modalidade_codigo,
    m.nome as modalidade_nome,
    m.distancia_km,
    -- Tamanho da camiseta
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

COMMENT ON VIEW v_inscricoes_completas IS 'View com dados completos das inscrições incluindo colaborador, modalidade e tamanho';

-- View: Estatísticas de inscrições
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

COMMENT ON VIEW v_estatisticas_inscricoes IS 'Estatísticas gerais das inscrições do evento';

-- ============================================
-- GRANTS (Permissões)
-- ============================================
-- Nota: Ajuste conforme as roles do seu Supabase
-- As políticas RLS serão definidas em policies.sql

-- Grant para authenticated users (Supabase)
GRANT SELECT ON colaboradores TO authenticated;
GRANT SELECT, INSERT, UPDATE ON inscricoes TO authenticated;
GRANT SELECT ON modalidades TO authenticated;
GRANT SELECT ON tamanhos_camiseta TO authenticated;
GRANT SELECT ON v_inscricoes_completas TO authenticated;
GRANT SELECT ON v_estatisticas_inscricoes TO authenticated;

-- Grant para service_role (admin)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================
-- FIM DO SCHEMA
-- ============================================
