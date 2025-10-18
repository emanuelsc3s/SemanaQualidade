# 2ª Corrida e Caminhada da Qualidade FARMACE

Landing page moderna e responsiva para a Segunda Corrida e Caminhada da Qualidade da empresa FARMACE.

## Tecnologias Utilizadas

- **React 19** - Biblioteca JavaScript para construção de interfaces
- **Vite** - Build tool rápida e moderna
- **TypeScript** - Superset JavaScript com tipagem estática
- **Tailwind CSS v4** - Framework CSS utility-first
- **shadcn/ui** - Componentes UI reutilizáveis e acessíveis
- **Lucide React** - Biblioteca de ícones moderna
- **React Router DOM** - Roteamento para aplicações React

## Funcionalidades

### Landing Page (Home)
- ✅ Hero Section moderna e impactante com gradientes vibrantes
- ✅ Design inspirado nas cores da camisa do evento (tons de azul)
- ✅ Logomarca oficial da FARMACE
- ✅ Seção de informações do evento com cards informativos
- ✅ Call-to-action proeminente para inscrições
- ✅ Layout totalmente responsivo (mobile-first)

### Página de Inscrições
- ✅ Formulário completo de inscrição com validação
- ✅ Campos obrigatórios:
  - Dados pessoais (nome, email, telefone, CPF, data de nascimento)
  - Endereço completo (CEP, rua, cidade, estado)
  - Informações da corrida (modalidade, tamanho da camiseta)
  - Upload de foto do participante
- ✅ Validação em tempo real com feedback visual
- ✅ Máscaras de formatação (CPF, telefone, CEP)
- ✅ Sistema de upload de fotos com preview
- ✅ Persistência de dados em localStorage
- ✅ Tela de confirmação com número do participante
- ✅ Informação clara do valor: R$ 35,00

## Instalação e Execução

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### Passo a Passo

1. Clone o repositório ou navegue até a pasta do projeto:
\`\`\`bash
cd CorridaQualidade2
\`\`\`

2. Instale as dependências:
\`\`\`bash
npm install
\`\`\`

3. Inicie o servidor de desenvolvimento:
\`\`\`bash
npm run dev
\`\`\`

4. Abra o navegador em: `http://localhost:5173/`

### Comandos Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Preview do build de produção

## Design e Inspirações

O design desta landing page foi inspirado em eventos esportivos de corrida de rua, com referências visuais de:

- [Campanha Corrida Integração - Behance](https://www.behance.net/gallery/203467473/Concorrencia-Campanha-Corrida-Integracao?tracking_source=search_projects|maratona+corrida+de+rua&l=0) - Referência visual e de campanha
- [Corrida Integração](https://corridaintegracao.com.br/) - Referência de layout e estrutura de site de evento esportivo

## Paleta de Cores

Baseado na camisa do evento:

- **Primary (Azul)**:
  - 400: `#38bdf8` (Sky Blue)
  - 500: `#0ea5e9` (Primary)
  - 600: `#0284c7` (Dark Sky)

- **Accent (Amarelo)**:
  - 300: `#fde047`
  - 400: `#facc15`
  - 500: `#eab308`

## Armazenamento de Dados

As inscrições são armazenadas no `localStorage` do navegador com a seguinte estrutura:

\`\`\`javascript
{
  id: number,
  numeroParticipante: string,
  nome: string,
  email: string,
  telefone: string,
  cpf: string,
  dataNascimento: string,
  cep: string,
  endereco: string,
  cidade: string,
  estado: string,
  modalidade: string,
  tamanho: string,
  foto: string (base64),
  dataInscricao: string (ISO)
}
\`\`\`

### Acessando os Dados

Para visualizar as inscrições armazenadas, abra o Console do navegador e execute:

\`\`\`javascript
JSON.parse(localStorage.getItem('inscricoes'))
\`\`\`

## Responsividade

A aplicação foi desenvolvida com abordagem mobile-first e é totalmente responsiva:

- 📱 Mobile: < 768px
- 💻 Tablet: 768px - 1024px
- 🖥️ Desktop: > 1024px

## Validações Implementadas

- ✅ CPF: Validação de formato e dígitos verificadores
- ✅ Email: Validação de formato de email
- ✅ Telefone: Mínimo 10 dígitos
- ✅ Campos obrigatórios: Todos os campos do formulário
- ✅ Foto: Upload obrigatório de imagem

## Melhorias Futuras

- [ ] Integração com gateway de pagamento
- [ ] Backend para armazenamento permanente
- [ ] Sistema de envio de emails
- [ ] Área administrativa para gerenciar inscrições
- [ ] Relatórios e estatísticas
- [ ] Sistema de check-in no dia do evento
- [ ] Geração de certificados

## Licença

Este projeto foi desenvolvido para a FARMACE.

## Contato

Para dúvidas ou sugestões sobre o evento, entre em contato com a organização da FARMACE.
