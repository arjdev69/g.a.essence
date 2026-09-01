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

## 7. Testes da UX Mobile-first V2

### 7.1 Navegação mobile — RF-020

- CA-001: em `320px`, `390px` e `430px`, não existe menu fixo inferior nem conteúdo coberto.
- CA-002/CA-004: abrir o drawer mostra as seis rotas, a atual marcada e o título correto.
- CA-003: fechar por rota, backdrop, botão e `Escape` restaura foco ao botão Menu.
- Executar navegação completa também no breakpoint desktop para confirmar a sidebar.

### 7.2 Período e filtros da agenda — RF-021 e RF-022

- CA-005: abrir sem preferência seleciona o mês corrente.
- CA-006: testar janeiro/dezembro, fevereiro bissexto e mês sem registros.
- CA-007: início posterior ao fim mostra a mensagem especificada e não altera resultados.
- CA-008: trocar mês atualiza lista, contagem e chip sem reload completo.
- CA-009: combinar mês + status + profissional + serviço + paciente + busca retorna apenas a interseção.
- CA-010/CA-011: remover chip e limpar tudo atualizam controles e resultados.
- CA-012: combinação vazia renderiza o estado de filtro sem resultado, não o estado de erro.

### 7.3 Cards e ações — RF-023

- CA-013: verificar todos os campos em status financeiro e não financeiro.
- CA-014: Editar visível; calendário e remover no menu Mais ações com rótulos acessíveis.
- CA-015: remoção exige confirmação contextual; cancelar não remove; confirmar mostra feedback.
- CA-016: testar `320px` com nomes longos, zoom de texto e toque; não deve existir overflow horizontal.

### 7.4 Relatório e CSV — RF-024

Dataset:
- 2 `completed` no total de R$ 220;
- 1 `paid` de R$ 160;
- 1 `scheduled` de R$ 110;
- 1 `cancelled` de R$ 110;
- 1 `no_show` de R$ 100.

Verificações:
- CA-017: todas as opções de status mapeiam para `AppointmentStatus`.
- CA-018: filtros aplicados produzem as mesmas linhas no detalhe e nos agrupamentos.
- CA-019: Todos mostra total 6, financeiros 3 e faturamento R$ 380.
- CA-020: para cada status, IDs das linhas visíveis e IDs exportados no CSV são iguais.
- CA-021: Agendado, Cancelado e Faltou mostram faturamento, clínica e profissional iguais a zero.

### 7.5 Formulário — RF-025

- CA-022: verificar ordem de foco e ocultação do seletor de profissional quando houver apenas uma opção ativa.
- CA-023: serviço preenche valor/percentual; edição recalcula os três valores.
- CA-024: inspeção em iPhone Safari confirma fonte de input ≥ 16px e alvos ≥ 44px.
- CA-025: clique duplo dispara uma mutation; sucesso e falha anunciam feedback e preservam contexto adequado.

### 7.6 Estados, responsividade e acessibilidade — RF-026 e RF-027

- CA-026: login, pacientes, profissionais e serviços em `320px`, `390px` e `430px` sem overflow.
- CA-027: em `390 × 844`, dashboard apresenta os indicadores prioritários, agenda de hoje e Novo atendimento sem sobreposição.
- CA-028: forçar carregando, vazio inicial, filtro vazio, falha e sucesso em cada tela afetada.
- Executar auditoria axe sem violações críticas ou sérias nas telas alteradas.
- Navegar apenas por teclado e confirmar foco visível e ordem lógica.
- Medir contraste: texto normal ≥ `4.5:1`; texto grande e componentes ≥ `3:1`.

### 7.7 Performance — RNF-010

- Com fixture de `1.000` atendimentos já carregados, alterar mês/status e atualizar lista/indicadores em até `500ms` no ambiente de teste definido pelo projeto.

### 7.8 Exportação para calendário — sprint 16/17

- O contrato gera título, descrição, duração padrão de 60 minutos, timestamps locais e nome `atendimento-YYYY-MM-DD-HH-mm.ics`.
- O clique na agenda chama o download local com MIME `text/calendar;charset=utf-8` e anuncia o arquivo baixado.
- A ação permanece acessível na tabela desktop e no menu do card mobile, com alvo mínimo de 44 px, foco visível e `aria-label` descritivo.
- Dados obrigatórios ausentes bloqueiam a ação; falhas do download usam alerta e permitem nova tentativa.
- Executar testes unitários do domínio, helper de download e fluxo da agenda; auditar axe no estado completo sem violações críticas ou sérias.
