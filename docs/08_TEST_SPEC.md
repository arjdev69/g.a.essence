# G.A Essência

Documentação para desenvolvimento do MVP usando Spec Driven Development com apoio do Codex.

Produto: G.A Essência
Objetivo: sistema de agendamento com cálculo automático da taxa da clínica e ganho do profissional.
Stack alvo: React + TypeScript + Vite + Tailwind + Supabase.

# 08 — Test Spec

## 1. Testes unitários obrigatórios

### calculateAppointmentSplit

Caso 1:
- value: 110
- percentage: 30
- expected: clinic 33, professional 77

Caso 2:
- value: 160
- percentage: 30
- expected: clinic 48, professional 112

Caso 3:
- value: 0
- percentage: 30
- expected: 0 e 0

Caso 4:
- value: 100
- percentage: 0
- expected: 0 e 100

Caso 5:
- value: 100
- percentage: 100
- expected: 100 e 0

## 2. isFinancialStatus

- completed: true
- paid: true
- scheduled: false
- cancelled: false
- no_show: false

## 3. formatCurrencyBRL

Input: 110  
Expected: `R$ 110,00`

## 4. Validações

Serviço:
- nome vazio falha;
- valor negativo falha;
- duração zero falha;
- percentual < 0 falha;
- percentual > 100 falha.

Atendimento:
- sem paciente falha;
- sem profissional falha;
- sem serviço falha;
- sem data falha;
- sem hora falha.

## 5. Relatório

Cenário:
- 110 completed
- 160 paid
- 110 cancelled
- 100 no_show
- 0 completed

Expected:
- totalRevenue: 270
- totalClinicRevenue: 81
- totalProfessionalRevenue: 189
- appointmentCount: 3

## 6. CSV

Verificar:
- arquivo gerado;
- separador `;`;
- cabeçalho;
- linhas;
- nome correto.
