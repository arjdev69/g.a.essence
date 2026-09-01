# G.A Essencia

Documentacao para desenvolvimento do MVP usando Spec Driven Development com apoio do Codex.

Produto: G.A Essencia
Objetivo: sistema de agendamento com calculo automatico da taxa da clinica e ganho do profissional.
Stack alvo: React + TypeScript + Vite + Tailwind + Supabase.

# 07 - UX Spec

## 1. Principio

O sistema deve ser mais simples que uma planilha.

## 2. Rotas

- `/login`
- `/dashboard`
- `/appointments`
- `/patients`
- `/professionals`
- `/services`
- `/reports`

## 3. Layout

Desktop:
- sidebar;
- header;
- conteudo em cards e tabelas.

Mobile:
- header;
- cards;
- botao de acao principal;
- evitar tabela horizontal.

## 4. Dashboard

Cards:
- faturamento do mes;
- receita da clinica;
- ganho profissional;
- atendimentos realizados.

Secoes:
- atendimentos de hoje;
- proximos atendimentos.

## 5. Agenda

Desktop:
Data | Hora | Paciente | Servico | Profissional | Valor | Clinica | Profissional | Status | Acoes

Mobile:
Card com paciente, servico, data/hora, valor e status.

Acoes secundarias por atendimento:
- editar;
- adicionar ao calendario;
- remover, quando aplicavel.

## 6. Formulario de atendimento

Ordem:
1. paciente;
2. profissional;
3. servico;
4. data;
5. hora;
6. status;
7. valor;
8. percentual;
9. observacao.

Area de calculo sempre visivel:
- valor total;
- clinica;
- profissional.

## 7. Pacientes

Lista com nome, telefone e acoes.
Detalhe com historico.

## 8. Servicos

Mostrar badge `Brinde` quando valor for 0.

## 9. Relatorios

Filtros:
- mes;
- ano;
- profissional;
- servico.

Botoes:
- exportar CSV;
- limpar filtros.

## 10. Feedback

Sucesso:
`Atendimento criado com sucesso.`

Erro:
`Nao foi possivel salvar. Tente novamente.`

Empty:
`Nenhum atendimento encontrado.`

## 11. Acessibilidade

- inputs com label;
- botoes com texto;
- foco visivel;
- contraste adequado.

## 12. Acao de Calendario

Objetivo:
- permitir que o usuario exporte o atendimento para o calendario sem sair da tela.

Desktop:
- botao secundario na coluna de acoes da tabela;
- label visivel `Adicionar ao calendario`;
- icone de calendario antes do texto;
- ordem das acoes: editar, adicionar ao calendario, remover.

Mobile:
- botao no rodape do card do atendimento;
- label visivel, nao apenas icone;
- area de toque generosa;
- se houver muitas acoes, mover para menu secundario.

Estados:
- normal;
- hover;
- foco;
- desabilitado;
- sucesso;
- erro.

## 13. UX Mobile-first V2

### 13.1 Princípios de interação

- O mobile é a referência primária; desktop é uma adaptação ampliada.
- Nenhum elemento fixo deve cobrir conteúdo ou a área de gesto do iPhone.
- A ação principal usa rótulo textual; ícones apenas apoiam o reconhecimento.
- Período, busca e status ficam visíveis; paciente, profissional e serviço ficam em `Mais filtros`.
- Cancelado, falta e agendado permanecem consultáveis, mas não parecem receita realizada.
- Resultado vazio preserva o contexto e oferece uma ação de recuperação.

### 13.2 Fluxos de usuário

#### Fluxo 1 — Navegar no celular

1. A usuária abre uma rota interna.
2. O cabeçalho mostra a marca, o título da tela e o botão Menu.
3. A usuária aciona Menu.
4. O drawer lista as seis rotas e destaca a atual.
5. A usuária escolhe uma rota.
6. O drawer fecha e a tela escolhida recebe foco lógico no início do conteúdo.

