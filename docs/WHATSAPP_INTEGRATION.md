# Integração WhatsApp - Evolution API

## 📱 Visão Geral

Este documento descreve a integração com a Evolution API para envio automático de mensagens de confirmação via WhatsApp quando um participante finaliza sua inscrição na II Corrida e Caminhada da Qualidade FARMACE.

## 🔧 Configuração

### Variáveis de Ambiente

As credenciais da Evolution API são armazenadas no arquivo `.env` na raiz do projeto:

```env
VITE_EVOLUTION_API_URL=https://evolution-evolution-api.r9ho4z.easypanel.host
VITE_EVOLUTION_API_TOKEN=1E3A692AF33D-4E43-95C6-289E9B48FBD6
VITE_EVOLUTION_INSTANCE_NAME=Emanuel
VITE_EVOLUTION_SENDER=5588996420521
```

**⚠️ Importante:**
- O arquivo `.env` está no `.gitignore` e não deve ser versionado
- Use `.env.example` como template para novos ambientes
- Todas as variáveis devem ter o prefixo `VITE_` para serem acessíveis no frontend

### Arquivos Criados

1. **`src/services/whatsappService.ts`**
   - Serviço responsável pela comunicação com a Evolution API
   - Funções principais:
     - `sendWhatsAppMessage()` - Envia mensagem via API
     - `gerarMensagemConfirmacao()` - Gera mensagem personalizada
     - `formatPhoneNumber()` - Formata número para padrão internacional

2. **`src/vite-env.d.ts`**
   - Definições de tipos TypeScript para variáveis de ambiente
   - Garante type-safety ao acessar `import.meta.env`

3. **`docs/WHATSAPP_INTEGRATION.md`**
   - Este arquivo de documentação

## 🚀 Fluxo de Funcionamento

### 1. Preenchimento do Formulário
O participante preenche o formulário de inscrição em 5 etapas:
- **Etapa 1:** Dados cadastrais (incluindo WhatsApp)
- **Etapa 2:** Escolha da categoria (3km, 5km, 10km)
- **Etapa 3:** Tamanho da camiseta
- **Etapa 4:** Participação no evento de Natal
- **Etapa 5:** Aceite do regulamento

### 2. Confirmação da Inscrição
Ao clicar em "Confirmar Inscrição" na última etapa:

