# G.A Essência

Documentação para orientar o layout no Figma e a futura implementação visual do MVP.

# 12 — Layout / Figma Blueprint

## 1. Direção do Produto

G.A Essência deve parecer uma ferramenta de trabalho simples, rápida e confiável para profissionais de bem-estar e pequenas clínicas.

Marca base:

```txt
Geane Araújo Massoterapeuta
```

Tom da marca:

- natural;
- calmo;
- acolhedor;
- organizado;
- profissional;
- ligado a cuidado, paz e relaxamento.

Princípio principal:

```txt
Mais simples que uma planilha.
```

Prioridades de UX:

- criar atendimento em menos de 30 segundos;
- deixar cálculo financeiro sempre visível;
- facilitar fechamento mensal;
- funcionar bem no celular;
- evitar excesso visual, marketing ou telas decorativas.

## 2. Estrutura Recomendada do Arquivo Figma

Páginas:

1. `00 Cover`
2. `01 Foundations`
3. `02 Components`
4. `03 Desktop Screens`
5. `04 Mobile Screens`
6. `05 Prototype Flow`

Frames base:

- Desktop: `1440 x 1024`
- Tablet opcional: `834 x 1194`
- Mobile: `390 x 844`

## 3. Identidade Visual

O produto deve comunicar organização, saúde financeira e cuidado profissional.

Paleta sugerida:

- Background app: `#F7F8FA`
- Surface/card: `#FFFFFF`
- Border: `#E5E7EB`
- Text strong: `#17202A`
- Text muted: `#667085`
- Primary teal: `#0F766E`
- Primary hover: `#115E59`
- Info blue: `#2563EB`
- Success green: `#16A34A`
- Warning amber: `#D97706`
- Danger red: `#DC2626`
- Soft teal background: `#ECFDF5`
- Soft blue background: `#EFF6FF`
- Soft amber background: `#FFFBEB`
- Soft red background: `#FEF2F2`

Tipografia:

- Fonte: `Inter`
- H1 desktop: 28px / 36px / semibold
- H2: 22px / 30px / semibold
- Section title: 16px / 24px / semibold
- Body: 14px / 20px / regular
- Small: 12px / 16px / regular

Raio e espaçamento:

- Cards: 8px
- Inputs/botões: 8px
- Sidebar width: 260px
- Header height: 64px
- Grid spacing desktop: 24px
- Internal spacing: 16px ou 20px
- Mobile page padding: 16px

## 4. Navegação

Desktop:

- sidebar fixa à esquerda;
- header superior com título da página, mês atual e ação principal;
- conteúdo em grid, cards e tabelas.

Mobile:

- header compacto;
- navegação inferior ou menu drawer;
- botão principal visível;
- listas em cards, evitando tabela horizontal.

Itens de menu:

- Dashboard
- Atendimentos
- Pacientes
- Profissionais
- Serviços
- Relatórios

## 5. Componentes Base

Criar no Figma como componentes reutilizáveis:

- Button: primary, secondary, ghost, danger, disabled
- Icon button: editar, excluir/inativar, exportar, filtros
- Text input
- Select
- Date input
- Time input
- Textarea
- Search field
- Status badge
- Metric card
- Table
- Mobile list card
- Empty state
- Loading skeleton
- Modal desktop
- Bottom sheet mobile
- Calculation summary panel
- Filter bar

Badges de status:

- Agendado: azul suave
- Realizado: verde suave
- Pago: teal suave
- Cancelado: vermelho suave
- Faltou: âmbar suave
- Brinde: cinza ou lilás bem discreto

## 6. Telas MVP

### 6.1 Login

Objetivo: entrada simples, sem distração.

Elementos:

- nome `G.A Essência`;
- frase curta: `Agenda, cuidado e equilíbrio financeiro para seus atendimentos.`;
- e-mail;
- senha;
- botão `Entrar`;
- mensagem de erro abaixo do formulário.

### 6.2 Dashboard

Objetivo: resumo do mês e próximos atendimentos.

Cards:

- Faturamento do mês
- Receita da clínica
- Ganho profissional
- Atendimentos realizados
- Cancelamentos
- Brindes

Seções:

- Atendimentos de hoje
- Próximos atendimentos

Ação principal:

- `Novo atendimento`

### 6.3 Atendimentos

Desktop:

Tabela com colunas:

```txt
Data | Hora | Paciente | Serviço | Profissional | Valor | Clínica | Profissional | Status | Ações
```

Topo:

- busca;
- filtros por data, paciente, profissional, serviço e status;
- botão `Novo atendimento`.

Mobile:

Cards com:

- paciente;
- serviço;
- profissional;
- data e hora;
- valor total;
- divisão clínica/profissional;
- badge de status.

