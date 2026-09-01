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

## 8. Design técnico da UX Mobile-first V2

### 8.1 Abordagem

A evolução mantém React, TanStack Query e os repositories existentes. O estado de filtros permanece local às páginas, mas passa a ser representado por tipos de domínio explícitos. A interface mobile usa drawer no shell, cards para listas densas e controles nativos. O mesmo objeto de filtro alimenta consulta, resumo e exportação para impedir divergência entre o que a usuária vê e o CSV.

### 8.2 Componentes afetados

| Componente | Responsabilidade após a evolução |
|---|---|
| `AppLayout` | Cabeçalho mobile, botão de menu, drawer acessível, safe areas e conteúdo sem navegação inferior fixa |
| `MainMenu` | Uma fonte de itens para sidebar desktop e drawer mobile |
| `AppointmentsPage` | Período mensal/personalizado, filtros combinados, chips, contagem, cards e estados |
| `AppointmentForm` | Ordem mobile, preenchimento automático, cálculo ao vivo e proteção contra envio duplicado |
| `ReportsPage` | Status, chips, totais gerais/financeiros e exportação coerente |
| `appointmentRepository` | Consulta inclusiva por `dateFrom` e `dateTo`, combinável com filtros existentes |
| `createMonthlySummary` | Conjunto filtrado único e distinção entre total do período e linhas financeiras |
| `createMonthlyReportCsv` | Exportação das mesmas linhas filtradas mostradas na tela |

### 8.3 Contratos de filtro

```ts
export type AppointmentFilters = {
  dateFrom?: string
  dateTo?: string
  patientId?: string
  professionalId?: string
  serviceId?: string
  status?: AppointmentStatus
  search?: string
}

export type MonthlyReportInput = {
  month: number
  year: number
  professionalId?: string
  serviceId?: string
  status?: AppointmentStatus
}
```

`dateFrom` e `dateTo` usam `YYYY-MM-DD` e são inclusivos. O mês selecionado é convertido para o primeiro e o último dia no domínio/utilitário testável, incluindo dezembro → janeiro e anos bissextos.

### 8.4 Fluxo de dados dos filtros

1. A tela cria um objeto normalizado de filtros.
2. A query key inclui todos os campos normalizados.
3. O repository aplica intervalo e filtros estruturados.
4. Busca textual complementar é aplicada de forma normalizada sobre os dados retornados, enquanto não houver busca dedicada no banco.
5. A página deriva contagem, chips e estado vazio do mesmo objeto.
6. Relatório e CSV recebem o mesmo `MonthlyReportInput` e o mesmo conjunto de linhas.

### 8.5 Navegação mobile

- O breakpoint desktop mantém a sidebar.
- Abaixo dele, o cabeçalho contém o botão `Menu` com `aria-controls` e `aria-expanded`.
- O drawer usa `role="dialog"`, `aria-modal="true"`, foco inicial no botão Fechar e restauração de foco ao encerrar.
- Enquanto aberto, o conteúdo atrás não recebe interação nem rolagem.
- `Escape`, toque no backdrop e escolha de rota fecham o drawer.
- Padding do cabeçalho considera `env(safe-area-inset-top)`; não há elemento fixo no rodapé.

### 8.6 Estados, cache e concorrência

- Alterações rápidas de filtro produzem query keys distintas; somente a resposta da chave atual alimenta a tela.
- A submissão do atendimento usa os estados já fornecidos pelo React Hook Form/mutation para impedir clique duplicado.
- Erro de consulta mantém os filtros selecionados e oferece nova tentativa.
- Resultado vazio não apaga filtros nem é tratado como falha.
- Exclusão continua exigindo confirmação e invalida as queries de agenda, dashboard e relatório.

### 8.7 Alternativas consideradas

| Opção | Prós | Contras | Decisão |
|---|---|---|---|
| Menu inferior fixo | acesso direto às rotas | conflita com gesto/scroll e seis itens não cabem bem | rejeitada no mobile |
| Drawer pelo cabeçalho | libera o rodapé e acomoda todas as rotas | exige uma interação para navegar | escolhida |
| Filtro apenas por data | implementação simples | inviável para conferência mensal | rejeitada |
| Filtro de mês + personalizado | cobre rotina e exceções | exige normalização de intervalo | escolhida |
| Filtros somente no cliente | resposta instantânea em poucos dados | não escala e pode carregar registros demais | permitido apenas para busca textual no MVP; intervalo/status ficam no repository |

### 8.8 Riscos e mitigação

- **Divergência entre relatório e CSV** — compartilhar input e linhas filtradas; testes de igualdade.
- **Regressão desktop** — manter variantes desktop e executar testes nos dois breakpoints.
- **Foco escapar do drawer** — teste de teclado e gerenciamento explícito de foco.
- **Consultas antigas sobrescreverem filtros novos** — query key completa e renderização vinculada ao estado atual.
- **Muitos filtros ocuparem a tela** — manter período, busca e status visíveis; filtros secundários em seção expansível.
