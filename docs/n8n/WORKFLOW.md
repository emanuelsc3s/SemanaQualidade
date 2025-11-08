# Detalhamento do Workflow (n8n)

Arquivo principal: `automation/n8n/workflows/farmace-corrida-bot.json`

## Nós principais

1. Webhook – WA Inbound (Evolution)
   - Path: `/webhook/farmace/whatsapp/inbound`
   - Método: POST
   - Recebe mensagens do Evolution API (WhatsApp)

2. Function: Extract Message
   - Extrai `text` e `number` de payloads comuns (Evolution/Baileys)
   - Normaliza telefone: remove não-dígitos; se 11 dígitos, prefixa `55`

3. OpenAI: AI Decide/Answer (JSON)
   - Modelo: gpt-4o-mini
   - System message inclui base de conhecimento (evento, data, local, modalidades, kit, requisitos, inscrição)
   - Saída JSON padronizada:
     ```json
     {
       "needs_db": boolean,
       "cpf": string|null,
       "matricula": string|null,
       "answer_type": "status"|"faq"|"handoff"|"other",
       "reply": "..."
     }
     ```

4. Function: Parse AI JSON
   - Tenta parsear a saída do modelo
   - Normaliza matrícula (6 dígitos, zeros à esquerda) e CPF (11 dígitos)

5. IF: Needs DB?
   - Se `needs_db=true`, consulta Supabase; senão, segue para resposta direta (FAQ/handoff)

6. HTTP Request: Supabase – Buscar Inscrição
   - GET `${SUPABASE_URL}/rest/v1/tbcorrida`
   - Query params:
     - `select=corrida_id,status,tipo_participacao,modalidade,tamanho_camiseta,nome`
     - `deleted_at=is.null`
     - `status=eq.Confirmada`
     - `or=(cpf.eq.{cpf},matricula.eq.{matricula})`
   - Headers:
     - `apikey: ${SUPABASE_SERVICE_KEY}`
     - `Authorization: Bearer ${SUPABASE_SERVICE_KEY}`

7. Function: Compose Status Reply
   - Se encontrou registro: monta resposta com status, nome, categoria, camiseta e número do participante (corrida_id padded 4 dígitos)
   - Caso contrário: orienta a enviar CPF/matrícula e a acessar `/loginInscricao`

8. HTTP Request: WA – Enviar (Status)
   - POST `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`
   - Body: `{ number, text: reply }`
   - Headers: `Content-Type: application/json`, `apikey: ${EVOLUTION_TOKEN}`

9. Function: Use AI Reply
   - Usa `reply` do modelo quando não precisa de DB

10. IF: Handoff?
   - Se `answer_type == handoff`, além da resposta, cria item para humano

11. HTTP Request: WA – Enviar (FAQ/Outros)
   - Mesmo endpoint de envio do Evolution

12. HTTP Request: Escalonar para Humano
   - POST `${SUPABASE_URL}/rest/v1/tbwhatsapp_send`
   - Body:
     ```json
     { "numero": number, "message": "Atendimento humano solicitado via bot.", "status": "pendente", "priority": 10, "max_attempts": 3 }
     ```
   - Headers: `apikey` + `Authorization: Bearer`

13. Respond 200
   - Devolve HTTP 200 ao Evolution

## Observações
- O fluxo responde sempre em pt-BR.
- O bot não retorna dados sensíveis e pede identificadores apenas para localizar o próprio status.
- O número de telefone deve estar no formato internacional aceito pelo Evolution.

