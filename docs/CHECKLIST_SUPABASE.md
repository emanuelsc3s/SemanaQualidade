# ✅ Checklist - Integração Supabase

## 📋 Pré-requisitos

- [ ] Projeto criado no Supabase
- [ ] Tabela `tbcorrida` criada no banco de dados
- [ ] Enums `tipo_participacao_enum` e `status_inscricao_enum` criados
- [ ] Credenciais de API obtidas (URL + anon key)

---

## 🔧 Configuração do Projeto

### Dependências

- [x] `@supabase/supabase-js` instalado via npm
- [x] Arquivo `.env` criado na raiz do projeto
- [x] Variáveis de ambiente configuradas:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [x] Arquivo `.env.example` atualizado como template
- [x] `.env` está no `.gitignore`

### Arquivos Criados/Modificados

- [x] `src/services/supabase.ts` - Cliente Supabase
- [x] `src/services/inscricaoCorridaSupabaseService.ts` - Serviço de inscrições
- [x] `src/vite-env.d.ts` - Tipos TypeScript atualizados
- [x] `src/pages/Inscricao.tsx` - Componente atualizado
- [x] `.env.example` - Template atualizado
- [x] `docs/SUPABASE_INTEGRATION.md` - Documentação completa
- [x] `docs/CHECKLIST_SUPABASE.md` - Este checklist

---

## 🗄️ Configuração do Banco de Dados

### Schema

- [ ] Tabela `tbcorrida` existe no Supabase
- [ ] Enum `tipo_participacao_enum` criado com valores:
  - [ ] `'corrida-natal'`
  - [ ] `'apenas-natal'`
  - [ ] `'retirar-cesta'`
- [ ] Enum `status_inscricao_enum` criado com valores:
  - [ ] `'pendente'`
  - [ ] `'confirmada'`
  - [ ] `'cancelada'`
  - [ ] `'compareceu'`

### Colunas da Tabela `tbcorrida`

- [ ] `corrida_id` (SERIAL PRIMARY KEY)
- [ ] `data_inscricao` (TIMESTAMPTZ)
- [ ] `matricula` (TEXT NULL)
- [ ] `email` (TEXT NULL)
- [ ] `whatsapp` (TEXT NULL)
- [ ] `tipo_participacao` (tipo_participacao_enum NOT NULL)
- [ ] `modalidade` (TEXT NULL)
- [ ] `tamanho_camiseta` (TEXT NULL)
- [ ] `aceitou_regulamento` (BOOLEAN NOT NULL DEFAULT false)
- [ ] `data_aceite_regulamento` (TIMESTAMPTZ NULL)
- [ ] `status` (status_inscricao_enum NULL)
- [ ] `kit_retirado` (BOOLEAN NOT NULL DEFAULT false)
- [ ] `data_retirada_kit` (TIMESTAMPTZ NULL)
- [ ] `created_at` (TIMESTAMPTZ NULL)
- [ ] `updated_at` (TIMESTAMPTZ NULL)
- [ ] `deleted_at` (TIMESTAMPTZ NULL)
- [ ] `nome` (TEXT NULL)
- [ ] `cpf` (TEXT NULL)
- [ ] `nascimento` (TIMESTAMP NULL)

### Políticas RLS (Row Level Security)

- [ ] RLS habilitado na tabela `tbcorrida`
- [ ] Política de INSERT configurada
- [ ] Política de SELECT configurada (se necessário)
- [ ] Política de UPDATE configurada (se necessário)

---

## 🧪 Testes de Integração

### 1. Teste de Conexão

- [ ] Servidor de desenvolvimento rodando (`npm run dev`)
- [ ] Console do navegador mostra:
  ```
  ✅ [Supabase] Variáveis de ambiente carregadas com sucesso
  🔧 [Supabase] URL: https://...
  ✅ [Supabase] Cliente inicializado com sucesso
  ```
- [ ] Nenhum erro de "Configuração incompleta"

### 2. Teste de Inscrição - Corrida + Natal

- [ ] Acessar `/inscricao`
- [ ] Selecionar "Participar da corrida e da comemoração de Natal"
- [ ] Selecionar modalidade (3km, 5km ou 10km)
- [ ] Preencher todos os dados pessoais
- [ ] Selecionar tamanho da camiseta
- [ ] Fazer upload de foto (opcional)
- [ ] Clicar em "Confirmar Inscrição"
- [ ] Verificar logs no console:
  ```
  🚀 [Inscrição Supabase] Iniciando salvamento...
  ✅ [Inscrição Supabase] Inscrição salva com sucesso!
  🎫 [Inscrição Supabase] Número do participante: 0001
  📱 [Inscrição] Enviando confirmação via WhatsApp...
  ✅ [Inscrição] Mensagem WhatsApp enviada com sucesso!
  🎉 [Inscrição] Processo concluído com sucesso!
  ```
- [ ] Tela de confirmação exibida com:
  - [ ] Número do participante
  - [ ] Valor da inscrição (R$ 35,00)
  - [ ] Confirmação de WhatsApp enviado
- [ ] Verificar no Supabase Dashboard:
  - [ ] Registro criado na tabela `tbcorrida`
  - [ ] `tipo_participacao` = `'corrida-natal'`
  - [ ] `modalidade` preenchida (3km, 5km ou 10km)
  - [ ] `tamanho_camiseta` preenchido
  - [ ] `status` = `'pendente'`
  - [ ] `aceitou_regulamento` = `true`

