# G.A Essência

Documentação para desenvolvimento do MVP usando Spec Driven Development com apoio do Codex.

Produto: G.A Essência
Objetivo: sistema de agendamento com cálculo automático da taxa da clínica e ganho do profissional.
Stack alvo: React + TypeScript + Vite + Tailwind + Supabase.

# 02 — Requirements

## 1. Glossário

- Atendimento: serviço prestado a um paciente.
- Clínica: parte que recebe comissão.
- Profissional: pessoa que realiza atendimento.
- Serviço: tipo de atendimento.
- Comissão: percentual da clínica.
- Brinde: serviço de valor zero.
- Status financeiro: status que entra no relatório.

## 2. Perfis

No MVP existe um usuário autenticado administrador. Profissionais são entidades cadastradas, não usuários com login.

## 3. Requisitos funcionais

### RF-001 Login
Permitir login com e-mail e senha.

### RF-002 Logout
Permitir encerrar sessão.

### RF-003 Rotas protegidas
Usuário sem sessão não acessa rotas internas.

### RF-004 Cadastro de pacientes
Campos: nome, telefone, data de nascimento e observações.

### RF-005 Listagem de pacientes
Listar e buscar pacientes por nome.

### RF-006 Edição de pacientes
Permitir editar dados.

### RF-007 Inativação de pacientes
Paciente com histórico não deve ser apagado fisicamente.

### RF-008 Cadastro de profissionais
Campos: nome, telefone, especialidade, chave PIX, percentual padrão e ativo.

### RF-009 Cadastro de serviços
Campos: nome, valor padrão, duração, percentual da clínica e ativo.

### RF-010 Criar atendimento
Campos: paciente, profissional, serviço, data, hora, descrição, observação, valor, percentual e status.

### RF-011 Cálculo automático
Ao selecionar serviço, preencher valor e percentual e calcular clínica/profissional.

### RF-012 Edição de atendimento
Permitir alterar dados, status, valor e percentual.

### RF-013 Status
Status permitidos: scheduled, completed, cancelled, no_show, paid.

### RF-014 Filtros
Filtrar atendimentos por data, paciente, profissional, serviço e status.

### RF-015 Dashboard
Exibir totais mensais e próximos atendimentos.

### RF-016 Relatório mensal
Exibir total faturado, clínica, profissional, quantidade, por serviço e por profissional.

### RF-017 Exportação CSV
Exportar relatório em CSV com separador `;`.

### RF-018 Histórico do paciente
Exibir atendimentos anteriores do paciente.

### RF-019 Brindes
Permitir serviço com valor zero.

## 4. Requisitos não funcionais

- RNF-001: layout responsivo.
- RNF-002: telas carregam em até 2 segundos para uso comum.
- RNF-003: dados isolados por usuário.
- RNF-004: criação de atendimento simples e rápida.
- RNF-005: código modular e tipado.
- RNF-006: funções de cálculo com testes unitários.
- RNF-007: arquitetura preparada para multi-clínica futura.

## 5. Regras de negócio

- RN-001: percentual padrão é 30%.
- RN-002: cada serviço pode ter percentual próprio.
- RN-003: atendimento salva percentual usado no momento.
- RN-004: atendimento salva valores calculados.
- RN-005: brinde gera clínica 0 e profissional 0.
- RN-006: cancelled não entra no financeiro.
- RN-007: no_show não entra no financeiro.
- RN-008: completed e paid entram no financeiro.
- RN-009: histórico deve ser preservado.

## 6. Critérios de aceite

- R$ 110 com 30% = clínica R$ 33 e profissional R$ 77.
- R$ 160 com 30% = clínica R$ 48 e profissional R$ 112.
- R$ 0 = clínica R$ 0 e profissional R$ 0.
- Cancelado não entra no relatório.
- Realizado entra no relatório.
- Pago entra no relatório.

## 7. Requisitos da UX Mobile-first V2

### RF-020 — Navegação mobile por menu lateral

Em viewport inferior ao breakpoint desktop, o sistema deve substituir a navegação inferior fixa por um menu lateral acionado pelo cabeçalho.

