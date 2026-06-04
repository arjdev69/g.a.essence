# G.A Essência

Documentação para desenvolvimento do MVP usando Spec Driven Development com apoio do Codex.

Produto: G.A Essência
Objetivo: sistema de agendamento com cálculo automático da taxa da clínica e ganho do profissional.
Stack alvo: React + TypeScript + Vite + Tailwind + Supabase.

# 09 — Coding Standards

## 1. TypeScript

Proibido usar `any` sem justificativa.

## 2. React

Usar componentes funcionais.

## 3. Formulários

Sempre usar React Hook Form + Zod.

## 4. Estado remoto

Usar TanStack Query.

Não usar Redux no MVP.

## 5. Supabase

Telas não acessam Supabase diretamente. Usar repositories.

## 6. Domínio

Lógica financeira fica em `domain`.

Errado:
```tsx
const clinic = value * 0.3
```

Certo:
```ts
calculateAppointmentSplit(value, percentage)
```

## 7. Nomes

Arquivos:
- `patient.repository.ts`
- `patient.schema.ts`
- `PatientForm.tsx`

Tipos:
- `Patient`
- `CreatePatientInput`

Funções:
- `calculateAppointmentSplit`

## 8. UI

Usar Tailwind.
Manter mobile first.

## 9. Testes

Obrigatório para:
- cálculo;
- status financeiro;
- relatório;
- validações críticas.

## 10. Proibido no MVP

- Redux;
- GraphQL;
- backend customizado;
- microserviços;
- pagamento;
- WhatsApp automático;
- multi-clínica.
