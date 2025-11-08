# Diagrama (Mermaid)

```mermaid
flowchart LR
  WA[Evolution WhatsApp Webhook] -->|POST inbound| WH[Webhook (n8n)]
  WH --> EX[Function: Extract Message]
  EX --> AI[OpenAI - Decide/Answer JSON]
  AI --> PARS[Function: Parse JSON]
  PARS --> IFDB{needs_db?}
  IFDB -- yes --> DB[HTTP Supabase: tbcorrida]
  DB --> CS[Function: Compose Status]
  CS --> SENDS[HTTP: Evolution sendText]
  SENDS --> RESP1[Respond 200]
  IFDB -- no --> IFHAND{answer_type == handoff?}
  IFHAND -- yes --> SENDF[HTTP: Evolution sendText]
  SENDF --> QUEUE[HTTP: Supabase tbwhatsapp_send]
  QUEUE --> RESP2[Respond 200 (handoff)]
  IFHAND -- no --> SENDF2[HTTP: Evolution sendText]
  SENDF2 --> RESP3[Respond 200]
```

