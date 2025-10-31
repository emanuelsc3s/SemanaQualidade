-- ============================================
-- MIGRATION 002: Row Level Security Policies
-- ============================================
-- Data: 2025-10-31
-- Descrição: Adiciona políticas de Row Level Security (RLS)
-- para controlar acesso aos dados
-- ============================================

-- Habilita RLS em todas as tabelas
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscricoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE modalidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE tamanhos_camiseta ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_inscricoes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Functions auxiliares
-- ============================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (auth.jwt() ->> 'role' = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_own_colaborador(colaborador_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (auth.uid()::text = colaborador_uuid::text);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Políticas: colaboradores
-- ============================================

CREATE POLICY "Colaboradores podem ver seus próprios dados"
    ON colaboradores
    FOR SELECT
    TO authenticated
    USING (
        auth.uid()::text = id::text OR
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Admins podem ver todos os colaboradores"
    ON colaboradores
    FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Colaboradores podem atualizar seus dados"
    ON colaboradores
    FOR UPDATE
    TO authenticated
    USING (auth.uid()::text = id::text)
    WITH CHECK (
        auth.uid()::text = id::text AND
        (OLD.cpf = NEW.cpf) AND
        (OLD.email = NEW.email)
    );

CREATE POLICY "Admins podem gerenciar colaboradores"
    ON colaboradores
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- Políticas: modalidades
-- ============================================

CREATE POLICY "Todos podem ver modalidades ativas"
    ON modalidades
    FOR SELECT
    TO authenticated
    USING (ativo = true);

CREATE POLICY "Admins podem gerenciar modalidades"
    ON modalidades
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- Políticas: tamanhos_camiseta
-- ============================================

CREATE POLICY "Todos podem ver tamanhos ativos"
    ON tamanhos_camiseta
    FOR SELECT
    TO authenticated
    USING (ativo = true);

CREATE POLICY "Admins podem gerenciar tamanhos"
    ON tamanhos_camiseta
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- Políticas: inscricoes
-- ============================================

CREATE POLICY "Colaboradores podem ver suas inscrições"
    ON inscricoes
    FOR SELECT
    TO authenticated
    USING (
        auth.uid()::text = colaborador_id::text OR
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Colaboradores podem criar inscrições"
    ON inscricoes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid()::text = colaborador_id::text AND
        NOT EXISTS (
            SELECT 1 FROM inscricoes i
            WHERE i.colaborador_id = colaborador_id
            AND i.deleted_at IS NULL
        )
    );

CREATE POLICY "Colaboradores podem atualizar suas inscrições"
    ON inscricoes
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid()::text = colaborador_id::text AND
        status = 'pendente'
    )
    WITH CHECK (
        auth.uid()::text = colaborador_id::text AND
        (OLD.colaborador_id = NEW.colaborador_id) AND
        (OLD.numero_participante = NEW.numero_participante) AND
        (OLD.data_inscricao = NEW.data_inscricao) AND
        (NEW.status = 'pendente')
    );

CREATE POLICY "Colaboradores podem cancelar inscrições"
    ON inscricoes
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid()::text = colaborador_id::text AND
        status IN ('pendente', 'confirmada')
    )
    WITH CHECK (
        auth.uid()::text = colaborador_id::text AND
        NEW.status = 'cancelada' AND
        NEW.deleted_at IS NOT NULL
    );

CREATE POLICY "Admins podem ver todas as inscrições"
    ON inscricoes
    FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins podem gerenciar inscrições"
    ON inscricoes
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- Políticas: historico_inscricoes
-- ============================================

CREATE POLICY "Colaboradores podem ver histórico de suas inscrições"
    ON historico_inscricoes
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM inscricoes i
            WHERE i.id = historico_inscricoes.inscricao_id
            AND i.colaborador_id::text = auth.uid()::text
        ) OR
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Admins podem ver todo histórico"
    ON historico_inscricoes
    FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Sistema pode inserir histórico"
    ON historico_inscricoes
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================
-- FIM DA MIGRATION 002
-- ============================================
