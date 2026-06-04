# G.A Essência

Documentação para desenvolvimento do MVP usando Spec Driven Development com apoio do Codex.

Produto: G.A Essência
Objetivo: sistema de agendamento com cálculo automático da taxa da clínica e ganho do profissional.
Stack alvo: React + TypeScript + Vite + Tailwind + Supabase.

# 11 — Project Rules para Codex

Você está trabalhando no G.A Essência.

## Objetivo

Construir MVP web para agendamento com cálculo automático da taxa da clínica e ganho profissional.

## Stack obrigatória

- React
- TypeScript
- Vite
- Tailwind
- React Router
- React Hook Form
- Zod
- TanStack Query
- Supabase
- Vitest

## Regra de execução

Implemente apenas a task solicitada.

Não antecipe funcionalidades.

## Proibido

- Redux;
- GraphQL;
- backend customizado;
- Firebase;
- `any` sem justificativa;
- lógica financeira dentro de componente;
- funcionalidades fora do MVP.

## Obrigatório

- TypeScript;
- React Hook Form + Zod;
- TanStack Query;
- repositories para Supabase;
- funções de domínio;
- testes para cálculo.

## Regra financeira

```txt
clinicFeeValue = value * clinicFeePercentage / 100
professionalGainValue = value - clinicFeeValue
```

Exemplos:
- 110 com 30% = 33 e 77.
- 160 com 30% = 48 e 112.
- 0 = 0 e 0.

## Status financeiro

Entram:
- completed;
- paid.

Não entram:
- scheduled;
- cancelled;
- no_show.

## Resposta esperada

Ao finalizar task, responda:

```txt
Task implementada:
Arquivos criados:
Arquivos alterados:
Como testar:
Observações:
```
