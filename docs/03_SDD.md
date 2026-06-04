# G.A Essência

Documentação para desenvolvimento do MVP usando Spec Driven Development com apoio do Codex.

Produto: G.A Essência
Objetivo: sistema de agendamento com cálculo automático da taxa da clínica e ganho do profissional.
Stack alvo: React + TypeScript + Vite + Tailwind + Supabase.

# 03 — SDD: Software Design Document

## 1. Stack

Frontend:
- React
- TypeScript
- Vite
- Tailwind
- React Router
- React Hook Form
- Zod
- TanStack Query
- date-fns

Backend:
- Supabase
- PostgreSQL
- Supabase Auth
- RLS

Testes:
- Vitest
- React Testing Library

## 2. Princípios

- Regra financeira em `domain`, nunca só em componente.
- Telas não acessam Supabase diretamente.
- Repositories isolam acesso a dados.
- Formulários usam React Hook Form + Zod.
- Estado remoto usa TanStack Query.
- TypeScript obrigatório.
- Mobile first.

## 3. Estrutura

```txt
src/
  app/
  components/
    ui/
    layout/
  domain/
    appointments/
    patients/
    professionals/
    services/
    reports/
  features/
    auth/
    dashboard/
    appointments/
    patients/
    professionals/
    services/
    reports/
  repositories/
  services/
    supabase/
    export/
  utils/
  tests/
```

## 4. Entidades TypeScript

```ts
export type AppointmentStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "no_show"
  | "paid";
```

```ts
export type Patient = {
  id: string;
  userId: string;
  name: string;
  phone?: string | null;
  birthDate?: string | null;
  notes?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};
```

```ts
export type Professional = {
  id: string;
  userId: string;
  name: string;
  phone?: string | null;
  specialty?: string | null;
  pixKey?: string | null;
  defaultClinicFeePercentage: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};
```

```ts
export type ClinicService = {
  id: string;
  userId: string;
  name: string;
  defaultValue: number;
  durationMinutes: number;
  clinicFeePercentage: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};
```

```ts
export type Appointment = {
  id: string;
  userId: string;
  patientId: string;
  professionalId: string;
  serviceId: string;
  appointmentDate: string;
  appointmentTime: string;
  description?: string | null;
  notes?: string | null;
  value: number;
  clinicFeePercentage: number;
  clinicFeeValue: number;
  professionalGainValue: number;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
};
```

## 5. Funções de domínio

```ts
export function calculateAppointmentSplit(value: number, percentage: number) {
  if (value <= 0) {
    return { clinicFeeValue: 0, professionalGainValue: 0 };
  }

  const clinicFeeValue = Number((value * (percentage / 100)).toFixed(2));
  const professionalGainValue = Number((value - clinicFeeValue).toFixed(2));

  return { clinicFeeValue, professionalGainValue };
}
```

```ts
export function isFinancialStatus(status: AppointmentStatus) {
  return status === "completed" || status === "paid";
}
```

## 6. Fluxo criar atendimento

1. Selecionar paciente.
2. Selecionar profissional.
3. Selecionar serviço.
4. Serviço preenche valor e percentual.
5. Informar data e hora.
6. Calcular valores.
7. Salvar atendimento com valores persistidos.
8. Atualizar dashboard e relatório.

## 7. Decisões

- Persistir valores calculados para preservar histórico.
- Usar RLS em todas as tabelas.
- Não implementar multi-clínica no MVP.
- Não usar Redux.
- Usar layout mobile first.
