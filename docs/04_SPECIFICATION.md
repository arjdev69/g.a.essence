# G.A Essência

Documentação para desenvolvimento do MVP usando Spec Driven Development com apoio do Codex.

Produto: G.A Essência
Objetivo: sistema de agendamento com cálculo automático da taxa da clínica e ganho do profissional.
Stack alvo: React + TypeScript + Vite + Tailwind + Supabase.

# 04 — Specification

## FEATURE-001 Authentication

Inputs: email, password.

Regras:
- e-mail obrigatório;
- senha obrigatória;
- rotas internas protegidas.

Aceite:
- login válido vai para dashboard;
- login inválido mostra erro;
- logout encerra sessão.

## FEATURE-002 Patients

Campos: name, phone, birthDate, notes, active.

Regras:
- name obrigatório;
- paciente com histórico deve ser inativado.

Aceite:
- criar, listar, editar e inativar paciente.

## FEATURE-003 Professionals

Campos: name, phone, specialty, pixKey, defaultClinicFeePercentage, active.

Regras:
- name obrigatório;
- percentual entre 0 e 100;
- padrão 30%.

Aceite:
- criar, listar, editar e inativar profissional.

## FEATURE-004 Services

Campos: name, defaultValue, durationMinutes, clinicFeePercentage, active.

Regras:
- name obrigatório;
- value >= 0;
- duration > 0;
- percentage entre 0 e 100;
- valor 0 é permitido para brinde.

Aceite:
- criar, listar, editar e inativar serviço.

## FEATURE-005 Appointment Creation

Inputs:
- patientId;
- professionalId;
- serviceId;
- appointmentDate;
- appointmentTime;
- value;
- clinicFeePercentage;
- notes;
- status.

Regras:
- campos obrigatórios devem ser preenchidos;
- valor e percentual vêm do serviço;
- usuário pode sobrescrever;
- cálculo acontece antes de salvar.

Fórmula:
```txt
clinicFeeValue = value * clinicFeePercentage / 100
professionalGainValue = value - clinicFeeValue
```

Aceite:
- 110 e 30% gera 33 e 77;
- 160 e 30% gera 48 e 112;
- 0 gera 0 e 0.

## FEATURE-006 Appointment Listing

Desktop:
Data, Hora, Paciente, Serviço, Profissional, Valor, Clínica, Profissional, Status, Ações.

Mobile:
Card com informações principais.

Filtros:
data, paciente, profissional, serviço, status.

## FEATURE-007 Status

- scheduled: não entra no financeiro.
- completed: entra.
- paid: entra.
- cancelled: não entra.
- no_show: não entra.

## FEATURE-008 Dashboard

Cards:
- faturamento do mês;
- receita clínica;
- ganho profissional;
- atendimentos realizados;
- cancelamentos;
- brindes.

## FEATURE-009 Monthly Report

Inputs:
- month;
- year;
- professionalId opcional;
- serviceId opcional.

Outputs:
- totalRevenue;
- totalClinicRevenue;
- totalProfessionalRevenue;
- appointmentCount;
- byService;
- byProfessional.

## FEATURE-010 CSV Export

Arquivo:
`relatorio-atendimentos-YYYY-MM.csv`

Colunas:
Paciente, Data, Hora, Serviço, Profissional, Valor, Clínica, Profissional Recebe, Status, Observação.

Separador: `;`.

## FEATURE-011 Patient History

Exibir histórico em ordem decrescente por data.

## FEATURE-012 Seed Data

Serviços:
- Massagem Terapêutica — 110 — 60 min — 30%.
- SPA dos pés — 110 — 60 min — 30%.
- Drenagem Linfática — 160 — 60 min — 30%.
- Brinde massagem facial — 0 — 30 min — 0%.
- Brinde SPA dos pés — 0 — 30 min — 0%.
