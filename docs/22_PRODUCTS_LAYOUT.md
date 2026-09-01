# G.A Essencia

Layout visual detalhado para a secao de Produtos.

Produto: G.A Essencia
Objetivo: definir a composicao visual da pagina de Produtos de acordo com o padrao do app e com as novas metricas de estoque, receita e lucro bruto.

# 22 - Products Layout

## 1. Direcao visual

O layout deve seguir a linguagem do restante do produto:

- limpo;
- funcional;
- com hierarquia evidente;
- com pouco ruido visual;
- com sensacao de ferramenta de trabalho;
- sem parecer um painel contabil pesado.

O modulo de Produtos deve parecer uma extensao natural do sistema, usando a mesma estrutura base:

- sidebar fixa no desktop;
- header com titulo e acao principal;
- area de conteudo com resumos e tabela;
- mobile com cards e navegacao vertical.

## 2. Estrutura da pagina

### Desktop

O layout principal deve seguir esta ordem:

1. header da pagina;
2. faixa de metricas de estoque e resultado;
3. resumo de recebimento;
4. barra de filtros e busca;
5. tabela de produtos;
6. modal ou painel lateral para cadastro, venda, entrada e historico.

### Mobile

O layout deve priorizar leitura rapida:

1. header compacto;
2. acao principal no topo;
3. cards de resumo em 2 colunas quando couber;
4. busca;
5. filtros essenciais;
6. cards de produto;
7. acoes em bottom sheet ou menu contextual.

## 3. Area superior

### Header da pagina

Conteudo:

- titulo: `Produtos`;
- subtitulo curto: `Estoque, vendas e recebimentos`;
- acao principal: `Novo produto`;
- acao secundaria: `Registrar venda`.

Comportamento:

- o botao principal deve ficar no lado direito no desktop;
- no mobile, a acao principal deve aparecer em largura total quando necessario;
- o subtitulo nao deve competir com o titulo.

### Faixa de metricas

Cards sugeridos:

- `Produtos ativos`;
- `Estoque baixo`;
- `Valor em estoque`;
- `Receita`;
- `Lucro bruto`;
- `Recebido`.

Cada card deve conter:

- label curto;
- numero ou moeda em destaque;
- legenda curta;
- indicador visual discreto.

## 4. Resumo de recebimento

Logo abaixo dos cards, exibir um resumo horizontal ou grid:

```txt
Pix | Cartao | Dinheiro | Total recebido
```

Regras:

- no desktop, uma linha compacta;
- no mobile, duas colunas;
- nao competir visualmente com os cards principais;
- valores devem usar formato BRL.

## 5. Bloco de filtros

Elementos:

- busca por produto ou tamanho;
- select de categoria;
- select de status;
- select de estoque baixo;
- select de dados pendentes;
- select de pagamento pendente (fiado);
- periodo inicial;
- periodo final;
- botao `Limpar`.

Layout:

- desktop em linha com quebra controlada;
- mobile em pilha ou painel recolhivel;
- filtros de periodo devem ficar proximos por afinidade.

## 6. Lista principal

### Desktop

A lista deve usar tabela com densidade moderada.

Colunas sugeridas:

```txt
Produto | Tam. | Saldo | Min. | Custo | Preco | Valor estoque | Vendidos | Receita | Recebido | Lucro | Status | Acoes
```

Regras de exibicao:

- `Produto` pode ter nome, tamanho e categoria juntos se a tela ficar estreita;
- `Saldo` deve ser o valor mais proeminente da linha;
- `Preco` deve mostrar `Aberto` quando nao houver preco definido;
- `Receita`, `Recebido` e `Lucro` devem respeitar o periodo filtrado;
- `Status` deve usar badges curtas;
- acoes devem ficar agrupadas no final;
- se houver muitas acoes, usar menu de tres pontos.

### Mobile

A tabela deve ser substituida por cards.

Cada card deve mostrar:

- imagem/thumbnail, quando existir;
- nome do produto;
- tamanho;
- categoria;
- saldo atual;
- estoque minimo;
- preco de venda;
- valor em estoque;
- receita, recebido e lucro do periodo;
- badges de status e pendencias;
- menu de acoes.

Estrutura visual do card:

- topo com nome, tamanho e badge;
- corpo com saldo e preco;
- linha secundaria com receita/recebido/lucro;
- rodape com acoes.

## 7. Destaque de estoque e resultado

### Saldo atual

Estado visual:

- saldo normal: texto forte;
- estoque baixo: badge amber;
- estoque zerado: badge red;
- produto inativo: opacidade reduzida e badge neutra.

### Preco aberto

Regras:

- badge `Preco aberto`;
- impedir venda rapida sem preencher preco;
- mostrar como pendencia em filtros.