### 6.4 Formulário de Atendimento

Desktop:

- modal largo ou página dedicada;
- formulário à esquerda;
- painel de cálculo fixo à direita.

Mobile:

- bottom sheet ou tela em fluxo vertical;
- painel de cálculo sempre visível no final da tela ou em bloco sticky.

Ordem dos campos:

1. paciente;
2. profissional;
3. serviço;
4. data;
5. hora;
6. status;
7. valor;
8. percentual;
9. observação.

Painel de cálculo:

- Valor total
- Taxa da clínica
- Ganho profissional

Exemplos para preview no design:

- `R$ 110,00` com `30%` = clínica `R$ 33,00`, profissional `R$ 77,00`
- `R$ 160,00` com `30%` = clínica `R$ 48,00`, profissional `R$ 112,00`
- `R$ 0,00` = clínica `R$ 0,00`, profissional `R$ 0,00`

### 6.5 Pacientes

Lista:

- nome;
- telefone;
- status;
- ações.

Detalhe:

- dados do paciente;
- histórico de atendimentos em ordem decrescente;
- observações.

Mobile:

- busca no topo;
- cards por paciente;
- acesso rápido ao histórico.

### 6.6 Profissionais

Lista:

- nome;
- especialidade;
- telefone;
- PIX;
- percentual padrão;
- status;
- ações.

Formulário:

- nome;
- telefone;
- especialidade;
- chave PIX;
- percentual padrão;
- ativo.

### 6.7 Serviços

Lista:

- nome;
- valor padrão;
- duração;
- percentual da clínica;
- status;
- badge `Brinde` quando valor for zero;
- ações.

Seed visual recomendado:

- Massagem Terapêutica — R$ 110,00 — 60 min — 30%
- SPA dos pés — R$ 110,00 — 60 min — 30%
- Drenagem Linfática — R$ 160,00 — 60 min — 30%
- Brinde massagem facial — R$ 0,00 — 30 min — 0%

### 6.8 Relatórios

Filtros:

- mês;
- ano;
- profissional;
- serviço.

Ações:

- `Exportar CSV`;
- `Limpar filtros`.

Resumo:

- Total faturado
- Receita clínica
- Ganho profissional
- Quantidade de atendimentos
- Cancelamentos
- Faltas
- Brindes

Breakdowns:

- por serviço;
- por profissional;
- tabela detalhada para exportação.

## 7. Protótipo Recomendado

Fluxo principal:

```txt
Login -> Dashboard -> Novo atendimento -> Salvar -> Atendimentos -> Relatórios -> Exportar CSV
```

Fluxos secundários:

```txt
Dashboard -> Pacientes -> Detalhe do paciente -> Histórico
Dashboard -> Serviços -> Criar serviço brinde
Atendimentos -> Filtros -> Empty state
```

## 8. Estados Obrigatórios

Criar variações no Figma para:

- loading;
- erro;
- vazio;
- sem resultados após filtro;
- botão desabilitado;
- campo com erro;
- status ativo/inativo;
- atendimento agendado, realizado, pago, cancelado e faltou.

Mensagens:

- Sucesso: `Atendimento criado com sucesso.`
- Erro: `Não foi possível salvar. Tente novamente.`
- Vazio: `Nenhum atendimento encontrado.`

## 9. Critérios de Qualidade Visual

- O dashboard deve ser escaneável em menos de 5 segundos.
- O formulário de atendimento deve mostrar claramente quem recebe quanto.
- A tela mobile deve evitar tabelas horizontais.
- A ação principal de cada tela deve estar sempre óbvia.
- Componentes devem usar dimensões estáveis para evitar quebra quando valores mudarem.
- O visual deve ser limpo, mas não genérico: usar teal como cor de confiança e saúde financeira, com azul/verde/âmbar/vermelho para estados.

## 10. Checklist Para Montar no Figma

- Criar foundations: cores, texto, grid, spacing.
- Criar componentes base.
- Criar tela desktop de dashboard.
- Criar tela desktop de atendimentos.
- Criar modal de novo atendimento.
- Criar telas de pacientes, profissionais e serviços.
- Criar tela de relatórios.
- Criar equivalentes mobile das telas críticas: dashboard, atendimentos e formulário.
- Conectar protótipo do fluxo principal.
- Revisar contraste, labels e foco visível.

## 11. Blueprint Mobile-first V2 aprovado

Esta seção substitui, para implementação mobile, qualquer orientação anterior que permita navegação inferior fixa. A sidebar desktop permanece válida.

### 11.1 Frame e safe areas

