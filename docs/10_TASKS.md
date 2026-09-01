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

## Bloco 14 — Contratos de período e relatório

- [x] T-062 — Estender filtros e repository de atendimentos com intervalo inclusivo e normalização mensal · Arquivos: src/domain/appointments/appointment.types.ts, src/repositories/appointment.repository.ts, src/utils/appointmentPeriod.ts · Atende: RF-021, CA-005, CA-006, CA-007, CA-008, RNF-010 · verify: testes cobrem mês corrente, virada de ano, ano bissexto, intervalo inclusivo e período inválido
- [x] T-063 — Estender o domínio de relatório com status, total do período e quantidade financeira · Arquivos: src/domain/reports/report.types.ts, src/domain/reports/createMonthlySummary.ts · Atende: RF-024, CA-017, CA-018, CA-019, CA-021 · Depende de: T-062 · verify: testes provam que somente completed e paid compõem valores e que todos os status mantêm suas contagens
- [x] T-064 — Fazer a exportação CSV consumir o mesmo conjunto filtrado do relatório · Arquivos: src/domain/reports/createMonthlyReportCsv.ts, src/services/export, src/tests/report.test.ts · Atende: RF-024, CA-020, RNF-010 · Depende de: T-063 · verify: para cada status, IDs/linhas do detalhe e do CSV são idênticos
- [x] T-065 — Cobrir filtros combinados, período e relatório com testes de domínio e repository · Arquivos: src/tests/report.test.ts, src/tests/appointmentFilters.test.ts, src/repositories/appointment.repository.ts · Atende: RF-021, RF-022, RF-024, CA-005, CA-006, CA-007, CA-008, CA-009, CA-017, CA-018, CA-019, CA-020, CA-021, RNF-010 · Depende de: T-062, T-063, T-064 · verify: npm test executa os cenários de intervalo, interseção de filtros, status financeiro e CSV sem falhas

## Bloco 15 — Navegação mobile sem sobreposição

- [x] T-066 — Substituir o menu inferior mobile por drawer mantendo a sidebar desktop · Arquivos: src/components/layout/AppLayout.tsx, src/components/layout/MainMenu.tsx · Atende: RF-020, CA-001, CA-002, CA-004, RNF-008 · Depende de: T-065 · verify: em 320px, 390px e 430px não há menu inferior nem conteúdo coberto; desktop mantém sidebar
- [x] T-067 — Implementar foco, teclado, backdrop, safe areas e testes do drawer · Arquivos: src/components/layout/AppLayout.tsx, src/components/layout/MainMenu.tsx, src/tests/navigation.test.tsx, package.json, package-lock.json · Atende: RF-020, CA-003, RNF-008, RNF-009 · Depende de: T-066 · verify: testes fecham por rota, backdrop, Fechar e Escape e confirmam restauração de foco e aria-expanded

## Bloco 16 — Agenda mobile e filtros ativos

- [x] T-068 — Construir seletor mensal, período personalizado, busca, status, filtros expansíveis, chips e limpeza · Arquivos: src/features/appointments/AppointmentsPage.tsx, src/utils/appointmentPeriod.ts, src/tests/appointmentFilters.test.tsx · Atende: RF-021, RF-022, CA-005, CA-006, CA-007, CA-008, CA-009, CA-010, CA-011, CA-012 · Depende de: T-062, T-067 · verify: alterar ou remover qualquer filtro atualiza controles, chips, contagem e estado vazio sem reload completo
- [x] T-069 — Redesenhar cards mobile e menu de ações com confirmação de remoção · Arquivos: src/features/appointments/AppointmentsPage.tsx, src/tests/appointmentFilters.test.tsx · Atende: RF-023, CA-013, CA-014, CA-015, CA-016, RNF-008, RNF-009 · Depende de: T-068 · verify: card exibe todos os dados, Editar fica visível, menu contém calendário/remover e confirmação contextual funciona
- [x] T-070 — Testar agenda mobile, combinações de filtros, estados e responsividade · Arquivos: src/tests/appointmentFilters.test.tsx, src/tests/appointmentNavigation.test.tsx, src/features/appointments/AppointmentsPage.tsx · Atende: RF-022, RF-023, RF-027, CA-010, CA-011, CA-012, CA-013, CA-014, CA-015, CA-016, CA-028, RNF-008, RNF-009 · Depende de: T-068, T-069 · verify: 10 arquivos e 57 testes passam; cards/tabela são isolados por breakpoint, ações essenciais não dependem de hover e controles mobile têm alvos de toque de 44 px