### 3. Teste de Inscrição - Apenas Natal

- [ ] Acessar `/inscricao`
- [ ] Selecionar "Participar apenas da comemoração de Natal"
- [ ] Preencher todos os dados pessoais
- [ ] Clicar em "Confirmar Inscrição"
- [ ] Verificar que:
  - [ ] Não solicita modalidade
  - [ ] Não solicita tamanho de camiseta
  - [ ] Não solicita foto
  - [ ] Não exibe valor de inscrição
  - [ ] Não envia WhatsApp
- [ ] Verificar no Supabase Dashboard:
  - [ ] `tipo_participacao` = `'apenas-natal'`
  - [ ] `modalidade` = `NULL`
  - [ ] `tamanho_camiseta` = `NULL`

### 4. Teste de Inscrição - Retirar Cesta

- [ ] Acessar `/inscricao`
- [ ] Selecionar "Não participar de nenhum evento e retirar a cesta natalina"
- [ ] Preencher todos os dados pessoais
- [ ] Clicar em "Confirmar Inscrição"
- [ ] Verificar que:
  - [ ] Pula a Etapa 3 (camiseta/foto)
  - [ ] Não exibe valor de inscrição
  - [ ] Não envia WhatsApp
- [ ] Verificar no Supabase Dashboard:
  - [ ] `tipo_participacao` = `'retirar-cesta'`
  - [ ] `modalidade` = `NULL`
  - [ ] `tamanho_camiseta` = `NULL`

### 5. Teste de Validação

- [ ] Tentar submeter sem preencher campos obrigatórios
  - [ ] Exibe mensagens de erro apropriadas
- [ ] Tentar submeter com email inválido
  - [ ] Exibe erro de validação
- [ ] Tentar submeter com CPF inválido
  - [ ] Exibe erro de validação
- [ ] Tentar submeter corrida sem modalidade
  - [ ] Exibe erro de validação

### 6. Teste de Tratamento de Erros

- [ ] Simular erro de conexão (desconectar internet)
  - [ ] Exibe mensagem de erro amigável
  - [ ] Botão volta ao estado normal
- [ ] Simular erro de validação do banco
  - [ ] Exibe mensagem de erro com detalhes
- [ ] Verificar que erros não quebram a aplicação

---

## 📱 Testes de Responsividade

### Mobile (< 640px)

- [ ] Formulário renderiza corretamente
- [ ] Botões são touch-friendly (mínimo 44x44px)
- [ ] Mensagens de erro são legíveis
- [ ] Loading spinner visível
- [ ] Tela de confirmação responsiva

### Tablet (768px - 1024px)

- [ ] Layout adapta para 2 colunas onde apropriado
- [ ] Navegação entre etapas funciona
- [ ] Botões bem posicionados

### Desktop (> 1024px)

- [ ] Formulário centralizado e com largura máxima
- [ ] Todos os elementos alinhados
- [ ] Experiência otimizada

---

## 🔐 Segurança

- [ ] Arquivo `.env` **NÃO** está commitado no Git
- [ ] Apenas `anon key` é usada no frontend (nunca `service_role`)
- [ ] Políticas RLS configuradas no Supabase
- [ ] Dados sensíveis (CPF) armazenados com máscara
- [ ] Email convertido para lowercase antes de salvar

---

## 📊 Monitoramento

### Logs no Console

- [ ] Logs de debug aparecem no console do navegador
- [ ] Logs seguem o padrão:
  ```
  🚀 [Serviço] Ação iniciada
  ✅ [Serviço] Ação concluída
  ❌ [Serviço] Erro ao executar ação
  ```
- [ ] Logs contêm informações úteis para debug

### Supabase Dashboard

- [ ] Acessar **Table Editor** → `tbcorrida`
- [ ] Verificar registros inseridos
- [ ] Acessar **Logs** para ver queries executadas
- [ ] Verificar **API** → **Logs** para erros de API

---

## 🚀 Deploy

### Antes de fazer deploy

- [ ] Todas as variáveis de ambiente configuradas no ambiente de produção
- [ ] Políticas RLS testadas e funcionando
- [ ] Testes de integração passando
- [ ] Documentação atualizada
- [ ] Backup do banco de dados realizado

### Após deploy

- [ ] Testar inscrição em produção
- [ ] Verificar logs de erro
- [ ] Monitorar performance
- [ ] Confirmar que WhatsApp está funcionando

---

## 📚 Documentação

- [x] `docs/SUPABASE_INTEGRATION.md` criado
- [x] `docs/CHECKLIST_SUPABASE.md` criado
- [ ] README.md atualizado com instruções de setup
- [ ] Comentários no código estão claros
- [ ] Tipos TypeScript documentados

---

## 🎯 Próximos Passos (Opcional)

- [ ] Implementar upload de foto para Supabase Storage
- [ ] Adicionar validação de CPF duplicado
- [ ] Implementar busca de inscrição por CPF
- [ ] Criar dashboard administrativo
- [ ] Adicionar relatórios e estatísticas
- [ ] Implementar sistema de check-in
- [ ] Gerar certificados digitais

---

## ✅ Status Final

- [ ] **Integração Supabase 100% funcional**
- [ ] **Todos os testes passando**
- [ ] **Documentação completa**
- [ ] **Pronto para produção**

---

**Data de conclusão:** ___/___/_____  
**Responsável:** _________________  
**Versão:** 1.0.0

