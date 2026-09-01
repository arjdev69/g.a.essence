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

## FEATURE-013 Mobile Navigation V2

Entradas:
- viewport atual;
- rota atual;
- interação do botão Menu, backdrop, Fechar ou tecla `Escape`.

Regras:
- desktop mantém sidebar;
- mobile não renderiza menu fixo no rodapé;
- drawer contém todas as rotas internas;
- drawer aberto bloqueia interação e rolagem do conteúdo de fundo;
- fechamento restaura foco ao botão Menu.

Aceite: CA-001, CA-002, CA-003 e CA-004.

## FEATURE-014 Appointment Period and Filters V2

Entradas:
- `dateFrom` e `dateTo` inclusivos;
- busca textual;
- `patientId`, `professionalId`, `serviceId` e `status` opcionais.

Regras:
- default é o mês corrente;
- mês anterior/próximo e seleção direta calculam primeiro/último dia;
- intervalo personalizado inválido não dispara nova consulta;
- filtros estruturados são combinados por `AND`;
- filtros ativos ficam visíveis e podem ser removidos;
- limpar restaura defaults.

Saídas:
- lista filtrada;
- quantidade de resultados;
- chips ativos;
- estado `sem resultados`, distinto de erro.

Aceite: CA-005 a CA-012.

## FEATURE-015 Mobile Appointment Cards V2

Conteúdo obrigatório:
- paciente;
- serviço;
- profissional;
- data e hora;
- valor;
- clínica/profissional;
- status financeiro ou não financeiro.

Ações:
- `Editar` visível;
- `Adicionar ao calendário` no menu Mais ações;
- `Remover` no menu Mais ações com confirmação contextual.

Aceite: CA-013 a CA-016.

## FEATURE-016 Monthly Report Status V2

Inputs:
- month;
- year;
- status opcional;
- professionalId opcional;
- serviceId opcional.

Outputs:
- totalCount: todos os registros filtrados;
- financialCount: registros `completed` ou `paid`;
- totalRevenue;
- totalClinicRevenue;
- totalProfessionalRevenue;
- cancelledCount;
- noShowCount;
- rows;
- byService;
- byProfessional.

Regras:
- detalhamento, indicadores, agrupamentos e CSV compartilham o conjunto filtrado;
- `scheduled`, `cancelled` e `no_show` não entram nos valores financeiros;
- status selecionado aparece entre os filtros ativos;
- CSV mantém a coluna Status.

Aceite: CA-017 a CA-021.

## FEATURE-017 Mobile Appointment Form V2

Ordem:
1. paciente;
2. serviço;
3. profissional, apenas quando houver escolha real;
4. data e hora;
5. status;
6. valor e percentual;
7. observação;
8. resumo do repasse;
9. salvar.

Regras:
- serviço preenche valor e percentual;
- cálculo reage às alterações válidas;
- envio em andamento bloqueia nova submissão;
- erro permanece associado ao campo ou ao formulário e informa como tentar novamente.

Aceite: CA-022 a CA-025.

## FEATURE-018 Mobile Screen Consistency and States V2

Telas:
- login;
- dashboard;
- atendimentos;
- formulário de atendimento;
- pacientes;
- profissionais;
- serviços;
- relatórios.

Regras:
- sem tabela horizontal entre `320px` e `430px`;
- ação principal identificável por texto;
- carregando, vazio inicial, filtro sem resultado, erro e sucesso são estados distintos;
- conteúdo dinâmico crítico é anunciado a tecnologias assistivas.

Aceite: CA-026, CA-027 e CA-028.
