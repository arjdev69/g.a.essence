# G.A Essencia

Layout visual detalhado para a secao de Produtos.

Produto: G.A Essencia
Objetivo: definir a composicao visual da pagina de Produtos de acordo com o padrao do app.

# 22 - Products Layout

## 1. Direcao visual

O layout deve seguir a linguagem do restante do produto:

- limpo;
- funcional;
- com hierarquia evidente;
- com pouco ruido visual;
- com sensacao de ferramenta de trabalho, nao painel promocional.

O modulo de Produtos deve parecer uma extensao natural do sistema, usando a mesma estrutura base:

- sidebar fixa no desktop;
- header com titulo e acao principal;
- area de conteudo em cards e tabela;
- mobile com cards e navegacao vertical.

## 2. Estrutura da pagina

### Desktop

O layout principal deve seguir esta ordem:

1. header da pagina;
2. faixa de metricas/resumo;
3. barra de filtros e busca;
4. tabela de produtos;
5. painel lateral ou modal para cadastro/movimentacao.

### Mobile

O layout deve priorizar leitura rapida:

1. header compacto;
2. acao principal no topo;
3. filtros em linha curta ou drawer;
4. cards de produto;
5. CTA contextual no rodape ou sticky button.

## 3. Area superior

### Header da pagina

Conteudo:

- titulo: `Produtos`;
- subtitulo curto, opcional, como `Controle de estoque e movimentacoes`;
- acao principal: `Novo produto`;
- acao secundario opcional: `Registrar movimentacao`.

Se houver imagem cadastrada no produto, ela deve aparecer como thumbnail pequena na lista e como preview no formulario ou detalhe.

Comportamento:

- o botao principal deve ficar sempre no lado direito no desktop;
- no mobile, a acao principal deve aparecer em formato de botao cheio;
- o subtitulo nao deve competir com o titulo.

### Barra de contexto

Logo abaixo do header, exibir um bloco discreto com:

- total de produtos ativos;
- itens com estoque baixo;
- estoque zerado;
- movimentacoes recentes.

Esse bloco funciona como leitura rapida, nao como dashboard completo.

## 4. Cards de resumo

Formato:

- 4 cards em grid no desktop;
- 2 colunas no tablet;
- 1 ou 2 cards por linha no mobile.

Cada card deve conter:

- label curto;
- numero em destaque;
- legenda de apoio;
- pequeno indicador de cor.

Sugestao de leitura visual:

- `Produtos ativos` com teal;
- `Estoque baixo` com amber;
- `Zerados` com red;
- `Movimentacoes` com blue.

## 5. Bloco de filtros

O bloco de filtros deve ficar imediatamente acima da lista.

Elementos:

- campo de busca por nome ou codigo;
- select de categoria;
- select de status;
- toggle ou select para estoque baixo;
- botao `Limpar filtros`.

Layout:

- desktop em linha com quebra controlada;
- mobile em pilha ou colapso por drawer;
- botoes de acao alinhados a direita no desktop;
- no mobile, filtros menos importantes podem ficar dentro de um painel recolhivel.

## 6. Lista principal

### Desktop

A lista deve usar tabela com densidade moderada.

Colunas sugeridas:

```txt
Produto | Categoria | Unidade | Saldo | Minimo | Status | Acoes
```

Regras de exibicao:

- `Saldo` deve ser o valor mais proeminente da linha;
- `Minimo` deve aparecer como referencia menor;
- `Status` deve usar badge;
- acoes devem ficar agrupadas no final.
- quando existir imagem, o nome do produto pode vir acompanhado de thumbnail circular ou quadrada pequena.

### Mobile

A tabela deve ser substituida por cards.

Cada card deve mostrar:

- imagem/thumbnail, quando existir;
- nome do produto;
- categoria;
- unidade;
- saldo atual;
- estoque minimo;
- badge de status;
- alerta de estoque baixo, quando aplicavel;
- menu de acoes.

Estrutura visual do card:

- topo com thumbnail opcional, nome e badge;
- corpo com metadados em duas colunas;
- rodape com acoes.

## 7. Destaque de estoque

### Saldo atual

