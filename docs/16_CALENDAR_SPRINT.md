# G.A Essencia

Documento de requisitos para a sprint do botao de calendario do atendimento.

Produto: G.A Essencia  
Objetivo: sistema de agendamento com calculo automatico da taxa da clinica e ganho do profissional.  
Stack alvo: React + TypeScript + Vite + Tailwind + Supabase.

# 16 - Sprint: Adicionar ao Calendario

## 1. Objetivo da Sprint

Adicionar uma acao por atendimento para exportar o compromisso para o calendario do usuario.

O foco desta sprint e permitir que o atendente ou administrador, ao visualizar um atendimento, consiga:

- adicionar o evento rapidamente ao calendario;
- evitar digitacao manual de data, hora e descricao;
- usar um formato compativel com calendarios comuns.

## 2. Escopo

### Dentro do escopo

- Botao `Adicionar ao calendario` na lista de atendimentos.
- Opcionalmente botao no modal de edicao, se houver espaco e clareza visual.
- Geracao de evento com dados do atendimento.
- Download de arquivo `.ics` como formato base.
- Opcao de abrir calendario externo, se planejada no layout.
- Feedback visual de acao concluida, quando aplicavel.

### Fora do escopo

- Sincronizacao bidirecional com Google Calendar.
- Integracao com Outlook via conta.
- Atualizacao automatica do evento quando o atendimento mudar depois do download.
- Convite por email do calendario.
- Lembretes push ou notificacoes agendadas.

## 3. Historias de Usuario

### HU-01

Como atendente, quero clicar em um botao no atendimento para gerar um evento de calendario, para nao precisar copiar data, hora e descricao manualmente.

### HU-02

Como administrador, quero que o evento tenha nome claro e contenha os dados principais do atendimento, para facilitar meu fluxo diario.

### HU-03

Como usuario mobile, quero usar a mesma acao sem depender de layout desktop, para manter o fluxo rapido no celular.

## 4. Dados Necessarios do Atendimento

O evento de calendario deve ser montado com base nos dados ja existentes do atendimento:

- data do atendimento;
- hora do atendimento;
- paciente;
- profissional;
- servico;
- valor total;
- observacoes, quando relevantes;
- duracao do servico, se disponivel;
- status do atendimento, se fizer sentido na descricao.

## 5. Regras de Negocio

- O calendario deve refletir a data e hora local do atendimento.
- O titulo do evento deve ser curto e reconhecivel.
- O evento deve representar a duracao real do servico, quando a duracao existir no cadastro.
- Se a duracao nao estiver disponivel, usar uma duracao padrao definida pela implementacao.
- O botao deve estar disponivel apenas para atendimentos validos e salvos.
- O botao nao deve aparecer como acao primaria da tela.
- A exportacao de calendario nao deve alterar dados do atendimento.

## 6. Proposta de Conteudo do Evento

### Titulo sugerido

```txt
Atendimento - [Paciente] - [Servico]
```

### Descricao sugerida

- Profissional: nome do profissional;
- Servico: nome do servico;
- Valor: valor total do atendimento;
- Status: status atual do atendimento;
- Observacoes: texto livre, se existir.

### Local

- opcional;
- se o sistema nao tiver endereco da clinica, deixar vazio;
- futuramente pode ser configurado por unidade.

## 7. Requisitos de Interface

### 7.1 Desktop

- Exibir o botao na coluna de acoes da tabela de atendimentos.
- O botao deve ter label ou tooltip claro.
- O icone deve representar calendario ou exportacao.
- A hierarquia visual deve manter `Editar` como acao principal da linha e `Adicionar ao calendario` como acao secundaria.

### 7.2 Mobile

- Exibir a mesma acao no card do atendimento.
- O botao deve ser facil de tocar.
- Evitar excesso de icoes sem legenda.
- Se faltar espaco, usar menu de acoes secundarias.

### 7.3 Estados visuais

- estado normal;
- hover;
- foco;
- desabilitado;
- feedback de sucesso;
- feedback de erro;
- loading, se a geracao envolver processamento.

## 8. Layout Recomendado

### 8.1 Acao na lista

Na tabela desktop, o botao deve ficar no conjunto de acoes ao lado de `Editar`.

Ordem sugerida:

1. Editar
2. Adicionar ao calendario
3. Remover, se existir

### 8.2 Acao no card mobile

O card do atendimento deve manter:

- nome do paciente;
- servico;
- data e hora;
- status;
- valor;
- acoes na parte inferior.

