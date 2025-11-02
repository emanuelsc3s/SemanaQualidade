# CLAUDE.md - Contexto do Projeto

## Visão Geral

**Nome do Projeto:** 2ª Corrida e Caminhada da Qualidade FARMACE
**Tipo:** Landing Page com Sistema de Inscrição
**Status:** Em Desenvolvimento
**Empresa:** FARMACE
**Evento:** Semana da Qualidade 2025

Este projeto é uma landing page moderna desenvolvida para a Segunda Corrida e Caminhada da Qualidade organizada pela empresa FARMACE. A aplicação permite que **apenas colaboradores da empresa** se inscrevam no evento esportivo através de um sistema de autenticação e formulário de inscrição.

### ⚠️ REQUISITO CRÍTICO: Responsividade Total
**A aplicação DEVE ser 100% responsiva em todos os dispositivos:**
- 📱 **Mobile First** - Desenvolvimento prioritário para smartphones
- 📱 **Tablets** - Adaptação perfeita para tablets (portrait e landscape)
- 💻 **Desktops** - Otimização para telas grandes

**Abordagem obrigatória:** Mobile-first development - todas as features devem ser desenvolvidas primeiro para mobile e depois adaptadas para telas maiores.

## Propósito e Contexto

### Objetivo Principal
Criar uma plataforma digital para divulgar e gerenciar inscrições da 2ª Corrida e Caminhada da Qualidade, um evento corporativo interno da FARMACE realizado durante a Semana da Qualidade.

### Público-Alvo
- **Exclusivo para colaboradores da FARMACE**
- Participantes podem se inscrever nas modalidades:
  - Corrida 5K
  - Corrida 10K
  - Caminhada

### Características do Evento
- **Data:** A confirmar (durante a Semana da Qualidade 2025)
- **Horário:** Largada às 7h00 (concentração às 6h30)
- **Local:** FARMACE (local específico a confirmar)
- **Investimento:** R$ 35,00 por participante
- **Kit do Atleta:** Camiseta + Número de peito
- **Inscrições:** Limitadas

## Stack Tecnológica

### Core
- **React 19** - Biblioteca JavaScript para interfaces
- **TypeScript** - Superset JavaScript com tipagem estática
- **Vite** - Build tool moderna e rápida

### UI/Styling
- **Tailwind CSS v4** - Framework CSS utility-first
- **shadcn/ui** - Sistema de componentes acessíveis
- **Lucide React** - Biblioteca de ícones

### Roteamento
- **React Router DOM v7** - Gerenciamento de rotas

### Utilitários
- **class-variance-authority** - Gerenciamento de variantes de componentes
- **clsx** - Utilitário para classes condicionais
- **tailwind-merge** - Merge de classes Tailwind

## Estrutura do Projeto

```
SemanaQualidade/
├── public/
│   ├── HeroCorridaFarmace.png    # Imagem de fundo do hero
│   └── 0104.mp4                  # Vídeo (arquivo novo, não versionado)
├── src/
│   ├── components/
│   │   └── ui/                   # Componentes shadcn/ui
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── label.tsx
│   ├── lib/
│   │   └── utils.ts              # Funções utilitárias (cn, etc)
│   ├── pages/
│   │   ├── Home.tsx              # Landing page principal
│   │   ├── LoginInscricao.tsx   # Página de login/autenticação
│   │   └── InscricaoWizard.tsx   # Formulário de inscrição wizard (ativo)
│   ├── App.tsx                   # Componente raiz com rotas
│   └── main.tsx                  # Entry point da aplicação
├── components.json               # Configuração shadcn/ui
├── tailwind.config.js            # Configuração Tailwind CSS
├── tsconfig.json                 # Configuração TypeScript
├── vite.config.ts                # Configuração Vite
└── package.json                  # Dependências e scripts
```

## Fluxo da Aplicação

### Jornada do Usuário

1. **Home (Landing Page)** → `/`
   - Hero section com informações principais
   - Cards informativos sobre o evento
   - CTA para inscrição
   - Navegação para seções (Info, Edição Anterior, Dúvidas, Contato)

2. **Login/Autenticação** → `/loginInscricao`
   - **NOVO:** Página de autenticação
   - Valida se o usuário é colaborador da FARMACE
   - Restringe acesso apenas a funcionários autorizados