**Caminhos alternativos**
- Cancelamento: tocar fora, pressionar `Escape` ou usar Fechar encerra o drawer e devolve foco ao botão Menu.
- Conteúdo longo: a página continua rolável até o fim, sem menu inferior sobreposto.

#### Fluxo 2 — Consultar atendimentos de outro mês

1. A usuária abre Atendimentos; o mês corrente está selecionado.
2. Usa anterior/próximo ou abre o seletor de mês e ano.
3. O sistema mostra o mês escolhido como filtro ativo.
4. Lista e contagem são atualizadas.
5. A usuária combina status, busca ou filtros secundários.
6. Os chips confirmam todos os critérios aplicados.
7. A usuária abre ou edita o atendimento desejado.

**Caminhos alternativos**
- Intervalo específico: `Escolher período personalizado` exibe De/Até.
- Intervalo inválido: a consulta anterior é preservada e o erro explica como corrigir.
- Sem resultado: exibir `Nenhum atendimento encontrado` e `Limpar filtros`.

#### Fluxo 3 — Criar atendimento

1. A usuária aciona `Novo atendimento`.
2. Seleciona paciente e serviço.
3. O serviço preenche valor e percentual.
4. Informa data, hora e status.
5. Ajusta valor ou percentual somente se necessário.
6. Confere clínica e profissional no resumo de repasse.
7. Aciona `Salvar atendimento` uma vez.
8. O sistema confirma `Atendimento criado com sucesso.` e retorna ao contexto anterior atualizado.

**Caminhos alternativos**
- Campo inválido: erro aparece junto ao campo e o primeiro inválido recebe foco.
- Falha de rede: dados permanecem preenchidos e a ação `Tentar novamente` fica disponível.
- Cancelamento: retornar não salva alterações e pede confirmação somente se houver mudança.

#### Fluxo 4 — Conferir e exportar relatório por status

1. A usuária abre Relatórios no mês corrente.
2. Escolhe mês, status, profissional e/ou serviço.
3. Os chips confirmam o conjunto aplicado.
4. O resumo mostra Total no período, Financeiros, Faturamento e Cancelados/Faltas.
5. O detalhamento usa os mesmos filtros.
6. A usuária aciona `Exportar relatório`.
7. O CSV contém exatamente as linhas mostradas pelo conjunto filtrado.

**Caminhos alternativos**
- Status não financeiro: faturamento fica zero, mas a contagem e as linhas continuam visíveis.
- Sem resultado: indicadores ficam em zero e a tela oferece Limpar filtros.
- Falha de exportação: explicar que o arquivo não foi gerado e oferecer nova tentativa.

### 13.3 Inventário de telas

| Tela | Propósito | RFs | Estados exigidos |
|---|---|---|---|
| Login | Entrar sem distrações | RF-026, RF-027 | carregando, erro, sucesso |
| Visão geral | Resumir dia e mês | RF-020, RF-026, RF-027 | carregando, vazio inicial, erro, sucesso |
| Atendimentos | Localizar e operar a agenda | RF-020 a RF-023, RF-027 | carregando, vazio inicial, filtro sem resultado, erro, sucesso |
| Novo/Editar atendimento | Registrar serviço e repasse | RF-025, RF-027 | inicial, validação, enviando, erro, sucesso |
| Pacientes | Buscar, criar e abrir histórico | RF-020, RF-026, RF-027 | carregando, vazio inicial, busca sem resultado, erro, sucesso |
| Profissionais | Gerenciar equipe e percentual | RF-020, RF-026, RF-027 | carregando, vazio inicial, busca sem resultado, erro, sucesso |
| Serviços | Gerenciar serviços e brindes | RF-020, RF-026, RF-027 | carregando, vazio inicial, busca sem resultado, erro, sucesso |
| Relatórios | Conferir e exportar fechamento | RF-020, RF-024, RF-027 | carregando, filtro sem resultado, erro, sucesso |
| Drawer | Navegar entre módulos | RF-020 | fechado, aberto, rota ativa |

### 13.4 Matriz de estados

