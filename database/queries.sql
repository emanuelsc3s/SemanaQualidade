-- ============================================
-- QUERIES ÚTEIS - II CORRIDA DA QUALIDADE FARMACE
-- ============================================
-- Database: Supabase PostgreSQL
-- Versão: 1.0.0
-- Data: 2025-10-31
--
-- Descrição: Consultas SQL úteis para análises, relatórios
-- e operações comuns do sistema de inscrições
-- ============================================

-- ============================================
-- 1. CONSULTAS BÁSICAS
-- ============================================

-- 1.1. Listar todas as inscrições ativas com dados completos
SELECT
    i.numero_participante,
    c.nome,
    c.email,
    i.whatsapp,
    i.tipo_participacao,
    m.nome as modalidade,
    t.codigo as tamanho_camiseta,
    i.status,
    i.data_inscricao
FROM inscricoes i
INNER JOIN colaboradores c ON i.colaborador_id = c.id
LEFT JOIN modalidades m ON i.modalidade_id = m.id
LEFT JOIN tamanhos_camiseta t ON i.tamanho_camiseta_id = t.id
WHERE i.deleted_at IS NULL
ORDER BY i.numero_participante;

-- 1.2. Buscar inscrição por número do participante
SELECT *
FROM v_inscricoes_completas
WHERE numero_participante = '0001'; -- Substituir pelo número desejado

-- 1.3. Buscar inscrições por nome do colaborador
SELECT *
FROM v_inscricoes_completas
WHERE colaborador_nome ILIKE '%João%' -- Substituir pelo nome
ORDER BY data_inscricao DESC;

-- 1.4. Buscar inscrição por CPF
SELECT
    i.*,
    c.nome,
    c.cpf
FROM inscricoes i
INNER JOIN colaboradores c ON i.colaborador_id = c.id
WHERE c.cpf = '123.456.789-01' -- Substituir pelo CPF
  AND i.deleted_at IS NULL;

-- ============================================
-- 2. ESTATÍSTICAS E RELATÓRIOS
-- ============================================

-- 2.1. Estatísticas gerais de inscrições
SELECT * FROM v_estatisticas_inscricoes;

-- 2.2. Inscrições por modalidade
SELECT
    COALESCE(m.nome, 'Sem modalidade') as modalidade,
    COUNT(*) as total_inscritos,
    COUNT(*) FILTER (WHERE i.status = 'confirmada') as confirmados,
    COUNT(*) FILTER (WHERE i.status = 'pendente') as pendentes
FROM inscricoes i
LEFT JOIN modalidades m ON i.modalidade_id = m.id
WHERE i.deleted_at IS NULL
GROUP BY m.nome
ORDER BY total_inscritos DESC;

-- 2.3. Inscrições por tipo de participação
SELECT
    tipo_participacao,
    COUNT(*) as total,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentual
FROM inscricoes
WHERE deleted_at IS NULL
GROUP BY tipo_participacao
ORDER BY total DESC;

-- 2.4. Distribuição por tamanho de camiseta
SELECT
    COALESCE(t.codigo, 'Sem camiseta') as tamanho,
    COUNT(*) as quantidade,
    ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER (), 0), 2) as percentual
FROM inscricoes i
LEFT JOIN tamanhos_camiseta t ON i.tamanho_camiseta_id = t.id
WHERE i.deleted_at IS NULL
  AND i.tipo_participacao != 'retirar-cesta' -- Exclui quem não vai receber camiseta
GROUP BY t.codigo, t.ordem_exibicao
ORDER BY t.ordem_exibicao NULLS LAST;

-- 2.5. Inscrições por faixa etária
SELECT
    CASE
        WHEN idade < 20 THEN 'Menos de 20 anos'
        WHEN idade BETWEEN 20 AND 29 THEN '20-29 anos'
        WHEN idade BETWEEN 30 AND 39 THEN '30-39 anos'
        WHEN idade BETWEEN 40 AND 49 THEN '40-49 anos'
        WHEN idade BETWEEN 50 AND 59 THEN '50-59 anos'
        ELSE '60+ anos'
    END as faixa_etaria,
    COUNT(*) as total
FROM v_inscricoes_completas
GROUP BY faixa_etaria
ORDER BY MIN(idade);

-- 2.6. Inscrições por dia
SELECT
    DATE(data_inscricao) as dia,
    COUNT(*) as inscricoes,
    SUM(COUNT(*)) OVER (ORDER BY DATE(data_inscricao)) as acumulado