O saldo deve ter maior destaque do que os demais metadados.

Estado visual:

- saldo normal: texto forte;
- estoque baixo: texto ou badge em amber;
- estoque zerado: badge em red;
- produto inativo: opacidade reduzida ou badge neutra.

### Alertas

O alerta de estoque baixo deve ser evidente, mas nao agressivo.

Regras:

- aparecer dentro da linha ou card;
- usar badge curta, como `Estoque baixo`;
- nao bloquear a leitura dos demais dados;
- permitir acao rapida para registrar entrada.

## 8. Area de acoes

### Desktop

Acoes por item:

- editar;
- inativar;
- registrar entrada;
- registrar saida;
- ajustar estoque;
- ver historico.

Padrao:

- usar menu de tres pontos se a lista ficar poluida;
- manter a acao mais comum acessivel com menor friccao;
- `Registrar entrada` pode virar acao primaria contextual quando houver estoque baixo.

### Mobile

Acoes devem aparecer em menu curto ou bottom sheet.

Ordem recomendada:

1. editar;
2. registrar entrada;
3. registrar saida;
4. ajustar estoque;
5. ver historico;
6. inativar.

## 9. Formulario de produto

### Desktop

O formulario deve ser apresentado em modal medio ou painel lateral.

Layout sugerido:

- coluna principal com campos;
- coluna lateral com resumo visual e dicas.

Comportamento:

- labels sempre acima dos campos;
- campos numericos com apoio textual;
- CTA fixo no rodape do modal/painel;
- opcao de cancelar claramente visivel.

### Mobile

Preferencia por tela dedicada ou bottom sheet alto.

Comportamento:

- scroll vertical natural;
- resumo curto no final;
- botao de salvar sempre visivel.

## 10. Formulario de movimentacao

Esse formulario precisa ser mais rapido que o de cadastro.

Campos:

- imagem do produto;
- produto;
- tipo de movimentacao;
- quantidade;
- observacao.

Painel de resumo:

- saldo atual;
- saldo estimado depois da operacao;
- indicacao de entrada/saida/ajuste.

Comportamento visual:

- `entrada` com accent verde suave;
- `saida` com accent amber ou red suave, sem excesso;
- `ajuste` com azul discreto.

## 11. Hierarquia de informacao

Ordem de importancia visual:

1. nome do produto;
2. saldo atual;
3. alerta de estoque;
4. categoria e unidade;
5. minimo e status;
6. acoes.

O usuario deve conseguir responder rapidamente:

- o que e o produto;
- quanto tem em estoque;
- se precisa repor;
- qual a proxima acao.

## 12. Estados visuais

### Loading

- skeleton para cards, filtros e tabela;
- evitar telas vazias enquanto carrega.

### Empty state

Quando nao houver produtos:

- ilustração ou bloco discreto;
- texto curto;
- botao `Novo produto`.

### Sem resultado

Quando os filtros nao retornarem dados:

- mensagem clara;
- botao para limpar filtros.

### Erro

- mensagem curta e objetiva;
- acao para tentar novamente.

## 13. Cores e feedback

Usar a base visual atual do app:

- fundo claro;
- cards brancos;
- bordas sutis;
- destaque teal como cor principal;
- amber para alerta;
- red para criticidade;
- blue para informacao.

Regras:

- nao transformar a tela em painel contábil pesado;
- manter contraste suficiente;
- evitar saturacao excessiva em listas longas.

## 14. Espaçamento e densidade

O modulo deve ser compacto, mas legivel.

Recomendacoes:

- grid principal com respiro consistente;
- cards com padding padrao do app;
- linhas de tabela sem altura excessiva;
- uso de badge curta para nao quebrar layout.

## 15. Fluxo visual principal

```txt
Produtos -> Ver resumo -> Filtrar -> Abrir produto -> Registrar movimento -> Conferir saldo
```

## 16. Resultado esperado

Ao final, a tela de Produtos deve permitir:

- consultar estoque sem esforço;
- identificar urgencia de reposicao;
- cadastrar e ajustar itens com clareza;
- operar bem no desktop e no celular;
- manter o mesmo nivel de simplicidade do restante do G.A Essencia.