| Tela | Carregando | Vazio | Erro | Sucesso |
|---|---|---|---|---|
| Visão geral | skeleton preserva posição dos indicadores | `Nenhum atendimento hoje`; indicadores continuam visíveis | `Não foi possível carregar o resumo. Tentar novamente.` | agenda e totais do mês visíveis |
| Atendimentos | skeleton de filtros e cards; CA-028 | vazio inicial orienta criar o primeiro atendimento; filtro vazio usa mensagem específica, CA-012 | mantém filtros e oferece nova tentativa; CA-028 | cards, contagem e chips coerentes; CA-008 a CA-016 |
| Formulário | opções carregando desabilitam o campo correspondente | ausência de paciente/serviço oferece atalho de cadastro | preserva dados e oferece tentativa; CA-025 | confirmação e lista atualizada; CA-025 |
| Pacientes | skeleton de busca e cards | `Nenhum paciente cadastrado` ou `Nenhum paciente encontrado` | `Não foi possível carregar os pacientes. Tentar novamente.` | lista em cards sem overflow; CA-026 |
| Profissionais | skeleton de cards | `Nenhum profissional cadastrado` ou busca sem resultado | erro recuperável com retry | lista em cards; CA-026 |
| Serviços | skeleton de cards | `Nenhum serviço cadastrado` ou busca sem resultado | erro recuperável com retry | cards com valor, duração, percentual e Brinde; CA-026 |
| Relatórios | skeleton de filtros, indicadores e detalhes | zeros + `Nenhum atendimento encontrado para estes filtros`; CA-028 | filtros preservados e retry; CA-028 | resumo e CSV compartilham o conjunto; CA-017 a CA-021 |

### 13.5 UX writing

| Situação | Mensagem |
|---|---|
| Período inválido | `A data inicial deve ser anterior ou igual à data final.` |
| Agenda sem dados | `Nenhum atendimento cadastrado neste período. Crie um atendimento para começar.` |
| Filtro sem resultado | `Nenhum atendimento encontrado. Ajuste ou limpe os filtros.` |
| Falha da agenda | `Não foi possível carregar os atendimentos. Verifique sua conexão e tente novamente.` |
| Remoção | `Remover o atendimento de {paciente} em {data} às {hora}? Esta ação não pode ser desfeita.` |
| Sucesso ao criar | `Atendimento criado com sucesso.` |
| Sucesso ao editar | `Atendimento atualizado com sucesso.` |
| Falha ao salvar | `Não foi possível salvar o atendimento. Seus dados foram mantidos; tente novamente.` |
| Relatório vazio | `Nenhum atendimento encontrado para estes filtros.` |
| Falha ao exportar | `Não foi possível gerar o arquivo. Tente exportar novamente.` |

### 13.6 Wireframes textuais

#### Login

```txt
=== MARCA ===
G.A Essência
Agenda, cuidado e equilíbrio financeiro para seus atendimentos.

[ input: E-mail ]
[ input: Senha ]
[ Botão: Entrar ](#entrar)
```

#### Visão geral

```txt
=== HEADER ===
[ Botão: Menu ]  G.A Essência / Visão geral  [ Notificações ]

Bom dia, Geane
::: INDICADORES 2 COLUNAS :::
Faturamento | Clínica | Profissional | Atendimentos

::: CARD: Hoje, 1 de setembro :::
09:00 Mariana Costa — Massagem terapêutica — Realizado
11:30 Rafaela Almeida — Drenagem linfática — Agendado

[ Botão: Novo atendimento ](#novo)
::: CARD: Resumo financeiro :::
Faturamento / Clínica / Profissional / Cancelados e faltas
```

#### Atendimentos

```txt
=== HEADER ===
[ Botão: Menu ]  Atendimentos

[ < ] [ select: Setembro de 2026 ] [ > ]
[ Link: Escolher período personalizado ]
[ input: Buscar paciente ou serviço ]
[ select: Todos os status ]
[ Botão: Mais filtros ]
4 atendimentos                         [ Limpar filtros ]

Filtros ativos: [ Setembro/2026 ] [ Todos os status ]

::: CARD: Mariana Costa :::
01/09 às 09:00 · Massagem terapêutica        [ Realizado ]
Valor R$ 110 | Divisão R$ 33 / R$ 77
[ Botão: Editar ]                      [ Botão: Mais ações ]

[ Botão: Novo atendimento ](#novo)
```