FROM inscricoes
WHERE deleted_at IS NULL
GROUP BY DATE(data_inscricao)
ORDER BY dia;

-- ============================================
-- 3. CONTROLE DE KITS
-- ============================================

-- 3.1. Kits pendentes de retirada
SELECT
    i.numero_participante,
    c.nome,
    i.whatsapp,
    m.nome as modalidade,
    t.codigo as tamanho_camiseta,
    i.status
FROM inscricoes i
INNER JOIN colaboradores c ON i.colaborador_id = c.id
LEFT JOIN modalidades m ON i.modalidade_id = m.id
LEFT JOIN tamanhos_camiseta t ON i.tamanho_camiseta_id = t.id
WHERE i.deleted_at IS NULL
  AND i.kit_retirado = false
  AND i.status = 'confirmada'
  AND i.tipo_participacao != 'retirar-cesta' -- Quem só vai retirar cesta não tem kit
ORDER BY i.numero_participante;

-- 3.2. Kits já retirados
SELECT
    i.numero_participante,
    c.nome,
    i.data_retirada_kit,
    m.nome as modalidade,
    t.codigo as tamanho_camiseta
FROM inscricoes i
INNER JOIN colaboradores c ON i.colaborador_id = c.id
LEFT JOIN modalidades m ON i.modalidade_id = m.id
LEFT JOIN tamanhos_camiseta t ON i.tamanho_camiseta_id = t.id
WHERE i.kit_retirado = true
  AND i.deleted_at IS NULL
ORDER BY i.data_retirada_kit DESC;

-- 3.3. Total de kits por tamanho (para controle de estoque)
SELECT
    t.codigo as tamanho,
    COUNT(*) as quantidade_total,
    COUNT(*) FILTER (WHERE i.kit_retirado = true) as ja_retirados,
    COUNT(*) FILTER (WHERE i.kit_retirado = false) as pendentes
FROM inscricoes i
INNER JOIN tamanhos_camiseta t ON i.tamanho_camiseta_id = t.id
WHERE i.deleted_at IS NULL
  AND i.status = 'confirmada'
  AND i.tipo_participacao != 'retirar-cesta'
GROUP BY t.codigo, t.ordem_exibicao
ORDER BY t.ordem_exibicao;

-- ============================================
-- 4. VALIDAÇÕES E VERIFICAÇÕES
-- ============================================

-- 4.1. Verificar inscrições duplicadas (mesmo colaborador)
SELECT
    c.nome,
    c.email,
    COUNT(*) as total_inscricoes
FROM inscricoes i
INNER JOIN colaboradores c ON i.colaborador_id = c.id
WHERE i.deleted_at IS NULL
GROUP BY c.id, c.nome, c.email
HAVING COUNT(*) > 1;

-- 4.2. Verificar colaboradores sem inscrição
SELECT
    c.nome,
    c.email,
    c.whatsapp
FROM colaboradores c
WHERE c.ativo = true
  AND c.deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM inscricoes i
      WHERE i.colaborador_id = c.id
        AND i.deleted_at IS NULL
  )
ORDER BY c.nome;

-- 4.3. Verificar idade mínima para modalidades
SELECT
    i.numero_participante,
    c.nome,
    EXTRACT(YEAR FROM AGE(c.data_nascimento)) as idade,
    m.nome as modalidade,
    m.idade_minima as idade_minima_requerida,
    CASE
        WHEN EXTRACT(YEAR FROM AGE(c.data_nascimento)) >= m.idade_minima THEN 'OK'
        ELSE 'IDADE INSUFICIENTE'
    END as status_idade
FROM inscricoes i
INNER JOIN colaboradores c ON i.colaborador_id = c.id
INNER JOIN modalidades m ON i.modalidade_id = m.id
WHERE i.deleted_at IS NULL
  AND i.tipo_participacao = 'corrida-natal'
ORDER BY status_idade DESC, i.numero_participante;

-- 4.4. Inscrições com dados de contato inconsistentes
SELECT
    i.numero_participante,
    c.nome,
    c.email as email_cadastro,
    i.email as email_inscricao,
    c.whatsapp as whatsapp_cadastro,
    i.whatsapp as whatsapp_inscricao
