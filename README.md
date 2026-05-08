# SDR Vibe - CRM para Prospecção Ativa

O **SDR Vibe** é um CRM focado em prospecção ativa, projetado para otimizar o fluxo de trabalho de Sales Development Representatives (SDRs). A plataforma centraliza a gestão de leads, campanhas e a comunicação inicial, integrando inteligência artificial para auxiliar na geração de mensagens altamente contextualizadas e persuasivas, aumentando assim a taxa de conversão nas etapas iniciais do funil de vendas.

---

## Links de Acesso

- **Deploy da Aplicação (Vercel):** [https://sdr-vibe-crm.vercel.app/login]
- **Vídeo de Apresentação:** [https://drive.google.com/file/d/1JqqjCCQja0U840NExAWuO5YzEsgx3NKy/view?usp=sharing]

---

## Tecnologias Utilizadas

A stack tecnológica foi selecionada para garantir alta performance, tipagem estática e escalabilidade:

- **Frontend:** React (Vite), Tailwind CSS
- **Linguagem:** TypeScript
- **Componentes de UI:** Shadcn/UI, Lucide React, Recharts
- **Backend & Banco de Dados:** Supabase (Auth, PostgreSQL DB, Edge Functions)
- **Inteligência Artificial:** Gemini API (Google)

---

## Decisões Técnicas Justificadas

### Arquitetura Serverless e Integração de IA

**Por que usamos Supabase Edge Functions para integrar a LLM?**
A integração com a Gemini API ocorre de forma isolada através de Supabase Edge Functions. Essa decisão arquitetural foi tomada principalmente por motivos de segurança e performance. Executar as chamadas da LLM em um ambiente backend serverless garante que as chaves de API não sejam expostas no cliente (navegador). Além disso, reduzimos a carga computacional no frontend e criamos um ambiente seguro para o processamento de regras de negócios complexas associadas aos prompts.

### Banco de Dados e Multi-tenancy

**Uso de PostgreSQL com isolamento por Workspace.**
A camada de dados é suportada por um banco PostgreSQL relacional via Supabase. A arquitetura foi estruturada com foco no isolamento de dados através de um modelo _Multi-tenancy_ baseado em "Workspaces". Isso significa que cada organização ou equipe possui seus dados completamente segregados através de políticas de segurança em nível de linha (Row Level Security - RLS). Essa abordagem garante que os usuários apenas acessem campanhas, leads e métricas pertencentes ao seu respectivo workspace, assegurando escalabilidade B2B sem comprometer a privacidade.

### Automação de Fluxo (Etapa Gatilho)

**Progressão automática de leads no pipeline.**
Para reduzir o atrito operacional e minimizar tarefas repetitivas do SDR, implementamos o conceito de 'Etapa Gatilho'. Quando um SDR gera e confirma o envio da primeira mensagem para um lead (seja via WhatsApp, LinkedIn ou Email), o sistema identifica essa ação e automaticamente move o card do lead da coluna inicial para a etapa "Tentando Contato" no funil Kanban. Essa micro-automação mantém o CRM atualizado em tempo real, refletindo a verdadeira cadência de prospecção sem exigir o arraste manual (drag-and-drop) a cada interação.


**Desafios Encontrados e Resolução**
Tratamento de Erros e Evolução da API LLM: Durante o desenvolvimento da integração com a Inteligência Artificial, enfrentei o desafio de falhas silenciosas na comunicação com o Google Gemini. O Deno nativo das Edge Functions não acionava o bloco catch para erros HTTP 4xx/5xx da API.
A Solução: Refatorei o index.ts da Edge Function para forçar a validação do response.ok e a extração do errorText diretamente do body da requisição. Isso me permitiu identificar rapidamente uma descontinuidade do modelo antigo da IA e atualizar em tempo real a URL de comunicação para a versão mais estável e moderna (gemini-2.5-flash), garantindo a resiliência do sistema com um fallback seguro de respostas.

---

## Checklist de Funcionalidades Entregues

- [x] **Funil Kanban:** Visualização em pipeline com suporte responsivo, otimizado para evitar rolagem horizontal excessiva.
- [x] **Gestão de Campanhas:** Criação, edição e acompanhamento de campanhas de prospecção.
- [x] **Geração de Mensagens com IA:** Integração com Gemini API para criar copies e abordagens personalizadas baseadas no contexto do lead.
- [x] **Dashboard de Métricas:** Painel analítico para acompanhamento de performance tática e conversões das campanhas.

---

## Instruções de Instalação e Execução Local

Siga os passos abaixo para rodar o projeto em sua máquina local.

### 1. Clonar o repositório

```bash
https://github.com/hayax0/sdr-vibe-crm.git
cd sdr-vibe-crm
```

### 2. Instalar as dependências

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### 3. Configurar as Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto, baseado no arquivo `.env.example` (se existir). Você precisará configurar as credenciais do Supabase:

```env
# Supabase (Exemplo)
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

> **Nota:** O deploy das Supabase Edge Functions, onde a chave `GEMINI_API_KEY` deve estar segura, é necessário para a funcionalidade de Inteligência Artificial.

### 4. Executar o servidor de desenvolvimento

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador para visualizar a aplicação.

---

_Documentação desenvolvida como parte da Prova Técnica_.

---

**Autor:** Caio Campos - Desenvolvedor Full Stack / Software Engineering Student.
