# Configuração e Instalação (n8n)

Este guia explica como importar e configurar o workflow n8n do bot de atendimento da 2ª Corrida FARMACE.

## 1) Importar o Workflow no n8n
1. Abra o n8n → Workflows → Import → Import from File
2. Selecione o arquivo: `automation/n8n/workflows/farmace-corrida-bot.json`
3. Após importar, não ative ainda. Primeiro configure credenciais e env vars.

## 2) Variáveis de Ambiente (n8n)
Defina no ambiente do n8n (Settings → Environment Variables ou docker-compose):

- `SUPABASE_URL` – ex.: https://gonbyhpqnqnddqozqvhk.supabase.co
- `SUPABASE_SERVICE_KEY` – Service Role key (apenas backend)
- `EVOLUTION_API_URL` – ex.: https://evolution.seudominio.com/api
- `EVOLUTION_INSTANCE` – nome da instância no Evolution (ex.: farmace-prod)
- `EVOLUTION_TOKEN` – token (apikey) do Evolution
- `OPENAI_API_KEY` – chave da API OpenAI

Boas práticas de segurança:
- Use a Service Key apenas no n8n/servidor; nunca em código cliente
- Restrinja o IP do Webhook apenas ao Evolution quando possível

## 3) Vincular Credenciais
- Node “AI Decide/Answer (JSON)”: selecione a credencial “OpenAI API (configure)” e associe sua `OPENAI_API_KEY`.
- Nodes HTTP: usam headers com as env vars acima; não precisam de credenciais salvas.

## 4) Configurar o Webhook no Evolution API
- URL do webhook (produção): `https://SEU_N8N_HOST/webhook/farmace/whatsapp/inbound`
- Método: POST
- Formato: JSON
- Salve a configuração e envie uma mensagem de teste para o número WhatsApp da instância Evolution.

## 5) Ativar o Workflow
- No n8n, abra o workflow importado e marque como “Active” quando os testes básicos passarem.

## 6) Testes Rápidos (Smoke Test)
- “Quando é a corrida?” → deve responder data/horário/local
- “Como faço a inscrição?” → deve explicar os passos e citar `/loginInscricao`
- “Status 00676901301” (CPF fictício) → se houver no banco “Confirmada”, retorna status; senão, orienta a informar identificador correto

## 7) Troubleshooting
- Sem resposta no WhatsApp:
  - Verifique `EVOLUTION_API_URL`, `EVOLUTION_INSTANCE`, `EVOLUTION_TOKEN`
  - Confira se o número está no formato internacional (55 + DDD + número)
- Falha ao consultar status:
  - Valide `SUPABASE_URL` e `SUPABASE_SERVICE_KEY`
  - Regra de filtro: status `Confirmada` e `deleted_at` null
- Erros no OpenAI:
  - Cheque `OPENAI_API_KEY` e limites/quotas

## 8) Atualizações futuras
- Ajustar tom/estilo das respostas, mantendo pt-BR e objetividade
- Expandir base de conhecimento conforme comunicação oficial
- Adicionar monitoramento de erros (workflows de erro no n8n)

