# G.A Essência

Documentação para desenvolvimento do MVP usando Spec Driven Development com apoio do Codex.

Produto: G.A Essência
Objetivo: sistema de agendamento com cálculo automático da taxa da clínica e ganho do profissional.
Stack alvo: React + TypeScript + Vite + Tailwind + Supabase.

# 10 — Tasks

## EPIC-001 Setup

### TASK-001
Criar projeto React + Vite + TypeScript.

### TASK-002
Configurar Tailwind.

### TASK-003
Criar estrutura de pastas do SDD.

### TASK-004
Configurar React Router.

### TASK-005
Configurar TanStack Query Provider.

## EPIC-002 Supabase

### TASK-006
Criar `supabaseClient`.

### TASK-007
Criar `.env.example`.

### TASK-008
Aplicar SQL do `05_DATABASE.md`.

### TASK-009
Criar tipos base.

## EPIC-003 Auth

### TASK-010
Criar LoginPage.

### TASK-011
Implementar login.

### TASK-012
Implementar logout.

### TASK-013
Criar ProtectedRoute.

## EPIC-004 UI Base

### TASK-014
Criar AppLayout.

### TASK-015
Criar menu.

### TASK-016
Criar componentes: Button, Input, Select, Card, Badge, Modal, Table.

## EPIC-005 Domínio

### TASK-017
Criar `calculateAppointmentSplit`.

### TASK-018
Criar `isFinancialStatus`.

### TASK-019
Criar `formatCurrencyBRL`.

### TASK-020
Criar testes unitários financeiros.

## EPIC-006 Pacientes

### TASK-021
Criar schema Zod de paciente.

### TASK-022
Criar patientRepository.

### TASK-023
Criar PatientsPage.

### TASK-024
Criar PatientForm.

### TASK-025
Integrar CRUD de pacientes.

## EPIC-007 Profissionais

### TASK-026
Criar schema Zod de profissional.

### TASK-027
Criar professionalRepository.

### TASK-028
Criar ProfessionalsPage.

### TASK-029
Criar ProfessionalForm.

### TASK-030
Integrar CRUD de profissionais.

## EPIC-008 Serviços

### TASK-031
Criar schema Zod de serviço.

### TASK-032
Criar serviceRepository.

### TASK-033
Criar ServicesPage.

### TASK-034
Criar ServiceForm.

### TASK-035
Criar seed de serviços.

## EPIC-009 Atendimentos

### TASK-036
Criar schema Zod de atendimento.

### TASK-037
Criar appointmentRepository.

### TASK-038
Criar AppointmentsPage.

### TASK-039
Criar AppointmentForm.

### TASK-040
Preencher valor/percentual ao selecionar serviço.

### TASK-041
Recalcular ao alterar valor ou percentual.

### TASK-042
Salvar atendimento com valores calculados.

### TASK-043
Editar atendimento.

### TASK-044
Implementar filtros.

## EPIC-010 Dashboard

### TASK-045
Criar função de resumo mensal.

### TASK-046
Criar DashboardPage.

### TASK-047
Exibir próximos atendimentos.

### TASK-048
Exibir atendimentos de hoje.

## EPIC-011 Relatórios

### TASK-049
Criar ReportsPage.

### TASK-050
Criar relatório mensal.

### TASK-051
Criar breakdown por serviço.

### TASK-052
Criar breakdown por profissional.

### TASK-053
Exportar CSV.

## EPIC-012 Polimento

### TASK-054
Responsividade geral.

### TASK-055
Loading states.

### TASK-056
Empty states.

### TASK-057
Error states.

### TASK-058
README final.

## EPIC-013 Validação

### TASK-059
Testar fluxo completo.

### TASK-060
Conferir cálculos com a planilha real.

### TASK-061
Preparar demo.