3. **Formulário de Inscrição** → `/inscricao`
   - Campos de dados pessoais
   - Seleção de modalidade (5K, 10K, Caminhada)
   - Upload de foto
   - Confirmação de pagamento (R$ 35,00)

### Rotas Definidas

```typescript
/ → Home (Landing page pública)
/loginInscricao → Autenticação de colaborador
/inscricao → Formulário de inscrição (requer autenticação)
```

## Funcionalidades Implementadas

### ✅ Home/Landing Page
- Hero section com gradiente de fundo
- Header flutuante com efeito "liquid glass"
- Navegação responsiva (desktop e mobile)
- Logo oficial da FARMACE
- Seção de informações com cards:
  - Data e horário
  - Local
  - Investimento
  - Modalidades
  - Kit do atleta
- CTA destacados para inscrição
- Footer com branding
- **Scroll behavior:** Header esconde ao descer, aparece ao subir

### ✅ Página de Inscrição
- Formulário completo com validação
- Máscaras para CPF, telefone, CEP
- Upload de foto com preview
- Persistência em localStorage
- Tela de confirmação com número do participante

### ✅ Login/Autenticação
- Arquivo `LoginInscricao.tsx` implementado e funcional
- **Objetivo:** Validar que apenas colaboradores da FARMACE possam se inscrever
- Redireciona para `/inscricao` após autenticação bem-sucedida
- Integrado com dados de funcionários e Supabase

## Design System

### Paleta de Cores (Baseada na Camisa do Evento)

#### Primary (Azul)
```css
primary-400: #38bdf8  (Sky Blue)
primary-500: #0ea5e9  (Primary)
primary-600: #0284c7  (Dark Sky)
primary-700: #0369a1  (Darker)
```

#### Accent (Amarelo)
```css
accent-300: #fde047
accent-400: #facc15  (Primary Accent)
accent-500: #eab308
accent-700: #a16207  (Dark)
```

#### Neutros
```css
slate-50, slate-400, slate-600, slate-900
sky-50, sky-400
```

### Componentes UI

Todos os componentes são do shadcn/ui com estilização customizada:
- `Button` - Variantes: default, outline, ghost; Tamanhos: default, sm, lg, xl
- `Card` / `CardContent` - Cards informativos
- `Input` - Campos de formulário
- `Label` - Labels de formulário

### Responsividade

**🎯 ABORDAGEM OBRIGATÓRIA: MOBILE-FIRST**

A aplicação DEVE ser 100% responsiva e funcional em TODOS os dispositivos. O desenvolvimento segue estritamente a metodologia mobile-first.

#### Breakpoints Padrão
```css
Mobile (Base):     < 640px   (sm)
Mobile Large:      640px+    (sm:)
Tablet:            768px+    (md:)
Tablet Large:      1024px+   (lg:)
Desktop:           1280px+   (xl:)
Desktop Large:     1536px+   (2xl:)
```

#### Princípios Mobile-First

1. **CSS Base para Mobile**
   - Estilos padrão sempre para telas pequenas
   - Usar Tailwind modifiers (md:, lg:) para expandir

2. **Touch-Friendly**
   - Botões com área mínima de 44x44px
   - Espaçamento adequado entre elementos clicáveis
   - Gestos naturais (swipe, scroll)

3. **Performance em Mobile**
   - Imagens otimizadas e lazy loading
   - Minimizar JavaScript desnecessário
   - Assets leves e comprimidos

4. **Layout Fluido**
   - Grid responsivo (mobile: 1 coluna, tablet: 2 colunas, desktop: 3+ colunas)
   - Flexbox para alinhamento dinâmico
   - Sem larguras fixas - usar max-width

5. **Navegação Adaptativa**
   - Mobile: Menu hamburguer
   - Desktop: Menu horizontal completo
   - Transições suaves entre breakpoints

#### Teste Obrigatório em:
- ✅ iPhone (Safari iOS)
- ✅ Android (Chrome Mobile)
- ✅ iPad (Safari)
- ✅ Desktop (Chrome, Firefox, Safari)
- ✅ Diferentes orientações (portrait/landscape)

## Convenções de Código

### TypeScript
- Tipagem estrita habilitada
- Interfaces para props de componentes
- Evitar `any` - preferir tipos específicos

### React
- Functional components com hooks
- useState para estado local
- useEffect para side effects
- useNavigate para navegação programática

### Styling (Mobile-First Obrigatório)

**SEMPRE escrever estilos seguindo a abordagem mobile-first:**

