#!/bin/bash

# Script para atualizar nome da tabela de tbwhatsapp para tbwhatsapp_send
# Diferenciando mensagens ENVIADAS (send) de mensagens RECEBIDAS (receive)

echo "🔄 Atualizando documentação: tbwhatsapp → tbwhatsapp_send"
echo ""

# Diretório da documentação
DOCS_DIR="docs/WhatsApp"

# Arquivos a serem atualizados
FILES=(
  "$DOCS_DIR/01_VISAO_GERAL.md"
  "$DOCS_DIR/02_CONFIGURACAO_SUPABASE.md"
  "$DOCS_DIR/03_EDGE_FUNCTION.md"
  "$DOCS_DIR/04_INTEGRACAO_REACT.md"
  "$DOCS_DIR/05_MONITORAMENTO.md"
  "$DOCS_DIR/06_TROUBLESHOOTING.md"
  "$DOCS_DIR/07_MELHORIAS_FUTURAS.md"
  "$DOCS_DIR/README.md"
  "$DOCS_DIR/INDICE.md"
  "$DOCS_DIR/INICIO_RAPIDO.md"
  "$DOCS_DIR/RESUMO_EXECUTIVO.md"
  "$DOCS_DIR/CHANGELOG_ATUALIZACAO.md"
  "$DOCS_DIR/GUIA_MIGRACAO.md"
  "$DOCS_DIR/ATUALIZACOES_RESUMO.md"
)

# Contador de substituições
total_replacements=0

# Substituir tbwhatsapp por tbwhatsapp_send em todos os arquivos
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Processando: $file"

    # Contar ocorrências antes
    before=$(grep -o "tbwhatsapp" "$file" | wc -l)

    # Fazer substituição (usar palavra completa para não substituir tbwhatsapp_send)
    sed -i 's/\btbwhatsapp\b/tbwhatsapp_send/g' "$file"

    # Contar ocorrências depois
    after=$(grep -o "tbwhatsapp_send" "$file" | wc -l)

    # Calcular substituições
    replacements=$after
    total_replacements=$((total_replacements + replacements))

    echo "   ✅ $replacements substituições realizadas"
  else
    echo "   ⚠️  Arquivo não encontrado: $file"
  fi
done

echo ""
echo "✅ Atualização concluída!"
echo "📊 Total de substituições: $total_replacements"
echo ""
echo "📌 Estrutura de tabelas WhatsApp:"
echo "   • tbwhatsapp_send    → Mensagens ENVIADAS (fila de envio)"
echo "   • tbwhatsapp_receive → Mensagens RECEBIDAS (webhook)"
echo ""