FROM inscricoes i
INNER JOIN colaboradores c ON i.colaborador_id = c.id
WHERE i.deleted_at IS NULL
  AND (
      c.email != i.email OR
      (c.whatsapp IS NOT NULL AND c.whatsapp != i.whatsapp)
  );

-- ============================================
-- 5. HISTÓRICO E AUDITORIA
-- ============================================

-- 5.1. Histórico de mudanças de uma inscrição
SELECT
    h.created_at as data_mudanca,
    h.campo_alterado,
    h.valor_anterior,
    h.valor_novo,
    h.alterado_por
FROM historico_inscricoes h
WHERE h.inscricao_id = 'UUID_DA_INSCRICAO' -- Substituir pelo UUID
ORDER BY h.created_at DESC;

-- 5.2. Últimas mudanças de status
SELECT
    i.numero_participante,
    c.nome,
    h.valor_anterior as status_anterior,
    h.valor_novo as status_novo,
    h.created_at as data_mudanca
FROM historico_inscricoes h
INNER JOIN inscricoes i ON h.inscricao_id = i.id
INNER JOIN colaboradores c ON i.colaborador_id = c.id
WHERE h.campo_alterado = 'status'
ORDER BY h.created_at DESC
LIMIT 20;

-- 5.3. Inscrições canceladas
SELECT
    i.numero_participante,
    c.nome,
    c.email,
    i.tipo_participacao,
    m.nome as modalidade,
    i.data_inscricao,
    i.deleted_at as data_cancelamento
FROM inscricoes i
INNER JOIN colaboradores c ON i.colaborador_id = c.id
LEFT JOIN modalidades m ON i.modalidade_id = m.id
WHERE i.status = 'cancelada'
  OR i.deleted_at IS NOT NULL
ORDER BY i.deleted_at DESC;

-- ============================================
-- 6. OPERAÇÕES ADMINISTRATIVAS
-- ============================================

-- 6.1. Confirmar uma inscrição
-- UPDATE inscricoes
-- SET status = 'confirmada',
--     updated_at = NOW()
-- WHERE numero_participante = '0001'
--   AND status = 'pendente';

-- 6.2. Registrar retirada de kit
-- UPDATE inscricoes
-- SET kit_retirado = true,
--     data_retirada_kit = NOW(),
--     updated_at = NOW()
-- WHERE numero_participante = '0001'
--   AND status = 'confirmada';

-- 6.3. Cancelar inscrição (soft delete)
-- UPDATE inscricoes
-- SET status = 'cancelada',
--     deleted_at = NOW(),
--     updated_at = NOW()
-- WHERE numero_participante = '0001';

-- 6.4. Confirmar todas as inscrições pendentes de uma vez
-- UPDATE inscricoes
-- SET status = 'confirmada',
--     updated_at = NOW()
-- WHERE status = 'pendente'
--   AND deleted_at IS NULL;

-- 6.5. Marcar comparecimento no evento
-- UPDATE inscricoes
-- SET status = 'compareceu',
--     updated_at = NOW()
-- WHERE numero_participante = '0001'
--   AND status = 'confirmada';

-- ============================================
-- 7. RELATÓRIOS PARA IMPRESSÃO
-- ============================================

-- 7.1. Lista de inscritos para check-in (ordenada por número)
SELECT
    i.numero_participante as "Nº",
    c.nome as "Nome Completo",
    m.codigo as "Modalidade",
    t.codigo as "Tamanho",
    '____' as "Assinatura",
    '____' as "Kit Retirado"
FROM inscricoes i
INNER JOIN colaboradores c ON i.colaborador_id = c.id
LEFT JOIN modalidades m ON i.modalidade_id = m.id
LEFT JOIN tamanhos_camiseta t ON i.tamanho_camiseta_id = t.id
WHERE i.status = 'confirmada'
  AND i.deleted_at IS NULL
ORDER BY i.numero_participante;

-- 7.2. Lista de participantes por modalidade (para organizadores)
SELECT
    m.nome as "Modalidade",
    i.numero_participante as "Nº Peito",
    c.nome as "Nome",
    EXTRACT(YEAR FROM AGE(c.data_nascimento)) as "Idade",
    CASE
        WHEN EXTRACT(YEAR FROM AGE(c.data_nascimento)) >= 18 THEN 'Adulto'
        ELSE 'Menor'
    END as "Categoria Idade"