✅ **CORRETO - Mobile-First:**
```tsx
// Base = mobile, depois adiciona breakpoints maiores
<div className="flex-col md:flex-row p-4 md:p-8">
```

❌ **ERRADO - Desktop-First:**
```tsx
// NÃO fazer assim
<div className="flex-row sm:flex-col p-8 sm:p-4">
```

**Regras:**
- Tailwind CSS classes utilitárias
- Evitar CSS inline quando possível
- Usar `cn()` helper para merge de classes
- Classes base sem prefixo = mobile
- Prefixos (md:, lg:, xl:) = telas maiores
- Testar sempre em mobile primeiro

### Nomenclatura
- Componentes: PascalCase (ex: `Home.tsx`, `LoginInscricao.tsx`, `InscricaoWizard.tsx`)
- Funções/variáveis: camelCase
- Constantes: UPPER_SNAKE_CASE (quando aplicável)

## Estado Atual do Código

### Arquivos Modificados (Git Status)
```
M  src/App.tsx                    # Rotas atualizadas
M  src/pages/Home.tsx             # Hero e navegação ajustados
M  src/pages/LoginInscricao.tsx   # Página de login implementada
M  src/pages/InscricaoWizard.tsx  # Formulário wizard ativo
?? public/0104.mp4                # Vídeo adicionado
```

### Commits Recentes
```
b17d612 removeDiv valoresHome
7650640 alteradoHero
d3d32da docs: remove seções técnicas do README
59d5dca docs: remove seção de estrutura do projeto do README
529d129 docs: adiciona seção de design e inspirações ao README
```

## Dados e Validações

### Formulário de Inscrição - Campos Obrigatórios

**Dados Pessoais:**
- Nome completo
- Email
- Telefone (máscara: (XX) XXXXX-XXXX)
- CPF (máscara: XXX.XXX.XXX-XX)
- Data de nascimento

**Endereço:**
- CEP (máscara: XXXXX-XXX)
- Rua/Avenida
- Número
- Bairro
- Cidade
- Estado

**Dados do Evento:**
- Modalidade: 5K | 10K | Caminhada
- Tamanho da camiseta: PP | P | M | G | GG | XG
- Foto do participante (upload)

### Validações Necessárias
- CPF válido (algoritmo de validação)
- Email válido (regex)
- Telefone com DDD válido
- CEP válido (integração com API ViaCEP)
- Upload de foto (formatos aceitos: JPG, PNG)
- Todos os campos obrigatórios preenchidos

## Integrações e APIs

### Atual
- **localStorage** - Persistência temporária de dados de inscrição

### Planejadas/Necessárias
- **Backend API** - Para armazenamento permanente de inscrições
- **ViaCEP API** - Autocompletar endereço por CEP
- **Gateway de Pagamento** - Processar pagamento de R$ 35,00
- **Sistema de Email** - Confirmação de inscrição
- **Autenticação** - Validar colaboradores FARMACE (AD, OAuth, etc)

## Próximos Passos e Melhorias

### ⚠️ Requisito Sempre Presente
- [ ] **GARANTIR RESPONSIVIDADE TOTAL EM TODAS AS NOVAS FEATURES**
  - Qualquer nova página/componente DEVE ser mobile-first
  - Testar em múltiplos dispositivos antes de considerar completo
  - Verificar touch interactions em mobile/tablet

### Alta Prioridade
- [x] **Implementar página LoginInscricao.tsx** ✅
  - Sistema de autenticação para colaboradores (MOBILE-FIRST)
  - Integração com base de dados de funcionários da FARMACE
  - Proteção de rota `/inscricao`
  - Funcionamento perfeito em mobile

- [ ] **Backend/API**
  - Endpoint para salvar inscrições
  - Endpoint para autenticação
  - Banco de dados para armazenar participantes

- [ ] **Gateway de Pagamento**
  - Integração com PagSeguro/Mercado Pago/Stripe
  - Confirmação de pagamento de R$ 35,00

### Média Prioridade
- [ ] Sistema de envio de emails automáticos
- [ ] Área administrativa para visualizar inscrições
- [ ] Relatórios e estatísticas de inscritos
- [ ] Validação de CPF duplicado
- [ ] Geração de número de peito automático

### Baixa Prioridade
- [ ] Sistema de check-in no dia do evento
- [ ] Geração de certificados digitais
- [ ] Galeria de fotos da edição anterior
- [ ] Seção de FAQ expandida
- [ ] Mapa interativo do percurso

