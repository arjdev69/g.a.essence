# G.A Essencia

Aplicacao web responsiva para agendamento de atendimentos com calculo automatico
da taxa da clinica e do ganho do profissional.

O MVP substitui o controle manual em planilhas para pequenas clinicas e
profissionais de bem-estar, mantendo pacientes, profissionais, servicos,
atendimentos, dashboard mensal, relatorios e exportacao CSV em um unico fluxo.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- React Hook Form
- Zod
- TanStack Query
- Supabase Auth e PostgreSQL
- Vitest

## Funcionalidades do MVP

- Login com email e senha.
- Rotas internas protegidas por sessao.
- Cadastro e busca de pacientes.
- Cadastro de profissionais com percentual padrao da clinica.
- Cadastro de servicos com valor, duracao e percentual.
- Criacao e edicao de atendimentos.
- Calculo automatico de divisao financeira.
- Status de atendimento: agendado, realizado, cancelado, faltou e pago.
- Dashboard mensal com totais e agenda.
- Relatorio mensal por periodo, profissional e servico.
- Exportacao CSV com separador `;`.
- Layout responsivo para celular e desktop.

## Regras financeiras

O calculo fica nas funcoes de dominio, fora dos componentes de tela.

```txt
clinicFeeValue = value * clinicFeePercentage / 100
professionalGainValue = value - clinicFeeValue
```

Exemplos:

- R$ 110,00 com 30%: clinica R$ 33,00 e profissional R$ 77,00.
- R$ 160,00 com 30%: clinica R$ 48,00 e profissional R$ 112,00.
- R$ 0,00: clinica R$ 0,00 e profissional R$ 0,00.

Entram no financeiro: `completed` e `paid`.

Nao entram no financeiro: `scheduled`, `cancelled` e `no_show`.

## Requisitos

- Node.js compativel com Vite 8.
- npm.
- Projeto Supabase com Auth habilitado.
- Usuario criado no Supabase Auth para acessar o app.

## Configuracao

1. Instale as dependencias:

```bash
npm install
```

2. Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Preencha as variaveis do Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publicavel
```

4. Aplique o schema do banco no Supabase.

A migration inicial esta em:

```txt
supabase/migrations/20260603200000_initial_schema.sql
```

Ela cria as tabelas `patients`, `professionals`, `services` e `appointments`,
indices, triggers de `updated_at` e politicas de RLS por usuario autenticado.

5. Crie um usuario em Authentication > Users no painel do Supabase.

O login do app usa email e senha. No MVP, existe um usuario administrador
autenticado; profissionais cadastrados nao possuem login proprio.

## Rodando localmente

```bash
npm run dev
```

Abra a URL exibida pelo Vite, normalmente:

```txt
http://localhost:5173
```

## Scripts

```bash
npm run dev
npm run test
npm run lint
npm run build
npm run preview
```

- `dev`: inicia o servidor local de desenvolvimento.
- `test`: executa os testes unitarios com Vitest.
- `lint`: executa o ESLint.
- `build`: roda TypeScript e gera o build de producao.
- `preview`: serve o build localmente para conferencia.

## Estrutura principal

```txt
src/
  app/
  components/
  domain/
  features/
  repositories/
  services/
  tests/
  utils/
supabase/
  migrations/
docs/
```

- `domain`: regras de negocio e calculos financeiros.
- `features`: telas e formularios por modulo.
- `repositories`: acesso ao Supabase.
- `services/supabase`: client e tipos do banco.
- `components`: layout e componentes reutilizaveis.
- `tests`: testes de calculo, status financeiro, relatorio e CSV.

## Validacao

Antes de publicar ou demonstrar o MVP, rode:

```bash
npm run test
npm run lint
npm run build
```

Os testes obrigatorios cobrem calculo da divisao financeira, status que entram
no financeiro, formatacao BRL, resumo mensal e exportacao CSV.

## Escopo fora do MVP

- Pagamento online.
- PIX automatico.
- WhatsApp automatico.
- Assinatura SaaS.
- Multi-clinica avancado.
- App nativo.
- Estoque.
- Prontuario clinico.
