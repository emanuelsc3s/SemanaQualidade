#!/bin/bash

# Script para atualizar nome da tabela de whatsapp_queue para tbwhatsapp
# e ajustar políticas RLS para não usar autenticação

echo "🔄 Atualizando documentação..."
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
)

# Contador de substituições
total_replacements=0

# Substituir whatsapp_queue por tbwhatsapp em todos os arquivos
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Processando: $file"
    
    # Contar ocorrências antes
    before=$(grep -o "whatsapp_queue" "$file" | wc -l)
    
    # Fazer substituição
    sed -i 's/whatsapp_queue/tbwhatsapp/g' "$file"
    
    # Contar ocorrências depois
    after=$(grep -o "whatsapp_queue" "$file" | wc -l)
    
    # Calcular substituições
    replacements=$((before - after))
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
echo "⚠️  ATENÇÃO: Você ainda precisa atualizar manualmente:"
echo "   1. Políticas RLS no arquivo 02_CONFIGURACAO_SUPABASE.md"
echo "   2. Referências a 'authenticated' devem ser removidas ou ajustadas"
echo ""