1. **Validação:** Verifica se todos os campos obrigatórios estão preenchidos
2. **Salvamento:** Armazena dados no `localStorage`
3. **Geração de Número:** Cria número único do participante (ex: #0001)
4. **Envio WhatsApp:** Dispara mensagem automática via Evolution API
5. **Feedback Visual:** Mostra confetes e modal de sucesso

### 3. Mensagem Enviada

A mensagem enviada contém:
- ✅ Confirmação de recebimento da inscrição
- 📋 Número do participante
- 🏃 Categoria escolhida
- ⏳ Status: "Aguardando Revisão"
- 📱 Aviso para ficar atento ao WhatsApp

**Exemplo de mensagem:**

```
🏃‍♂️ II Corrida e Caminhada da Qualidade FARMACE 🏃‍♀️

Olá, João! 👋

✅ Inscrição Recebida com Sucesso!

Recebemos seus dados de inscrição para a II Corrida e Caminhada da Qualidade FARMACE.

📋 Dados da Inscrição:
• Número do Participante: #0042
• Categoria: 5KM (Corrida)

⏳ Status: Aguardando Revisão

Sua inscrição está em análise pela nossa equipe. Em breve você receberá a confirmação final e mais informações sobre:
• Retirada do kit (camiseta + número de peito)
• Detalhes do local e percurso
• Orientações para o dia do evento

📱 Fique atento ao WhatsApp!
Todas as comunicações oficiais serão enviadas por este canal.

Qualquer dúvida, estamos à disposição!

---
FARMACE - Semana da Qualidade 2025
Promovendo saúde, bem-estar e qualidade de vida 💙
```

## 🔍 Detalhes Técnicos

### Formatação de Número de Telefone

O serviço formata automaticamente o número de telefone para o padrão internacional:

**Entrada:** `(88) 99642-0521`
**Saída:** `5588996420521`

Processo:
1. Remove caracteres não numéricos: `88996420521`
2. Adiciona código do país (55): `5588996420521`

### Endpoint da Evolution API

```
POST https://evolution-evolution-api.r9ho4z.easypanel.host/message/sendText/Emanuel
```

**Headers:**
```json
{
  "Content-Type": "application/json",
  "apikey": "1E3A692AF33D-4E43-95C6-289E9B48FBD6"
}
```

**Body:**
```json
{
  "number": "5588996420521",
  "text": "Mensagem formatada..."
}
```

### Tratamento de Erros

O sistema é resiliente a falhas:

1. **Erro na API:** Loga erro no console mas continua o fluxo
2. **Timeout:** Não bloqueia a confirmação da inscrição
3. **Credenciais inválidas:** Mostra erro no console
4. **Sem conexão:** Inscrição é salva localmente

**Importante:** Mesmo que o WhatsApp falhe, a inscrição é registrada com sucesso.

## 🎨 Interface do Usuário

### Estado de Loading

Enquanto envia a mensagem, o botão mostra:
```
⏳ Processando...
```

### Feedback de Sucesso

No modal de confirmação:
- ✅ **Verde:** "Mensagem enviada para seu WhatsApp!"
- 📱 **Azul:** "Fique atento ao seu WhatsApp!" (fallback)

## 🧪 Testando a Integração

### 1. Verificar Variáveis de Ambiente

```bash
# Verificar se o .env existe
cat .env

# Deve mostrar:
# VITE_EVOLUTION_API_URL=https://...
# VITE_EVOLUTION_API_TOKEN=...
# VITE_EVOLUTION_INSTANCE_NAME=Emanuel
# VITE_EVOLUTION_SENDER=5588996420521
```

### 2. Executar em Desenvolvimento

```bash
npm run dev
```

### 3. Testar Inscrição

1. Acesse `http://localhost:5173/inscricao`
2. Preencha todos os campos (use seu WhatsApp real)
3. Confirme a inscrição
4. Verifique o console do navegador para logs
5. Aguarde mensagem no WhatsApp

### 4. Verificar Logs

Abra o DevTools (F12) e veja a aba Console:

```
Enviando mensagem WhatsApp: {
  endpoint: "https://...",
  phone: "5588996420521",
  messageLength: 456
}
✅ Mensagem WhatsApp enviada com sucesso!
```

## 🐛 Troubleshooting

### Mensagem não está sendo enviada

**1. Verificar variáveis de ambiente:**
```javascript
console.log(import.meta.env.VITE_EVOLUTION_API_URL)
// Deve retornar a URL, não undefined
```

**2. Verificar instância do WhatsApp:**
- Acesse o painel da Evolution API
- Confirme que a instância "Emanuel" está conectada
- Verifique se o QR Code foi escaneado

**3. Verificar token:**
- Token deve estar correto no `.env`
- Não deve ter espaços ou quebras de linha

**4. Verificar formato do número:**
```javascript
// Correto: 5588996420521
// Errado: 88996420521 (sem código do país)
// Errado: +55 88 99642-0521 (com formatação)
```

### Erro 401 (Unauthorized)

- Token da API está incorreto
- Verifique `VITE_EVOLUTION_API_TOKEN` no `.env`

### Erro 404 (Not Found)

- Nome da instância está incorreto
- Verifique `VITE_EVOLUTION_INSTANCE_NAME` no `.env`
- Confirme que a instância existe no painel

### Erro de CORS

- Evolution API deve ter CORS habilitado
- Verifique configurações do servidor

## 📊 Monitoramento

### Logs no Console

Todos os envios são logados:
```javascript
console.log('Enviando mensagem WhatsApp:', {...})
console.log('✅ Mensagem WhatsApp enviada com sucesso!')
console.error('❌ Erro ao enviar mensagem WhatsApp:', error)
```

### Dados Salvos

Mesmo com erro no WhatsApp, a inscrição é salva:
```javascript
localStorage.getItem('inscricoes')
// Retorna array com todas as inscrições
```

## 🔐 Segurança

### Boas Práticas

✅ **Implementado:**
- Variáveis sensíveis no `.env`
- `.env` no `.gitignore`
- Validação de dados antes do envio
- Tratamento de erros

⚠️ **Atenção:**
- Não commitar o arquivo `.env`
- Não expor o token da API no código
- Usar HTTPS em produção

### Limitações

- Token da API está no frontend (visível no bundle)
- Ideal: Criar backend intermediário para maior segurança
- Considerar rate limiting para evitar spam

## 🚀 Próximos Passos

### Melhorias Sugeridas

1. **Backend API:**
   - Criar endpoint Node.js/Express
   - Mover credenciais para servidor
   - Adicionar validações extras

2. **Confirmação de Leitura:**
   - Webhook para status de entrega
   - Notificar admin quando mensagem for lida

3. **Templates:**
   - Criar templates reutilizáveis
   - Mensagens diferentes por categoria
   - Personalização avançada

4. **Analytics:**
   - Rastrear taxa de entrega
   - Monitorar erros
   - Dashboard de métricas

## 📞 Suporte

Em caso de dúvidas ou problemas:

1. Verifique os logs no console do navegador
2. Consulte a documentação da Evolution API
3. Entre em contato com o desenvolvedor

---

**Última atualização:** 2025-10-31
**Versão:** 1.0.0
**Desenvolvedor:** Emanuel

