# 🔍 Troubleshooting - WhatsApp Integration

## ✅ Testes Realizados

### Teste da API (Scripts)
- ✅ **Mensagem antiga**: Enviada com sucesso (Status 201)
- ✅ **Mensagem nova**: Enviada com sucesso (Status 201)
- ✅ **Variáveis de ambiente**: Configuradas corretamente
- ✅ **Endpoint da API**: Funcionando
- ✅ **Formatação da mensagem**: Correta

**Conclusão**: A API está funcionando perfeitamente! O problema está no fluxo da aplicação.

---

## 🔎 Como Debugar no Navegador

### Passo 1: Abrir o Console do Navegador
1. Abra a aplicação no navegador
2. Pressione **F12** ou **Ctrl+Shift+I** (Windows/Linux) ou **Cmd+Option+I** (Mac)
3. Vá para a aba **Console**

### Passo 2: Fazer uma Inscrição de Teste
1. Preencha o formulário de inscrição
2. Use um número de WhatsApp real
3. Finalize a inscrição
4. **OBSERVE O CONSOLE** durante todo o processo

### Passo 3: Verificar os Logs

Você deve ver os seguintes logs **na ordem**:

```
📝 [WhatsApp Service] Gerando mensagem de confirmação: {nome: "...", numeroParticipante: "...", categoria: "..."}
✅ [WhatsApp Service] Mensagem gerada com sucesso!
📏 [WhatsApp Service] Tamanho: 415 caracteres

🚀 [WhatsApp Service] Iniciando envio de mensagem...
🔧 [WhatsApp Service] Variáveis de ambiente: {apiUrl: "✅ Configurada", apiToken: "✅ Configurada", instanceName: "✅ Configurada"}
📱 [WhatsApp Service] Número formatado: {original: "...", formatado: "55..."}
📤 [WhatsApp Service] Enviando requisição: {endpoint: "...", phone: "...", messageLength: 415, messagePreview: "..."}
📊 [WhatsApp Service] Resposta recebida: {status: 201, statusText: "Created", ok: true}
✅ [WhatsApp Service] Mensagem enviada com sucesso!
📋 [WhatsApp Service] Dados da resposta: {...}
```

---

## ❌ Problemas Comuns e Soluções

### Problema 1: Nenhum log aparece
**Causa**: A função não está sendo chamada
**Solução**: 
- Verifique se o arquivo `InscricaoWizard.tsx` está importando corretamente
- Verifique se o botão de confirmação está executando `handleSubmit`

### Problema 2: Logs param em "Gerando mensagem"
**Causa**: A função `sendWhatsAppMessage` não está sendo chamada
**Solução**:
- Verifique se há algum erro antes da chamada
- Verifique se o `await` está presente

### Problema 3: Erro "Variáveis de ambiente não configuradas"
**Causa**: Arquivo `.env` não está sendo lido
**Solução**:
1. Pare o servidor de desenvolvimento (`Ctrl+C`)
2. Verifique se o arquivo `.env` existe na raiz do projeto
3. Reinicie o servidor: `npm run dev`
4. **IMPORTANTE**: Variáveis de ambiente só são carregadas ao iniciar o servidor!

### Problema 4: Status 401 ou 403
**Causa**: Token de autenticação inválido
**Solução**:
- Verifique o token no arquivo `.env`
- Confirme se a instância WhatsApp está conectada

### Problema 5: Status 404
**Causa**: Endpoint ou nome da instância incorreto
**Solução**:
- Verifique `VITE_EVOLUTION_API_URL` no `.env`
- Verifique `VITE_EVOLUTION_INSTANCE_NAME` no `.env`

### Problema 6: Mensagem enviada mas não recebida
**Causa**: Instância WhatsApp desconectada ou número inválido
**Solução**:
- Verifique se a instância está conectada no painel da Evolution API
- Verifique se o número de telefone está correto (com DDD)
- Aguarde alguns segundos (status PENDING significa que está processando)

---

## 🧪 Teste Rápido

Execute este comando para testar a API diretamente:

```bash
node scripts/test-api-real.js
```

Se este teste funcionar mas a aplicação não, o problema está no código React.

---

## 📋 Checklist de Verificação

- [ ] Servidor de desenvolvimento está rodando (`npm run dev`)
- [ ] Arquivo `.env` existe na raiz do projeto
- [ ] Variáveis de ambiente estão configuradas corretamente
- [ ] Servidor foi reiniciado após alterar o `.env`
- [ ] Console do navegador está aberto (F12)
- [ ] Não há erros JavaScript no console
- [ ] Logs do WhatsApp Service aparecem no console
- [ ] Status da resposta é 201 (Created)
- [ ] Instância WhatsApp está conectada
- [ ] Número de telefone está correto (com DDD)

---

## 🆘 Ainda não funciona?

Se após verificar todos os itens acima o problema persistir:

1. **Copie TODOS os logs do console** (incluindo erros)
2. **Tire um print da aba Network** (F12 → Network → filtrar por "sendText")
3. **Verifique se há erros na aba Console**
4. **Compartilhe essas informações** para análise detalhada

---

## 📞 Informações de Debug Úteis

### Verificar se as variáveis de ambiente estão carregadas:
Abra o console do navegador e digite:
```javascript
console.log({
  apiUrl: import.meta.env.VITE_EVOLUTION_API_URL,
  apiToken: import.meta.env.VITE_EVOLUTION_API_TOKEN,
  instanceName: import.meta.env.VITE_EVOLUTION_INSTANCE_NAME
})
```

### Testar a função de geração de mensagem:
```javascript
import { gerarMensagemConfirmacao } from './services/whatsappService'
const msg = gerarMensagemConfirmacao('João Silva', '0009', '5km')
console.log(msg)
```

---

**Última atualização**: 2025-10-31
**Status dos testes**: ✅ API funcionando | 🔍 Investigando fluxo da aplicação

