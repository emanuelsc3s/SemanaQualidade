# Variáveis de Ambiente e Credenciais

Defina estes valores no ambiente do n8n (ou docker-compose):

## Supabase
- `SUPABASE_URL` – URL do projeto Supabase (ex.: https://gonbyhpqnqnddqozqvhk.supabase.co)
- `SUPABASE_SERVICE_KEY` – Service Role key (use apenas no backend/n8n)

Headers usados nos requests:
- `apikey: ${SUPABASE_SERVICE_KEY}`
- `Authorization: Bearer ${SUPABASE_SERVICE_KEY}`

## Evolution API (WhatsApp)
- `EVOLUTION_API_URL` – ex.: https://evolution.seudominio.com/api
- `EVOLUTION_INSTANCE` – nome da instância (ex.: farmace-prod)
- `EVOLUTION_TOKEN` – token apikey

Envio de mensagens (saída):
- Endpoint: `POST ${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`
- Headers: `Content-Type: application/json`, `apikey: ${EVOLUTION_TOKEN}`

## OpenAI
- `OPENAI_API_KEY` – chave da conta OpenAI
- No node OpenAI, selecione a credencial com essa chave

## Segurança
- Nunca exponha a `SUPABASE_SERVICE_KEY` no frontend
- Restrinja o acesso ao webhook do n8n
- Revise logs periodicamente e rotacione chaves se necessário

