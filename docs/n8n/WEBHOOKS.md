# Webhooks – Evolution API (WhatsApp)

## Configuração no Evolution
- URL: `https://SEU_N8N_HOST/webhook/farmace/whatsapp/inbound`
- Método: POST
- Formato: JSON
- Segurança recomendada: restringir IPs/assinatura se disponível

## Payloads aceitos
O nó “Extract Message” tenta extrair texto/telefone destas chaves:
- Texto: `message.text`, `message.conversation`, `text`, `body`, `data.message.conversation`
- Número: `key.remoteJid`, `remoteJid`, `from`, `data.key.remoteJid` (limpo para apenas dígitos)

Se o telefone tiver 11 dígitos (DDD + 9), o fluxo prefixa `55`. Caso já esteja com `55`, permanece.

## Respostas do n8n
- HTTP 200, body: `{ "ok": true }` (ou `{"ok": true, "handoff": true}` no caminho de handoff)

## Envio de mensagens (saída)
- Endpoint: `POST ${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`
- Headers: `Content-Type: application/json`, `apikey: ${EVOLUTION_TOKEN}`
- Body: `{ "number": "55DDDNÚMERO", "text": "mensagem" }`

## Observações
- Mantenha seu token (`EVOLUTION_TOKEN`) confidencial
- Consulte a documentação oficial da Evolution API para payloads específicos por versão