- Frame de referência: `390 × 844`.
- Validar também em `320px` e `430px` de largura.
- Conteúdo: padding lateral de `16px`.
- Cabeçalho: altura visual mínima de `64px`, acrescida de `env(safe-area-inset-top)` na implementação.
- Rodapé: não possui navegação fixa; conteúdo rola livremente até o fim.
- Inputs editáveis: texto mínimo de `16px` no mobile.
- Alvos essenciais: mínimo de `44 × 44px`.

### 11.2 Navegação mobile

Cabeçalho:

```txt
[ Menu 44×44 ]  G.A Essência / Título da tela  [ Ação contextual 44×44 ]
```

Drawer:

- ocupa aproximadamente `82%` da largura;
- superfície opaca sobre backdrop semitransparente;
- botão Fechar no topo;
- marca e subtítulo;
- Visão geral, Atendimentos, Pacientes, Profissionais, Serviços e Relatórios;
- item ativo com fundo teal suave e texto teal;
- sem atalhos duplicados no rodapé.

### 11.3 Atendimentos mobile

Ordem vertical:

1. título e descrição curta;
2. seletor de mês entre ações anterior/próximo;
3. link para período personalizado;
4. busca;
5. status;
6. `Mais filtros` expansível com paciente, profissional e serviço;
7. contagem e Limpar filtros;
8. chips ativos;
9. cards de atendimento;
10. Novo atendimento.

Card:

```txt
Paciente                              [ Status ]
Data e hora · Serviço
────────────────────────────────────────────
Valor                                Divisão
R$ 110,00                       R$ 33 / R$ 77

[ Editar ]                       [ Mais ações ]
```

Menu Mais ações:

- Adicionar ao calendário;
- Remover atendimento, em vermelho;
- confirmação contextual antes da remoção.

### 11.4 Relatórios mobile

Filtros visíveis:

- mês/ano;
- status;
- profissional;
- serviço;
- limpar.

Resumo em grade `2 × 2`:

- Total no período;
- Financeiros;
- Faturamento;
- Cancelados · faltas.

Abaixo da grade:

- linha compacta Clínica / Profissional;
- detalhamento em cards;
- Exportar relatório em largura total.

Quando o status não for financeiro, Faturamento, Clínica e Profissional exibem `R$ 0,00`, enquanto a contagem e as linhas continuam visíveis.

### 11.5 Formulário mobile

Ordem:

1. paciente;
2. serviço;
3. profissional somente quando houver escolha;
4. data + hora em duas colunas quando couber;
5. status;
6. valor + percentual;
7. observação;
8. painel de repasse;
9. Salvar atendimento.

O painel de repasse usa fundo teal suave e mostra Total, Clínica e Profissional sem esconder campos ou criar elemento fixo sobre o conteúdo.

### 11.6 Outras telas mobile

- **Login**: marca, frase, e-mail, senha e Entrar; sem navegação interna.
- **Visão geral**: quatro métricas em `2 × 2`, agenda de hoje, Novo atendimento e resumo financeiro.
- **Pacientes**: busca, Novo paciente e cards com iniciais, nome, telefone e quantidade de atendimentos.
- **Profissionais**: busca, Novo profissional e cards com especialidade, percentual e status.
- **Serviços**: busca, Novo serviço e cards com duração, valor, percentual e badge Brinde.

### 11.7 Componentes e variantes adicionais

- `MobileHeader`: default, com ação, drawer aberto.
- `NavigationDrawer`: fechado, aberto; item default/ativo.
- `MonthNavigator`: default, primeiro/último mês disponível, desabilitado.
- `ActiveFilterChip`: default, removível, foco.
- `ExpandableFilters`: fechado, aberto.
- `AppointmentCard`: scheduled, completed, paid, cancelled, no_show; menu aberto.
- `ReportMetric`: padrão, zero, carregando.
- `FeedbackState`: vazio inicial, filtro vazio, erro recuperável, sucesso.
- `ConfirmationDialog`: remoção normal, enviando, erro.

### 11.8 Protótipo de validação

Conectar:

```txt
Visão geral → Menu → Atendimentos → Agosto/2026 → Status Pago → Editar
Visão geral → Novo atendimento → Salvar → confirmação → Atendimentos
Atendimentos → Mais ações → Remover → cancelar confirmação
Relatórios → Status Cancelado → conferir R$ 0 → Exportar
```

### 11.9 Checklist visual V2

- nenhum menu inferior fixo em frame mobile;
- nenhuma rolagem horizontal em `320px`;
- todos os alvos essenciais com `44px`;
- inputs com texto de `16px`;
- status combina cor, texto e contraste;
- filtro ativo sempre identificável;
- vazio inicial e filtro sem resultado visualmente distintos;
- foco visível em drawer, chips, ações e formulário;
- tela de relatório diferencia quantidade total de quantidade financeira;
- conteúdo de nomes longos não sobrepõe status ou ações.