FROM inscricoes i
INNER JOIN colaboradores c ON i.colaborador_id = c.id
INNER JOIN modalidades m ON i.modalidade_id = m.id
WHERE i.deleted_at IS NULL
  AND i.status = 'confirmada'
  AND i.tipo_participacao = 'corrida-natal'
ORDER BY m.ordem_exibicao, i.numero_participante;

-- 7.3. Lista de contatos para avisos via WhatsApp
SELECT
    c.nome,
    i.whatsapp,
    i.tipo_participacao,
    m.codigo as modalidade
FROM inscricoes i
INNER JOIN colaboradores c ON i.colaborador_id = c.id
LEFT JOIN modalidades m ON i.modalidade_id = m.id
WHERE i.deleted_at IS NULL
  AND i.status = 'confirmada'
ORDER BY i.numero_participante;

-- ============================================
-- 8. ANÁLISES AVANÇADAS
-- ============================================

-- 8.1. Taxa de conversão (pendentes → confirmadas)
SELECT
    COUNT(*) as total_inscricoes,
    COUNT(*) FILTER (WHERE status = 'pendente') as pendentes,
    COUNT(*) FILTER (WHERE status = 'confirmada') as confirmadas,
    COUNT(*) FILTER (WHERE status = 'cancelada') as canceladas,
    ROUND(
        COUNT(*) FILTER (WHERE status = 'confirmada') * 100.0 /
        NULLIF(COUNT(*), 0),
        2
    ) as taxa_confirmacao_pct
FROM inscricoes
WHERE deleted_at IS NULL;

-- 8.2. Tempo médio entre inscrição e confirmação
SELECT
    AVG(
        EXTRACT(EPOCH FROM (updated_at - data_inscricao)) / 3600
    )::NUMERIC(10,2) as horas_media,
    MIN(updated_at - data_inscricao) as tempo_minimo,
    MAX(updated_at - data_inscricao) as tempo_maximo
FROM inscricoes
WHERE status = 'confirmada'
  AND deleted_at IS NULL;

-- 8.3. Participantes que se inscreveram nas últimas 24 horas
SELECT
    i.numero_participante,
    c.nome,
    i.tipo_participacao,
    m.nome as modalidade,
    i.data_inscricao
FROM inscricoes i
INNER JOIN colaboradores c ON i.colaborador_id = c.id
LEFT JOIN modalidades m ON i.modalidade_id = m.id
WHERE i.data_inscricao >= NOW() - INTERVAL '24 hours'
  AND i.deleted_at IS NULL
ORDER BY i.data_inscricao DESC;

-- ============================================
-- 9. BUSCA E FILTROS AVANÇADOS
-- ============================================

-- 9.1. Busca full-text por nome ou email
SELECT *
FROM v_inscricoes_completas
WHERE colaborador_nome ILIKE '%termo%'
   OR colaborador_email ILIKE '%termo%'
ORDER BY data_inscricao DESC;

-- 9.2. Filtrar por múltiplos critérios
SELECT *
FROM v_inscricoes_completas
WHERE status = 'confirmada'
  AND modalidade_codigo IN ('5km', '10km')
  AND idade >= 18
  AND tamanho_codigo IN ('M', 'G')
ORDER BY numero_participante;

-- ============================================
-- 10. EXPORTAÇÃO DE DADOS
-- ============================================

-- 10.1. Exportar dados completos para CSV (use em ferramentas SQL)
SELECT
    i.numero_participante,
    c.nome,
    c.email,
    c.cpf,
    TO_CHAR(c.data_nascimento, 'DD/MM/YYYY') as data_nascimento,
    i.whatsapp,
    i.tipo_participacao,
    COALESCE(m.codigo, '') as modalidade,
    COALESCE(t.codigo, '') as tamanho_camiseta,
    i.status,
    TO_CHAR(i.data_inscricao, 'DD/MM/YYYY HH24:MI:SS') as data_inscricao,
    CASE WHEN i.kit_retirado THEN 'Sim' ELSE 'Não' END as kit_retirado
FROM inscricoes i
INNER JOIN colaboradores c ON i.colaborador_id = c.id
LEFT JOIN modalidades m ON i.modalidade_id = m.id
LEFT JOIN tamanhos_camiseta t ON i.tamanho_camiseta_id = t.id
WHERE i.deleted_at IS NULL
ORDER BY i.numero_participante;

-- ============================================
-- FIM DAS QUERIES
-- ============================================
