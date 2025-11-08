# Bot de Atendimento (n8n) – 2ª Corrida e Caminhada da Qualidade FARMACE

Este diretório documenta o sistema de atendimento automatizado com agente de IA implementado no n8n para o projeto da 2ª Corrida e Caminhada da Qualidade FARMACE.

Principais capacidades:
- Responder automaticamente dúvidas (FAQ) sobre o evento (pt-BR), de forma educada e objetiva
- Consultar status de inscrição no Supabase quando o colaborador informa CPF (11 dígitos) ou matrícula (6 dígitos)
- Encaminhar para atendimento humano (handoff) quando solicitado
- Enviar respostas via WhatsApp usando Evolution API

Artefato principal (workflow n8n):
- Caminho no repositório: `automation/n8n/workflows/farmace-corrida-bot.json`

Conteúdo desta pasta:
- `SETUP.md` – Instalação, variáveis de ambiente e configuração
- `WORKFLOW.md` – Detalhamento dos nós/fluxo e integrações
- `TESTES.md` – Procedimentos e casos de teste (manual e cURL)
- `FAQ.md` – Base de conhecimento usada pelo agente (perguntas/ respostas)
- `WEBHOOKS.md` – Configuração de Webhook no Evolution API (WhatsApp)
- `MERMAID.md` – Diagrama do fluxo em Mermaid
- `CHANGELOG.md` – Histórico de alterações

Links rápidos:
- Guia de configuração: veja `SETUP.md`
- Como testar: veja `TESTES.md`
- Diagrama: veja `MERMAID.md`

Requisitos para operar:
- Acesso a uma instância do n8n
- Credenciais do Supabase (URL e Service Key) – uso apenas no backend
- Credenciais do Evolution API (URL, Instance Name e Token)
- Chave de API do OpenAI (modelo: gpt-4o-mini no fluxo entregue)

Segurança e privacidade:
- Nunca exponha Service Key do Supabase no frontend
- O bot só utiliza CPF/matrícula para lookup de status; não retorna dados sensíveis
- Webhook do n8n deve ficar protegido por rede/segurança do Evolution

