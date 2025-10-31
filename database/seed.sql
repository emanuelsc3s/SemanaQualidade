-- ============================================
-- SEED DATA - II CORRIDA DA QUALIDADE FARMACE
-- ============================================
-- Database: Supabase PostgreSQL
-- Versão: 1.0.0
-- Data: 2025-10-31
--
-- Descrição: Dados iniciais para popular as tabelas do sistema
-- Inclui modalidades, tamanhos de camiseta e dados de exemplo
-- ============================================

-- ============================================
-- LIMPAR DADOS EXISTENTES (OPCIONAL - CUIDADO!)
-- ============================================
-- ATENÇÃO: Descomente apenas se quiser limpar os dados antes de inserir
-- TRUNCATE TABLE historico_inscricoes CASCADE;
-- TRUNCATE TABLE inscricoes CASCADE;
-- TRUNCATE TABLE colaboradores CASCADE;
-- TRUNCATE TABLE modalidades CASCADE;
-- TRUNCATE TABLE tamanhos_camiseta CASCADE;

-- ============================================
-- SEED: modalidades
-- ============================================

INSERT INTO modalidades (codigo, nome, descricao, distancia_km, idade_minima, ativo, premiacao, ordem_exibicao)
VALUES
    (
        '3km',
        'Corrida 3KM',
        'Caminhada ou Corrida Leve - Modalidade inclusiva sem premiação em troféus',
        3.00,
        16,
        true,
        false, -- Sem premiação
        1
    ),
    (
        '5km',
        'Corrida 5KM',
        'Corrida Intermediária - Os 3 primeiros gerais (masculino e feminino) serão premiados com troféus',
        5.00,
        16,
        true,
        true, -- Com premiação
        2
    ),
    (
        '10km',
        'Corrida 10KM',
        'Corrida Avançada - Os 3 primeiros gerais (masculino e feminino) serão premiados com troféus',
        10.00,
        18, -- Idade mínima maior para 10km
        true,
        true, -- Com premiação
        3
    )
ON CONFLICT (codigo) DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    distancia_km = EXCLUDED.distancia_km,
    idade_minima = EXCLUDED.idade_minima,
    ativo = EXCLUDED.ativo,
    premiacao = EXCLUDED.premiacao,
    ordem_exibicao = EXCLUDED.ordem_exibicao,
    updated_at = NOW();

-- ============================================
-- SEED: tamanhos_camiseta
-- ============================================

INSERT INTO tamanhos_camiseta (codigo, nome, altura_cm, largura_cm, ativo, ordem_exibicao)
VALUES
    ('P', 'Pequeno', 73.0, 50.0, true, 1),
    ('M', 'Médio', 75.0, 53.0, true, 2),
    ('G', 'Grande', 77.5, 55.0, true, 3),
    ('GG', 'Extra Grande', 80.0, 58.0, true, 4),
    ('XG', 'Extra Extra Grande', 82.5, 60.5, true, 5),
    ('EXG', 'Extra Extra Extra Grande', 85.0, 64.0, true, 6)
ON CONFLICT (codigo) DO UPDATE SET
    nome = EXCLUDED.nome,
    altura_cm = EXCLUDED.altura_cm,
    largura_cm = EXCLUDED.largura_cm,
    ativo = EXCLUDED.ativo,
    ordem_exibicao = EXCLUDED.ordem_exibicao,
    updated_at = NOW();

-- ============================================
-- SEED: colaboradores (EXEMPLO - REMOVER EM PRODUÇÃO)
-- ============================================
-- ATENÇÃO: Estes são dados de exemplo para desenvolvimento
-- Em produção, os colaboradores devem ser importados do sistema de RH da FARMACE

-- Descomente para inserir dados de exemplo:

/*
INSERT INTO colaboradores (nome, email, cpf, data_nascimento, whatsapp, ativo)
VALUES
    (
        'João da Silva',
        'joao.silva@farmace.com.br',
        '123.456.789-01',
        '1990-05-15',
        '(88) 99999-1111',
        true
    ),
    (
        'Maria Santos',
        'maria.santos@farmace.com.br',
        '987.654.321-02',
        '1985-08-22',
        '(88) 99999-2222',
        true
    ),
    (
        'Pedro Oliveira',
        'pedro.oliveira@farmace.com.br',
        '111.222.333-44',
        '1992-03-10',
        '(88) 99999-3333',
        true
    ),
    (
        'Ana Costa',
        'ana.costa@farmace.com.br',
        '555.666.777-88',
        '1995-11-30',
        '(88) 99999-4444',
        true
    ),
    (
        'Carlos Souza',
        'carlos.souza@farmace.com.br',
        '999.888.777-66',
        '1988-07-18',
        '(88) 99999-5555',
        true
    )
ON CONFLICT (email) DO NOTHING;
*/

-- ============================================
-- SEED: inscricoes (EXEMPLO - REMOVER EM PRODUÇÃO)
-- ============================================
-- ATENÇÃO: Estes são dados de exemplo para desenvolvimento
-- Descomente para inserir inscrições de exemplo:

/*
-- Inscrição de exemplo 1: João - Corrida 5KM
INSERT INTO inscricoes (
    colaborador_id,
    email,
    whatsapp,
    tipo_participacao,
    modalidade_id,
    tamanho_camiseta_id,
    aceitou_regulamento,
    data_aceite_regulamento,
    status
)
SELECT
    c.id,
    'joao.silva@farmace.com.br',
    '(88) 99999-1111',
    'corrida-natal',
    m.id,
    t.id,
    true,
    NOW(),
    'confirmada'
FROM colaboradores c
CROSS JOIN modalidades m
CROSS JOIN tamanhos_camiseta t
WHERE c.email = 'joao.silva@farmace.com.br'
  AND m.codigo = '5km'
  AND t.codigo = 'M'
LIMIT 1;

-- Inscrição de exemplo 2: Maria - Corrida 10KM
INSERT INTO inscricoes (
    colaborador_id,
    email,
    whatsapp,
    tipo_participacao,
    modalidade_id,
    tamanho_camiseta_id,
    aceitou_regulamento,
    data_aceite_regulamento,
    status
)
SELECT
    c.id,
    'maria.santos@farmace.com.br',
    '(88) 99999-2222',
    'corrida-natal',
    m.id,
    t.id,
    true,
    NOW(),
    'confirmada'
FROM colaboradores c
CROSS JOIN modalidades m
CROSS JOIN tamanhos_camiseta t
WHERE c.email = 'maria.santos@farmace.com.br'
  AND m.codigo = '10km'
  AND t.codigo = 'P'
LIMIT 1;

-- Inscrição de exemplo 3: Pedro - Apenas Natal
INSERT INTO inscricoes (
    colaborador_id,
    email,
    whatsapp,
    tipo_participacao,
    modalidade_id,
    tamanho_camiseta_id,
    aceitou_regulamento,
    data_aceite_regulamento,
    status
)
SELECT
    c.id,
    'pedro.oliveira@farmace.com.br',
    '(88) 99999-3333',
    'apenas-natal',
    NULL, -- Sem modalidade
    t.id,
    true,
    NOW(),
    'pendente'
FROM colaboradores c
CROSS JOIN tamanhos_camiseta t
WHERE c.email = 'pedro.oliveira@farmace.com.br'
  AND t.codigo = 'G'
LIMIT 1;

-- Inscrição de exemplo 4: Ana - Retirar Cesta
INSERT INTO inscricoes (
    colaborador_id,
    email,
    whatsapp,
    tipo_participacao,
    modalidade_id,
    tamanho_camiseta_id,
    aceitou_regulamento,
    data_aceite_regulamento,
    status
)
SELECT
    c.id,
    'ana.costa@farmace.com.br',
    '(88) 99999-4444',
    'retirar-cesta',
    NULL, -- Sem modalidade
    NULL, -- Sem camiseta
    true,
    NOW(),
    'pendente'
FROM colaboradores c
WHERE c.email = 'ana.costa@farmace.com.br'
LIMIT 1;
*/

-- ============================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- ============================================

-- Mostra as modalidades inseridas
SELECT
    codigo,
    nome,
    distancia_km,
    idade_minima,
    premiacao,
    ativo
FROM modalidades
ORDER BY ordem_exibicao;

-- Mostra os tamanhos inseridos
SELECT
    codigo,
    nome,
    altura_cm,
    largura_cm,
    ativo
FROM tamanhos_camiseta
ORDER BY ordem_exibicao;

-- Mostra estatísticas
SELECT
    'Modalidades cadastradas' as tipo,
    COUNT(*) as total
FROM modalidades
UNION ALL
SELECT
    'Tamanhos cadastrados' as tipo,
    COUNT(*) as total
FROM tamanhos_camiseta
UNION ALL
SELECT
    'Colaboradores cadastrados' as tipo,
    COUNT(*) as total
FROM colaboradores
UNION ALL
SELECT
    'Inscrições realizadas' as tipo,
    COUNT(*) as total
FROM inscricoes
WHERE deleted_at IS NULL;

-- ============================================
-- NOTES
-- ============================================

/*
NOTAS IMPORTANTES:

1. **Dados de Exemplo**:
   - Os dados de colaboradores e inscrições são apenas exemplos
   - REMOVA ou comente em ambiente de produção
   - Use apenas para desenvolvimento e testes

2. **Importação de Colaboradores**:
   - Em produção, importe os dados reais do sistema de RH da FARMACE
   - Certifique-se de formatar CPF no padrão XXX.XXX.XXX-XX
   - Valide emails e telefones antes de importar

3. **Modalidades e Tamanhos**:
   - Estes dados devem permanecer em produção
   - São configurações essenciais do evento
   - Podem ser ajustados conforme necessário

4. **Conflitos**:
   - As inserções usam ON CONFLICT DO UPDATE
   - Isso permite re-executar o script sem duplicar dados
   - Útil para atualizações de configuração

5. **Script Idempotente**:
   - O script pode ser executado múltiplas vezes
   - Não duplicará dados graças ao ON CONFLICT
   - Seguro para usar em migrations

6. **Ordem de Execução**:
   Sempre execute os scripts nesta ordem:
   1. schema.sql (cria estrutura)
   2. policies.sql (adiciona segurança)
   3. seed.sql (popula dados)
*/

-- ============================================
-- FIM DO SEED DATA
-- ============================================