### Lucro bruto

Regras:

- lucro positivo em verde discreto;
- lucro zero em neutro;
- lucro negativo em red;
- nao misturar lucro bruto com receita da clinica dos atendimentos.

## 8. Area de acoes

### Desktop

Acoes por item:

- editar;
- vender;
- entrada;
- uso interno;
- perda;
- ajustar;
- historico;
- inativar.

Padrao:

- `Vender` deve ser a acao primaria contextual;
- `Entrada` pode ficar visivel quando houver estoque baixo;
- demais acoes podem ir para menu.

### Mobile

Ordem recomendada:

1. vender;
2. entrada;
3. editar;
4. historico;
5. ajustar;
6. uso interno;
7. perda;
8. inativar.

## 9. Formulario de produto

### Desktop

O formulario deve ser apresentado em modal medio ou painel lateral.

Layout sugerido:

- grupo `Identificacao`: nome, tamanho, categoria, codigo;
- grupo `Estoque`: unidade, estoque minimo;
- grupo `Valores`: custo medio, preco de venda, preco aberto;
- grupo `Observacoes`: notas e imagem opcional.

Comportamento:

- labels sempre acima dos campos;
- campos monetarios com prefixo visual `R$`;
- campos numericos com apoio textual;
- CTA fixo no rodape do modal/painel;
- cancelar claramente visivel.

### Mobile

Preferencia por bottom sheet alto ou tela dedicada.

Comportamento:

- scroll vertical natural;
- resumo curto no final;
- botao de salvar sempre visivel.

## 10. Formulario de venda

Esse formulario precisa ser mais rapido que o de cadastro.

Campos:

- produto;
- quantidade;
- preco unitario;
- forma de pagamento;
- status de recebimento;
- valor recebido;
- data operacional;
- observacao.

Painel de resumo:

- saldo atual;
- saldo depois;
- receita;
- custo;
- lucro bruto;
- recebido.

Comportamento visual:

- Pix com accent emerald;
- cartao com accent blue;
- dinheiro com accent stone;
- pendente com accent amber;
- erro de estoque insuficiente em red.

## 11. Formulario de movimentacao

Campos:

- produto;
- tipo: entrada, uso interno, perda ou ajuste;
- quantidade para entrada, uso interno e perda;
- alteracao de estoque assinada para ajuste;
- custo unitario quando entrada;
- data operacional;
- observacao.

Painel de resumo:

- saldo atual;
- saldo depois;
- valor em estoque estimado.

## 12. Historico

Desktop:

```txt
Data | Tipo | Qtd. | Saldo | Preco | Receita | Recebido | Lucro | Obs.
```

Mobile:

- cards por movimento;
- data e tipo no topo;
- quantidade e saldo em destaque;
- valores financeiros apenas quando existirem.

## 13. Estados visuais

### Loading

- skeleton para cards, filtros, recebimento e tabela.

### Empty state

Quando nao houver produtos:

- texto curto;
- botao `Novo produto`.

### Sem resultado

Quando filtros nao retornarem dados:

- mensagem clara;
- botao para limpar filtros.

### Erro

- mensagem curta e objetiva;
- acao para tentar novamente.

### Dados pendentes

Quando houver preco aberto ou custo ausente:

- badge na linha;
- filtro dedicado;
- mensagem objetiva no formulario.

## 14. Cores e feedback

Usar a base visual atual do app:

- fundo claro;
- cards brancos;
- bordas sutis;
- destaque emerald/teal como cor principal;
- amber para alerta;
- red para criticidade;
- blue para informacao;
- stone/zinc para estados neutros.

Regras:

- manter contraste suficiente;
- evitar saturacao excessiva;
- evitar criar uma tela com visual de planilha pesada;
- valores financeiros devem ser legiveis, mas nao dominar o fluxo de estoque.

## 15. Espacamento e densidade

O modulo deve ser compacto, mas legivel.

Recomendacoes:

- grid principal com respiro consistente;
- cards com padding padrao do app;
- linhas de tabela sem altura excessiva;
- uso de badge curta para nao quebrar layout;
- colunas monetarias alinhadas de forma consistente.

## 16. Fluxo visual principal

```txt
Produtos -> Ver resumo -> Filtrar -> Vender produto -> Conferir saldo/receita/lucro -> Ver historico
```

## 17. Resultado esperado

Ao final, a tela de Produtos deve permitir:

- consultar estoque sem esforco;
- identificar urgencia de reposicao;
- cadastrar e ajustar itens com clareza;
- registrar venda com forma de pagamento;
- acompanhar receita, recebido e lucro bruto;
- operar bem no desktop e no celular;
- manter o mesmo nivel de simplicidade do restante do G.A Essencia.