## Informações Específicas da FARMACE

### Branding
- **Logo:** `https://farmace.com.br/wp-content/uploads/2023/12/cropped-big-logo-farmace.png`
- **Cores corporativas:** Azul (tons de sky/primary)
- **Website corporativo:** https://farmace.com.br

### Contexto do Evento
- Evento anual durante a "Semana da Qualidade"
- Segunda edição (primeira edição já realizada)
- Foco em saúde, bem-estar e integração dos colaboradores
- Evento interno exclusivo para funcionários

## Desenvolvimento

### Scripts Disponíveis
```bash
npm run dev      # Servidor de desenvolvimento (localhost:5173)
npm run build    # Build de produção (TypeScript + Vite)
npm run preview  # Preview do build de produção
```

### Ambiente de Desenvolvimento
- Node.js 18+
- npm ou yarn
- Vite dev server com HMR
- TypeScript check em tempo de build

### Testando Responsividade Durante o Desenvolvimento

**Ferramentas obrigatórias:**
1. **Chrome DevTools** - Device Toolbar (Ctrl/Cmd + Shift + M)
2. **Responsive Design Mode** - Testar diferentes resoluções
3. **Dispositivos Reais** - Sempre que possível

**Workflow de desenvolvimento:**
```bash
1. npm run dev
2. Abrir Chrome DevTools (F12)
3. Ativar Device Toolbar (Ctrl+Shift+M)
4. Testar em: iPhone SE, iPhone 14, iPad Air, Desktop
5. Verificar orientação portrait E landscape
6. Testar touch interactions
```

**Simuladores úteis no DevTools:**
- iPhone SE (375px) - Mobile pequeno
- iPhone 14 Pro Max (430px) - Mobile grande
- iPad Air (820px) - Tablet
- Desktop (1920px) - Desktop padrão

## Referências e Inspirações

### Design
- [Campanha Corrida Integração - Behance](https://www.behance.net/gallery/203467473/Concorrencia-Campanha-Corrida-Integracao)
- [Corrida Integração Website](https://corridaintegracao.com.br/)

### Patterns
- Landing pages de eventos esportivos
- Liquid glass / glassmorphism design
- Mobile-first responsive design
- Scroll-triggered animations

## Notas de Implementação

### Liquid Glass Header
O header usa efeito "liquid glass" (glassmorphism):
```css
bg-white/10 backdrop-blur rounded-2xl border border-white/20
```

### Scroll Behavior
Header some ao fazer scroll down, reaparece ao fazer scroll up:
```typescript
useEffect(() => {
  const controlNavbar = () => {
    if (currentScrollY > lastScrollY) setIsVisible(false)
    else setIsVisible(true)
  }
  // ...
})
```

### Navegação Mobile
Menu hamburguer com animação smooth e backdrop blur effect.

## Questões em Aberto

1. **Autenticação:** Qual sistema usar para validar colaboradores? (AD, OAuth, lista estática?)
2. **Pagamento:** Qual gateway de pagamento a FARMACE prefere?
3. **Backend:** Onde hospedar? (AWS, Azure, Vercel + database?)
4. **Dados:** Qual banco de dados usar? (PostgreSQL, MongoDB, Firebase?)
5. **Deploy:** Onde fazer deploy da aplicação? (Vercel, Netlify, servidor próprio?)

## Contatos e Suporte

- **Desenvolvedor:** Emanuel (dono do repositório)
- **Empresa Cliente:** FARMACE
- **Repositório Git:** Branch `main` (em /home/emanuel/SemanaQualidade)

---

**Última atualização:** 2025-10-30
**Versão do Projeto:** 1.0.0
**Status:** 🚧 Em Desenvolvimento Ativo

## 📱 LEMBRETE CRÍTICO

> **TODA E QUALQUER FUNCIONALIDADE DESENVOLVIDA NESTE PROJETO DEVE SER 100% RESPONSIVA**
>
> Abordagem obrigatória: **MOBILE-FIRST**
> - Desenvolva primeiro para mobile (375px base)
> - Depois adapte para tablet (768px+)
> - Por último otimize para desktop (1024px+)
>
> Antes de considerar qualquer feature completa, ela DEVE funcionar perfeitamente em:
> ✅ Smartphones (iOS e Android)
> ✅ Tablets (portrait e landscape)
> ✅ Desktops (diferentes resoluções)