**Critérios de aceite**

- CA-001: em viewport de `320px` a `1023px`, nenhuma navegação fixa é renderizada sobre o rodapé do conteúdo.
- CA-002: o botão `Menu` abre um drawer contendo Visão geral, Atendimentos, Pacientes, Profissionais, Serviços e Relatórios.
- CA-003: o drawer fecha ao selecionar uma rota, tocar fora, pressionar `Escape` ou acionar `Fechar`, devolvendo o foco ao botão que o abriu.
- CA-004: o drawer identifica visual e programaticamente a rota ativa, enquanto o cabeçalho mostra o título correspondente.

### RF-021 — Filtro de período dos atendimentos

A agenda deve permitir consulta por mês e ano e, opcionalmente, por intervalo personalizado.

**Critérios de aceite**

- CA-005: ao abrir Atendimentos sem período persistido, o sistema seleciona o mês corrente e lista somente datas desse mês.
- CA-006: os controles de mês anterior, próximo mês e seleção direta consultam o intervalo inclusivo entre o primeiro e o último dia do mês escolhido, inclusive na virada de ano.
- CA-007: o período personalizado exige data inicial menor ou igual à final; quando inválido, exibe `A data inicial deve ser anterior ou igual à data final.` e mantém a consulta anterior.
- CA-008: uma alteração válida de período atualiza lista, contagem e filtro ativo sem recarregar a página inteira.

### RF-022 — Filtros combinados e filtros ativos

A agenda deve combinar período, busca, status, paciente, profissional e serviço pela regra lógica `E`.

**Critérios de aceite**

- CA-009: cada atendimento exibido satisfaz simultaneamente todos os filtros preenchidos.
- CA-010: período e filtros não padrão aparecem como chips com rótulo legível e remoção individual acessível.
- CA-011: `Limpar filtros` restaura mês corrente, todos os status, todos os pacientes, profissionais e serviços, além de limpar a busca.
- CA-012: quando a combinação não retorna itens, a tela mostra `Nenhum atendimento encontrado` e a ação `Limpar filtros`, sem confundir o estado com falha de carregamento.

### RF-023 — Cards e ações de atendimento no celular

Atendimentos devem ser apresentados como cards mobile, sem tabela horizontal.

**Critérios de aceite**

- CA-013: cada card mostra paciente, serviço, data, hora, profissional, status, valor e divisão clínica/profissional; cancelados e faltas indicam que não foram contabilizados.
- CA-014: `Editar` fica visível no card; `Adicionar ao calendário` e `Remover` ficam no menu `Mais ações`, ambos com rótulos textuais acessíveis.
- CA-015: `Remover` exige confirmação com paciente e data do atendimento e, após a operação, mostra sucesso ou erro com próxima ação possível.
- CA-016: cards, textos, badges e ações cabem em `320px` sem rolagem horizontal, sobreposição ou conteúdo essencial dependente de hover.

### RF-024 — Relatório filtrado por status

O relatório deve aplicar o status ao detalhamento, aos indicadores e ao arquivo exportado.

**Critérios de aceite**

- CA-017: o filtro oferece `Todos os status`, `Agendado`, `Realizado`, `Pago`, `Cancelado` e `Faltou` usando os mesmos valores de `AppointmentStatus`.
- CA-018: período, status, profissional e serviço determinam um único conjunto filtrado usado por detalhamento, contagens e agrupamentos.
- CA-019: o resumo distingue `Total no período` de `Atendimentos financeiros`; somente `completed` e `paid` compõem faturamento, clínica e profissional.
- CA-020: o CSV contém exatamente os registros resultantes dos filtros visíveis e registra o status de cada linha.
- CA-021: quando o status selecionado é `scheduled`, `cancelled` ou `no_show`, os indicadores financeiros são zero e a contagem do status permanece visível.

### RF-025 — Formulário mobile de atendimento

O formulário deve priorizar os campos mais frequentes e manter o cálculo compreensível durante o preenchimento.

**Critérios de aceite**

