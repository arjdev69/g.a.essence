# G.A Essencia

Plano tecnico de implementacao para a funcionalidade `Adicionar ao calendario`.

Produto: G.A Essencia  
Objetivo: sistema de agendamento com calculo automatico da taxa da clinica e ganho do profissional.  
Stack alvo: React + TypeScript + Vite + Tailwind + Supabase.

# 17 - Plano de Implementacao: Adicionar ao Calendario

## 1. Decisao tecnica da sprint

Para o MVP, a primeira entrega deve ser:

```txt
gerar e baixar um arquivo .ics por atendimento
```

Motivos:

- funciona sem backend adicional;
- e compativel com Google Calendar, Outlook e calendarios nativos;
- reduz o escopo de integracao;
- atende o caso de uso principal com baixo risco.

## 2. Escopo tecnico

### Inclui

- utilitario para montar evento de calendario a partir de um atendimento;
- geracao de conteudo ICS;
- botao de acao na lista de atendimentos;
- botao ou acao secundaria no card mobile;
- download do arquivo gerado;
- teste unitario da montagem do evento.

### Nao inclui

- integracao via API com Google Calendar;
- integracao via API com Outlook;
- sincronizacao bidirecional;
- envio por email;
- backend de agenda;
- notificacoes push.

## 3. Fluxo funcional

```txt
usuario abre Atendimentos
-> visualiza um atendimento salvo
-> clica em Adicionar ao calendario
-> app monta o evento
-> app gera o arquivo .ics
-> navegador baixa o arquivo
-> usuario importa no calendario desejado
```

## 4. Dados de entrada

O gerador deve receber os dados do atendimento ja carregados na tela:

- id;
- patientName;
- professionalName;
- serviceName;
- appointmentDate;
- appointmentTime;
- value;
- notes;
- status;
- durationMinutes, se disponivel a partir do servico.

Se a duracao nao estiver disponivel, usar um padrao da implementacao.

## 5. Contrato do evento

### Titulo

```txt
Atendimento - {patientName} - {serviceName}
```

### Descricao

- profissional;
- servico;
- valor;
- status;
- observacoes, se existirem.

### Data e hora

- inicio em timezone local do usuario;
- fim calculado com base na duracao;
- formato compativel com ICS.

### Nome do arquivo

```txt
atendimento-YYYY-MM-DD-HH-mm.ics
```

## 6. Arquitetura recomendada

### 6.1 Camada de dominio ou utilitario puro

Criar uma funcao pura para:

- montar inicio/fim;
- formatar data no padrao ICS;
- escapar caracteres do texto;
- montar o payload final do calendario.

### 6.2 Camada de interface

O botao deve disparar a geracao do arquivo a partir do atendimento corrente.

### 6.3 Camada de browser

Usar a API nativa para:

- criar blob;
- criar URL temporaria;
- iniciar download;
- revogar URL depois do uso.

## 7. Arquivos provaveis

### Novos arquivos

- `src/domain/calendar/createAppointmentIcs.ts`
- `src/domain/calendar/calendar.types.ts`
- `src/domain/calendar/index.ts`
- `src/tests/calendar.test.ts`

### Arquivos alterados

- `src/features/appointments/AppointmentsPage.tsx`
- `src/features/appointments/AppointmentForm.tsx`, se a acao entrar no modal
- `src/domain/appointments/appointment.types.ts`, se for necessario expor duracao
- `src/domain/services/service.types.ts`, se a duracao precisar ser reutilizada na montagem
- `docs/06_API_CONTRACTS.md`, se o contrato do atendimento ganhar novos campos
- `docs/07_UX_SPEC.md`, para incluir a nova acao visual
- `docs/08_TEST_SPEC.md`, para incluir o teste do gerador de calendario

## 8. Sequencia de implementacao

### TASK-1 - Definir o contrato interno

- decidir qual objeto representa o evento;
- definir campos obrigatorios e opcionais;
- definir duracao padrao;
- definir como tratar timezone.

### TASK-2 - Criar o gerador ICS

- montar texto ICS valido;
- escapar quebras de linha e caracteres especiais;
- gerar timestamp de inicio e fim;
- gerar nome do arquivo.

### TASK-3 - Criar acao de download

- criar helper para download no browser;
- disparar download com nome previsivel;
- evitar vazamento de objeto URL.

### TASK-4 - Inserir no layout desktop

- adicionar botao na coluna de acoes;
- manter prioridade visual em relacao a editar;
- garantir label claro.

### TASK-5 - Inserir no layout mobile

- adicionar acao no card;
- manter toque facil;
- evitar excesso de icones sem texto.

### TASK-6 - Cobrir com teste

- testar nome do arquivo;
- testar titulo do evento;
- testar inicio e fim;
- testar escape de caracteres especiais.

### TASK-7 - Validar visualmente

- conferir tabela desktop;
- conferir card mobile;
- conferir comportamento em um atendimento real.

## 9. Regras de implementacao

- nao criar backend novo para a primeira entrega;
- nao alterar o fluxo de salvar atendimento;
- nao quebrar responsividade atual;
- nao transformar a acao em acao primaria;
- manter a logica de calendario isolada em funcao pura.

## 10. Critérios de aceite tecnico

- dado um atendimento salvo, o clique gera um arquivo `.ics`;
- dado um atendimento com paciente e servico, o titulo do evento e legivel;
- dado um atendimento com observacoes, a descricao inclui o conteudo;
- dado um nome com caracteres especiais, o ICS nao quebra;
- dado desktop e mobile, a acao continua acessivel;
- dado um arquivo baixado, o nome segue o padrao definido.

## 11. Dependencias futuras

Se a equipe quiser evoluir depois do MVP, a base criada aqui deve facilitar:

- abertura direta no Google Calendar;
- abertura direta no Outlook;
- envio por email;
- lembrete automatico;
- sincronizacao de eventos.

## 12. Resultado esperado da sprint

Ao final desta sprint, o usuario consegue clicar em `Adicionar ao calendario` e baixar um arquivo `.ics` consistente com o atendimento atual, sem depender de backend adicional.

## 13. Layout proposto

### 13.1 Desktop

- manter a acao no bloco `Acoes` da linha da tabela;
- usar botao secundario com icone de calendario;
- texto exibido: `Adicionar ao calendario`;
- priorizar a ordem: `Editar`, `Adicionar ao calendario`, `Remover`;
- manter o botao com largura ajustada ao conteudo, sem ocupar a linha inteira.

### 13.2 Mobile

- inserir a acao na area inferior do card do atendimento;
- usar botao com label visivel, nao apenas icone;
- deixar o botao com boa area de toque;
- se o card ficar pesado, agrupar a acao em um menu secundario;
- manter a acao abaixo do status e do valor para preservar a leitura do card.

### 13.3 Estados de interface

- normal;
- hover;
- foco;
- loading, se houver geracao intermediaria;
- sucesso, com feedback curto;
- erro, com mensagem clara.

### 13.4 Criterios visuais

- o botao nao deve competir com o botao de editar;
- a acao precisa ser reconhecivel em menos de um segundo de leitura;
- o layout deve continuar limpo no desktop e compacto no mobile;
- o card mobile deve continuar escaneavel sem quebrar a hierarquia das informacoes.

## 14. Status da implementação

Implementação concluída no Bloco 19. A entrega usa download local de `.ics` no navegador, sem depender de upload remoto, com contrato de evento, feedback de sucesso/erro, proteção para dados incompletos e testes direcionados de domínio e interface.
