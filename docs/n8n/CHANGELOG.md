# Changelog – Bot n8n Corrida FARMACE

## v1.0.0 – Primeira versão
- Workflow criado e salvo em `automation/n8n/workflows/farmace-corrida-bot.json`
- Integração com Evolution API (sendText)
- Consulta Supabase (tbcorrida) via REST – filtro por CPF ou matrícula, status Confirmada
- Agente de IA (OpenAI gpt-4o-mini) com base de conhecimento do evento
- Handoff para humano: criação de item em `tbwhatsapp_send`
- Documentação inicial em `docs/n8n/*`