- CA-022: a ordem mobile é paciente, serviço, profissional quando houver mais de uma opção, data e hora, status, valor, percentual e observação.
- CA-023: selecionar um serviço preenche valor e percentual, e qualquer alteração válida recalcula imediatamente clínica e profissional.
- CA-024: inputs editáveis usam fonte mínima de `16px` no iPhone e controles essenciais possuem área de toque mínima de `44 × 44px`.
- CA-025: durante o envio, `Salvar atendimento` fica desabilitado, um segundo envio é impedido e o resultado mostra mensagem de sucesso ou erro acionável.

### RF-026 — Consistência das telas mobile

Login, dashboard, pacientes, profissionais e serviços devem compartilhar cabeçalho, espaçamento, cards, busca, ação principal e padrões de feedback.

**Critérios de aceite**

- CA-026: login, pacientes, profissionais e serviços funcionam de `320px` a `430px` sem tabela ou rolagem horizontal e preservam busca, criação e abertura de item.
- CA-027: o dashboard permite identificar agenda de hoje, faturamento, clínica, profissional e ação `Novo atendimento` em uma única rolagem inicial de `390 × 844`, sem ação fixa cobrindo conteúdo.

### RF-027 — Estados e feedback acessíveis

As telas alteradas devem diferenciar carregamento, ausência de dados, filtro sem resultado, erro e sucesso.

**Critérios de aceite**

- CA-028: cada tela afetada possui estados verificáveis de carregamento, vazio inicial, filtro sem resultado, erro recuperável e sucesso; mensagens dinâmicas são anunciadas por `aria-live` ou `role="alert"`, conforme a urgência.

## 8. Requisitos não funcionais da UX Mobile-first V2

- RNF-008: a interface deve operar entre `320px` e `430px` sem rolagem horizontal, respeitar safe areas do iPhone e fornecer alvos essenciais de ao menos `44 × 44px` — coberto por T-066, T-067, T-069, T-070, T-074, T-075 e T-076.
- RNF-009: a interface deve atender WCAG 2.2 AA no escopo alterado: contraste de texto normal ≥ `4.5:1`, foco visível, ordem lógica, labels programáticos e feedback anunciado — coberto por T-067, T-069, T-070, T-073, T-074, T-075 e T-076.
- RNF-010: após os dados estarem carregados, mudanças de filtros locais devem atualizar lista e indicadores em até `500ms` para até `1.000` atendimentos — coberto por T-062, T-064, T-065, T-073 e T-076.

## 9. Matriz de rastreabilidade da UX Mobile-first V2

| RF/RNF | CAs | Tasks | Prioridade | Verificação |
|---|---|---|---|---|
| RF-020 | CA-001 a CA-004 | T-066, T-067 | must | testes de layout, navegação e teclado |
| RF-021 | CA-005 a CA-008 | T-062, T-065, T-068 | must | testes de intervalo e interface |
| RF-022 | CA-009 a CA-012 | T-065, T-068, T-070 | must | testes de combinação, chips e vazio |
| RF-023 | CA-013 a CA-016 | T-069, T-070 | must | testes de card, ações e responsividade |
| RF-024 | CA-017 a CA-021 | T-063, T-064, T-065, T-071, T-072, T-073 | must | testes de domínio, UI e CSV |
| RF-025 | CA-022 a CA-025 | T-074 | must | testes do formulário e submissão |
| RF-026 | CA-026, CA-027 | T-075 | should | inspeção responsiva e testes de tela |
| RF-027 | CA-028 | T-070, T-073, T-076 | must | matriz de estados e acessibilidade |
| RNF-008 | CA-001, CA-016, CA-024, CA-026, CA-027 | T-066, T-067, T-069, T-070, T-074, T-075, T-076 | must | inspeção em 320px, 390px e 430px |
| RNF-009 | CA-003, CA-010, CA-014, CA-024, CA-028 | T-067, T-069, T-070, T-073, T-074, T-075, T-076 | must | axe, teclado e inspeção de contraste |
| RNF-010 | CA-008, CA-018, CA-020 | T-062, T-064, T-065, T-073, T-076 | should | teste com 1.000 registros |
