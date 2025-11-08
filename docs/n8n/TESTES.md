# Testes e Validação

Este guia cobre testes manuais, via cURL e boas práticas de validação do fluxo no n8n.

## Antes de testar
- Verifique as env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `EVOLUTION_API_URL`, `EVOLUTION_INSTANCE`, `EVOLUTION_TOKEN`, `OPENAI_API_KEY`.
- Garanta que o Evolution está apontando o webhook para o n8n.

## Casos de teste (WhatsApp)
1) FAQ simples – Data/Horário/Local
   - Mensagem: “Quando é a corrida?”
   - Esperado: Data 21/12/2025, concentração 06h30, largada 07h00, local FARMACE.

2) Como se inscrever
   - Mensagem: “Como faço a inscrição?”
   - Esperado: Passos + link `/loginInscricao` + senha padrão (últimos 3 do CPF + DDMM).

3) Status – Matrícula fornecida
   - Mensagem: “status 001234”
   - Pré-condição: matrícula 001234 tem inscrição Confirmada na `tbcorrida`.
   - Esperado: status Confirmada + número do participante (padded 4 dígitos), e se houver, categoria/camiseta.

4) Status – CPF fornecido
   - Mensagem: “meu cpf 00676901301”
   - Pré-condição: CPF cadastrado em inscrição Confirmada.
   - Esperado: idem ao caso 3.

5) Status – Identificador ausente ou não encontrado
   - Mensagem: “qual meu status?”
   - Esperado: bot solicita CPF (11 dígitos) ou matrícula (6 dígitos) e sugere `/loginInscricao` se precisar.

6) Handoff (fala com humano)
   - Mensagem: “quero falar com um atendente”
   - Esperado: resposta confirmando encaminhamento + inserção na tabela `tbwhatsapp_send` com prioridade 10.

## Teste via cURL (direto no webhook)
Substitua `N8N_HOST` pelo host público do n8n.

```bash
curl -X POST \
  https://N8N_HOST/webhook/farmace/whatsapp/inbound \
  -H 'Content-Type: application/json' \
  -d '{
    "message": { "text": "Quando é a corrida?" },
    "from": "5583999999999"
  }'
```

## Observando execuções no n8n
- Acesse o workflow → Executions → verifique entradas/saídas dos nós Function/HTTP/OpenAI
- Em erros de payload, ajuste o nó “Extract Message” (mapeia formatos comuns do Evolution/Baileys)

## Critérios de aprovação
- 100% dos casos acima respondidos corretamente
- Respostas em pt-BR, objetivas e educativas
- Status consultado apenas quando há identificador válido
- Resposta HTTP 200 para o Evolution em todos os caminhos