O botao de calendario pode ser:

- um botao secundario textual;
- ou um botao com icone e label curto.

### 8.3 Layout detalhado

#### Desktop

- botao secundario na mesma linha das acoes da tabela;
- icone de calendario antes do texto;
- label visivel: `Adicionar ao calendario`;
- estilo visual discreto, sem competir com `Editar`.

#### Mobile

- botao em largura total ou quase total dentro do card;
- label curto com icone, por exemplo `Calendario`;
- a acao deve ficar abaixo dos dados principais do atendimento;
- se houver muitas acoes, manter `Adicionar ao calendario` no menu secundario.

#### Posicionamento

- nao colocar a acao acima do nome do paciente;
- nao colocar a acao no topo do dashboard;
- nao usar como CTA principal da pagina;
- manter a acao perto do bloco do atendimento que ela representa.

### 8.4 Estados visuais do layout

- normal;
- hover;
- foco;
- desabilitado;
- sucesso ao gerar o arquivo;
- erro ao gerar o arquivo.

## 9. Requisitos de Usabilidade

- A acao precisa ser encontrada em ate 1 interacao visual.
- O texto deve deixar claro que a acao cria evento de calendario.
- O usuario precisa entender que o arquivo sera baixado ou que o calendario sera aberto.
- O feedback de sucesso deve ser curto e objetivo.
- Em caso de erro, a mensagem deve orientar o proximo passo.

## 10. Acessibilidade

- botao navegavel por teclado;
- foco visivel;
- aria-label descritivo;
- contraste adequado;
- texto alternativo no icone ou label visivel;
- nao depender apenas de cor para comunicar acao.

## 11. Critérios de Aceite

- Dado um atendimento salvo, quando o usuario clicar em `Adicionar ao calendario`, entao o sistema deve gerar a acao de calendario esperada.
- Dado um atendimento com data, hora, paciente e servico, o evento deve conter informacao suficiente para identificar o compromisso.
- Dado um usuario mobile, a acao deve continuar acessivel.
- Dado um atendimento editado, a acao deve refletir os dados atuais da tela.
- Dado um atendimento sem dados obrigatorios, a acao deve ser bloqueada ou deve exibir erro claro.

## 12. Dependencias para Implementacao

- definir formato de exportacao principal;
- definir se a primeira entrega sera `.ics` ou link externo;
- confirmar duracao padrao quando o servico nao tiver duracao valida;
- decidir se a acao sera exibida na lista, no modal, ou em ambos;
- decidir se o calendario alvo principal e universal ou Google Calendar primeiro.

## 13. Task Breakdown Sugerido

### TASK-1 - Definir contrato do evento

- mapear campos do atendimento;
- definir titulo, descricao, duracao e timezone;
- definir comportamento quando faltar duracao.

### TASK-2 - Criar geracao do calendario

- gerar conteudo `.ics`;
- preparar download ou abertura externa;
- validar formato de data e hora.

### TASK-3 - Adicionar acao na interface

- inserir botao na tabela desktop;
- inserir botao ou menu no card mobile;
- manter alinhamento visual com a linha de acoes.

### TASK-4 - Tratar feedback

- mensagem de sucesso;
- mensagem de erro;
- comportamento em atendimentos inexistentes ou incompletos.

### TASK-5 - Validar fluxo

- testar um atendimento criado;
- testar um atendimento editado;
- testar em desktop e mobile.

## 14. Checklist de Sprint

- [x] definir formato do evento;
- [x] definir dados exibidos no calendario;
- [x] decidir destino da acao;
- [x] ajustar layout desktop;
- [x] ajustar layout mobile;
- [x] definir feedback de sucesso e erro;
- [x] validar acessibilidade;
- [x] revisar consistencia visual com o restante do app;
- [x] escrever testes, se houver logica reaproveitavel.

## 15. Observacoes de Produto

Esta sprint deve manter o MVP simples.

Se houver duvida entre integracao nativa complexa e exportacao universal, a prioridade deve ser:

```txt
simples -> util -> compativel -> evolutivo
```

Para o MVP, a melhor base tende a ser um evento universal em `.ics`, porque reduz dependencia de terceiros e funciona em varios calendarios.

## 16. Status da implementação

Sprint concluída no Bloco 19. O MVP gera um `.ics` localmente, dispara o download no navegador, mantém a ação acessível na tabela desktop e no menu do card mobile, anuncia sucesso/erro e bloqueia atendimentos com dados obrigatórios incompletos.
