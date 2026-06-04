# G.A Essência

Documentação para desenvolvimento do MVP usando Spec Driven Development com apoio do Codex.

Produto: G.A Essência
Objetivo: sistema de agendamento com cálculo automático da taxa da clínica e ganho do profissional.
Stack alvo: React + TypeScript + Vite + Tailwind + Supabase.

# 06 — API Contracts / Repositories

## Convenções

Datas: `YYYY-MM-DD`  
Hora: `HH:mm`  
Dinheiro: number em reais  
CSV: separador `;`

## Auth

```ts
type SignInInput = {
  email: string;
  password: string;
};
```

## Patient

```ts
type PatientDTO = {
  id: string;
  name: string;
  phone: string | null;
  birthDate: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};
```

Repository:

```ts
list(filters?: { search?: string; active?: boolean }): Promise<PatientDTO[]>
create(input: CreatePatientInput): Promise<PatientDTO>
update(id: string, input: UpdatePatientInput): Promise<PatientDTO>
deactivate(id: string): Promise<void>
```

## Professional

```ts
type ProfessionalDTO = {
  id: string;
  name: string;
  phone: string | null;
  specialty: string | null;
  pixKey: string | null;
  defaultClinicFeePercentage: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};
```

## Service

```ts
type ServiceDTO = {
  id: string;
  name: string;
  defaultValue: number;
  durationMinutes: number;
  clinicFeePercentage: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};
```

## Appointment

```ts
type AppointmentDTO = {
  id: string;
  patientId: string;
  patientName?: string;
  professionalId: string;
  professionalName?: string;
  serviceId: string;
  serviceName?: string;
  appointmentDate: string;
  appointmentTime: string;
  description: string | null;
  notes: string | null;
  value: number;
  clinicFeePercentage: number;
  clinicFeeValue: number;
  professionalGainValue: number;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
};
```

Repository:

```ts
list(filters: AppointmentFilters): Promise<AppointmentDTO[]>
create(input: CreateAppointmentInput): Promise<AppointmentDTO>
update(id: string, input: UpdateAppointmentInput): Promise<AppointmentDTO>
remove(id: string): Promise<void>
```

## Report

```ts
type MonthlyReportInput = {
  month: number;
  year: number;
  professionalId?: string;
  serviceId?: string;
};
```

```ts
type MonthlyReportOutput = {
  totalRevenue: number;
  totalClinicRevenue: number;
  totalProfessionalRevenue: number;
  appointmentCount: number;
  cancelledCount: number;
  noShowCount: number;
  giftCount: number;
  rows: AppointmentDTO[];
  byService: Array<{
    serviceId: string;
    serviceName: string;
    total: number;
    count: number;
  }>;
  byProfessional: Array<{
    professionalId: string;
    professionalName: string;
    total: number;
    count: number;
  }>;
};
```