## Bloco 17 — Relatório coerente por status

- [x] T-071 — Adicionar status, chips e indicadores total/financeiro ao relatório mobile · Arquivos: src/features/reports/ReportsPage.tsx, src/app/AppRoutes.tsx, src/tests/reportPage.test.tsx · Atende: RF-024, CA-017, CA-018, CA-019, CA-021 · Depende de: T-063, T-067 · verify: status, chips, detalhe, total no período, financeiros, faturamento, clínica e profissional usam o mesmo conjunto filtrado; status não financeiro mantém linhas e zera indicadores financeiros
- [x] T-072 — Integrar exportação aos filtros visíveis e feedback de download · Arquivos: src/features/reports/ReportsPage.tsx, src/app/AppRoutes.tsx, src/services/export/downloadFile.ts, src/tests/reportPage.test.tsx · Atende: RF-024, CA-020 · Depende de: T-064, T-071 · verify: exportação usa o mesmo resumo filtrado, informa filename/sucesso e falha de download mostra ação de nova tentativa
- [ ] T-073 — Testar estados, acessibilidade e desempenho do relatório filtrado · Arquivos: src/tests/report.test.ts, src/tests/reportPage.test.tsx, src/features/reports/ReportsPage.tsx · Atende: RF-024, RF-027, CA-017, CA-018, CA-019, CA-020, CA-021, CA-028, RNF-009, RNF-010 · Depende de: T-071, T-072 · verify: testes de tela/domínio passam, axe não aponta violação crítica ou séria e 1.000 registros filtram em até 500ms

## Bloco 18 — Formulário, telas complementares e validação integrada

- [ ] T-074 — Refinar formulário mobile, cálculo ao vivo e proteção contra envio duplicado · Arquivos: src/features/appointments/AppointmentForm.tsx, src/features/appointments/AppointmentsPage.tsx, src/tests/appointmentForm.test.tsx · Atende: RF-025, CA-022, CA-023, CA-024, CA-025, RNF-008, RNF-009 · Depende de: T-067 · verify: ordem de foco, preenchimento automático, cálculo, alvos de toque e mutation única passam nos testes e inspeção mobile
- [ ] T-075 — Aplicar o sistema mobile a login, dashboard, pacientes, profissionais e serviços · Arquivos: src/features/auth/LoginPage.tsx, src/features/dashboard/DashboardPage.tsx, src/features/patients/PatientsPage.tsx, src/features/professionals/ProfessionalsPage.tsx, src/features/services/ServicesPage.tsx · Atende: RF-026, CA-026, CA-027, RNF-008, RNF-009 · Depende de: T-067 · verify: todas as telas operam em 320px, 390px e 430px sem overflow e o dashboard prioritário cabe na primeira rolagem de 390×844
- [ ] T-076 — Validar fluxos completos, matriz de estados, acessibilidade e regressão desktop · Arquivos: src/tests/mobileUxFlow.test.tsx, src/tests, src/index.css · Atende: RF-027, CA-028, RNF-008, RNF-009, RNF-010 · Depende de: T-070, T-073, T-074, T-075 · verify: npm test e npm run build passam; inspeção confirma todos os estados, WCAG 2.2 AA no escopo e ausência de regressão desktop
