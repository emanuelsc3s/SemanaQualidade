-- =====================================================
-- FIX: Corrigir estrutura da tabela tbempresa
-- =====================================================
-- PROBLEMA: empresa_id não está definido como PRIMARY KEY
--          e as foreign keys usam 'codigo' ao invés de 'empresa_id'
-- =====================================================

-- IMPORTANTE: Execute este script ANTES de inserir dados!
-- Se já existem dados, será necessário migração adicional.

BEGIN;

-- 1. Adicionar PRIMARY KEY no empresa_id
ALTER TABLE tbempresa
    ADD CONSTRAINT pk_tbempresa PRIMARY KEY (empresa_id);

-- 2. Garantir que 'codigo' seja UNIQUE (necessário para foreign keys)
ALTER TABLE tbempresa
    ADD CONSTRAINT uk_tbempresa_codigo UNIQUE (codigo);

-- 3. Adicionar UNIQUE constraint no CNPJ (boa prática)
ALTER TABLE tbempresa
    ADD CONSTRAINT uk_tbempresa_cnpj UNIQUE (cnpj);

-- 4. Adicionar comentários
COMMENT ON TABLE tbempresa IS 'Tabela de empresas do grupo FARMACE';
COMMENT ON COLUMN tbempresa.empresa_id IS 'ID único autoincrementável da empresa (chave primária)';
COMMENT ON COLUMN tbempresa.codigo IS 'Código legado da empresa (usado em foreign keys para compatibilidade)';
COMMENT ON COLUMN tbempresa.cnpj IS 'CNPJ da empresa (formato: XX.XXX.XXX/XXXX-XX)';

-- 5. Criar índice no campo 'codigo' para performance
CREATE INDEX idx_tbempresa_codigo ON tbempresa(codigo);

-- 6. Criar índice no campo 'ativo' para filtros comuns
CREATE INDEX idx_tbempresa_ativo ON tbempresa(ativo);

COMMIT;

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================
-- Execute após aplicar o fix:
-- SELECT * FROM pg_indexes WHERE tablename = 'tbempresa';
-- SELECT * FROM pg_constraint WHERE conrelid = 'tbempresa'::regclass;