#### Novo/Editar atendimento

```txt
=== HEADER ===
[ Voltar ]  Novo atendimento

[ select: Paciente ]
[ select: Serviço ]
[ select: Profissional — somente se houver escolha ]
[ input: Data ] [ input: Hora ]
[ select: Status ]
[ input: Valor ] [ input: Clínica (%) ]
[ textarea: Observação opcional ]

::: RESUMO DO REPASSE :::
Total R$ 110 | Clínica R$ 33 | Profissional R$ 77

[ Botão: Salvar atendimento ](#salvar)
```

#### Pacientes

```txt
=== HEADER ===
[ Botão: Menu ]  Pacientes
[ input: Buscar paciente ]
[ Botão: Novo paciente ](#novo-paciente)

::: LISTA EM CARDS :::
MC  Mariana Costa — (11) 99999-0001 — 8 atendimentos  [ Abrir ]
RA  Rafaela Almeida — (11) 99999-0002 — 5 atendimentos [ Abrir ]
```

#### Profissionais

```txt
=== HEADER ===
[ Botão: Menu ]  Profissionais
[ input: Buscar profissional ]
[ Botão: Novo profissional ](#novo-profissional)

::: LISTA EM CARDS :::
GA  Geane Araújo — Massoterapeuta — Clínica 30% [ Ativo ] [ Abrir ]
```

#### Serviços

```txt
=== HEADER ===
[ Botão: Menu ]  Serviços
[ input: Buscar serviço ]
[ Botão: Novo serviço ](#novo-servico)

::: LISTA EM CARDS :::
Massagem terapêutica — 60 min — R$ 110 — 30% [ Abrir ]
Massagem facial — 30 min — R$ 0 [ Brinde ] [ Abrir ]
```

#### Relatórios

```txt
=== HEADER ===
[ Botão: Menu ]  Relatórios

[ select: Setembro/2026 ] [ select: Todos os status ]
[ select: Todos os profissionais ]
[ select: Todos os serviços ]            [ Limpar ]
Filtros ativos: [ Setembro/2026 ] [ Todos os status ]

::: INDICADORES 2 COLUNAS :::
Total no período | Financeiros | Faturamento | Cancelados/Faltas

Clínica R$ 1.458 | Profissional R$ 3.402
::: DETALHAMENTO EM CARDS :::
[ Botão: Exportar relatório ](#exportar)
```

#### Drawer

```txt
=== DRAWER SOBRE A TELA ===
G.A Essência                              [ Fechar ]
(x) Visão geral
( ) Atendimentos
( ) Pacientes
( ) Profissionais
( ) Serviços
( ) Relatórios
```

### 13.7 Acessibilidade e edge cases

- CA-003: drawer fecha por teclado/backdrop e restaura foco.
- CA-010: chips possuem nome acessível e remoção individual por teclado e toque.
- CA-016: conteúdo essencial não depende de hover e não cria overflow em `320px`.
- CA-024: inputs usam ao menos `16px`; alvos essenciais medem ao menos `44 × 44px`.
- CA-028: carregamento usa `aria-live="polite"`; erros acionáveis usam `role="alert"`.
- RNF-009: contraste normal ≥ `4.5:1`, componentes/foco ≥ `3:1` e ordem de foco segue a ordem visual.
- Textos longos de paciente/serviço quebram em até duas linhas; dados completos permanecem disponíveis no detalhe.
- Listas extensas preservam desempenho até `1.000` registros carregados; o filtro reage em até `500ms`.
- Offline ou falha de Supabase preserva filtros e dados ainda não enviados do formulário.
- `prefers-reduced-motion` elimina animações não essenciais do drawer e transições.
