-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Database: Supabase PostgreSQL
-- Versão: 1.0.0
-- Data: 2025-10-31
--
-- Descrição: Políticas de segurança em nível de linha (RLS)
-- para controlar acesso aos dados do evento FARMACE
-- ============================================

-- ============================================
-- HABILITAR RLS NAS TABELAS
-- ============================================

-- Ativa RLS em todas as tabelas
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscricoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE modalidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE tamanhos_camiseta ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_inscricoes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES: colaboradores
-- ============================================

-- Policy: Colaboradores podem ver apenas seus próprios dados
CREATE POLICY "Colaboradores podem ver seus próprios dados"
    ON colaboradores
    FOR SELECT
    TO authenticated
    USING (
        auth.uid()::text = id::text OR
        auth.jwt() ->> 'role' = 'admin'
    );

-- Policy: Admins podem ver todos os colaboradores
CREATE POLICY "Admins podem ver todos os colaboradores"
    ON colaboradores
    FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- Policy: Colaboradores podem atualizar seus próprios dados (limitado)
CREATE POLICY "Colaboradores podem atualizar seus dados"
    ON colaboradores
    FOR UPDATE
    TO authenticated
    USING (auth.uid()::text = id::text)
    WITH CHECK (
        auth.uid()::text = id::text AND
        -- Não permite alterar campos críticos
        (OLD.cpf = NEW.cpf) AND
        (OLD.email = NEW.email)
    );

-- Policy: Admins podem gerenciar todos os colaboradores
CREATE POLICY "Admins podem gerenciar colaboradores"
    ON colaboradores
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- POLICIES: modalidades
-- ============================================

-- Policy: Todos podem ver modalidades ativas
CREATE POLICY "Todos podem ver modalidades ativas"
    ON modalidades
    FOR SELECT
    TO authenticated
    USING (ativo = true);

-- Policy: Admins podem gerenciar modalidades
CREATE POLICY "Admins podem gerenciar modalidades"
    ON modalidades
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- POLICIES: tamanhos_camiseta
-- ============================================

-- Policy: Todos podem ver tamanhos ativos
CREATE POLICY "Todos podem ver tamanhos ativos"
    ON tamanhos_camiseta
    FOR SELECT
    TO authenticated
    USING (ativo = true);

-- Policy: Admins podem gerenciar tamanhos
CREATE POLICY "Admins podem gerenciar tamanhos"
    ON tamanhos_camiseta
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- POLICIES: inscricoes
-- ============================================

-- Policy: Colaboradores podem ver suas próprias inscrições
CREATE POLICY "Colaboradores podem ver suas inscrições"
    ON inscricoes
    FOR SELECT
    TO authenticated
    USING (
        auth.uid()::text = colaborador_id::text OR
        auth.jwt() ->> 'role' = 'admin'
    );

-- Policy: Colaboradores podem criar inscrições para si mesmos
CREATE POLICY "Colaboradores podem criar inscrições"
    ON inscricoes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid()::text = colaborador_id::text AND
        -- Não pode criar se já existe inscrição ativa
        NOT EXISTS (
            SELECT 1 FROM inscricoes i
            WHERE i.colaborador_id = colaborador_id
            AND i.deleted_at IS NULL
        )
    );

-- Policy: Colaboradores podem atualizar suas inscrições (limitado)
CREATE POLICY "Colaboradores podem atualizar suas inscrições"
    ON inscricoes
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid()::text = colaborador_id::text AND
        status = 'pendente' -- Só pode editar se ainda estiver pendente
    )
    WITH CHECK (
        auth.uid()::text = colaborador_id::text AND
        -- Não permite alterar campos críticos
        (OLD.colaborador_id = NEW.colaborador_id) AND
        (OLD.numero_participante = NEW.numero_participante) AND
        (OLD.data_inscricao = NEW.data_inscricao) AND
        -- Mantém status como pendente
        (NEW.status = 'pendente')
    );

-- Policy: Colaboradores podem cancelar (soft delete) suas inscrições
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

-- Policy: Admins podem ver todas as inscrições
CREATE POLICY "Admins podem ver todas as inscrições"
    ON inscricoes
    FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- Policy: Admins podem gerenciar todas as inscrições
CREATE POLICY "Admins podem gerenciar inscrições"
    ON inscricoes
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- POLICIES: historico_inscricoes
-- ============================================

-- Policy: Colaboradores podem ver histórico de suas inscrições
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

-- Policy: Admins podem ver todo o histórico
CREATE POLICY "Admins podem ver todo histórico"
    ON historico_inscricoes
    FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- Policy: Sistema pode inserir no histórico (via trigger)
CREATE POLICY "Sistema pode inserir histórico"
    ON historico_inscricoes
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================
-- POLICIES PARA SERVICE ROLE (BYPASS RLS)
-- ============================================

-- Service role tem acesso completo (usado pelo backend)
-- O service_role do Supabase automaticamente bypassa RLS

-- ============================================
-- POLICIES ADICIONAIS DE SEGURANÇA
-- ============================================

-- Function helper para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (auth.jwt() ->> 'role' = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function helper para verificar se usuário é o próprio colaborador
CREATE OR REPLACE FUNCTION is_own_colaborador(colaborador_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (auth.uid()::text = colaborador_uuid::text);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- NOTES E CONSIDERAÇÕES
-- ============================================

/*
NOTAS DE SEGURANÇA:

1. **Autenticação**:
   - As policies assumem que o Supabase Auth está configurado
   - auth.uid() retorna o UUID do usuário autenticado
   - auth.jwt() contém o JWT token com metadados (role, etc)

2. **Roles**:
   - 'authenticated': Usuário autenticado (colaborador)
   - 'admin': Administrador do sistema (precisa ser configurado no JWT)

3. **Soft Delete**:
   - Usa deleted_at para exclusão lógica
   - Políticas devem considerar deleted_at IS NULL

4. **Limitações**:
   - Colaboradores só podem criar UMA inscrição
   - Colaboradores só podem editar inscrições com status 'pendente'
   - Campos críticos não podem ser alterados pelos colaboradores

5. **Auditoria**:
   - Histórico de mudanças é registrado automaticamente via trigger
   - Colaboradores podem ver histórico de suas próprias inscrições

6. **Service Role**:
   - O backend deve usar service_role para operações privilegiadas
   - Service role bypassa todas as políticas RLS

7. **Configuração de Admin**:
   Para tornar um usuário admin, você precisa adicionar o campo 'role' no JWT:

   ```sql
   -- No Supabase SQL Editor:
   UPDATE auth.users
   SET raw_app_meta_data =
     raw_app_meta_data || '{"role": "admin"}'::jsonb
   WHERE email = 'admin@farmace.com.br';
   ```

8. **Teste das Policies**:
   Sempre teste as políticas com diferentes usuários para garantir
   que estão funcionando corretamente.
*/

-- ============================================
-- FIM DAS POLICIES
-- ============================================
