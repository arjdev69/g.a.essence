# G.A Essencia

Referencia da planilha atual para o modulo de Produtos.

Produto: G.A Essencia
Objetivo: usar a planilha manual como referencia de levantamento para cadastro, estoque, venda, recebimento, receita e lucro bruto, sem obrigar importacao no MVP da secao.

# 24 - Products Spreadsheet Reference

## 1. Fonte

Planilha informada pelo usuario:

```txt
Produto | Tamanho | Quantidade | Valor uni | Valor Total | Vendidos | Estoque | Pix | Cartao | R$ | Total em produtos | Recebido
```

## 1.1 Decisao de escopo

A planilha nao sera importada no MVP da secao de Produtos.

Ela serve como referencia para identificar campos, divergencias, regras de
calculo e dados pendentes. A primeira versao deve usar cadastro manual de
produtos, entrada manual de estoque e venda manual.

## 2. Interpretacao das colunas

| Coluna da planilha | Interpretacao no sistema | Observacao |
| --- | --- | --- |
| Produto | `products.name` | Nome comercial do produto. |
| Tamanho | `products.size` | Variacao do produto. Ex.: 5ml, 10ml, 210g. |
| Quantidade | entrada inicial ou quantidade comprada | Pode virar movimento inicial de entrada. |
| Valor uni | custo unitario legado | Nao preencher preco de venda automaticamente. |
| Valor Total | total informado | Deve ser recalculado pelo sistema ou marcado como legado. |
| Vendidos | quantidade vendida | Se vazio, pode ser inferido por `Quantidade - Estoque` quando ambos existirem. |
| Estoque | saldo atual | Deve virar `products.current_stock`. |
| Pix | recebido por Pix | Idealmente deve ser gravado por venda, nao no produto. |
| Cartao | recebido por cartao | Idealmente deve ser gravado por venda, nao no produto. |
| R$ | recebido em dinheiro | Idealmente deve ser gravado por venda, nao no produto. |
| Total em produtos | agregado da planilha | Deve virar resumo calculado, nao campo editavel por produto. |
| Recebido | total recebido | Deve virar soma de recebimentos das vendas. |

## 3. Modelo canonico recomendado

### Produto

- nome;
- tamanho;
- unidade;
- categoria;
- saldo atual;
- estoque minimo;
- custo medio opcional;
- preco de venda;
- preco aberto;
- ativo.

Decisao de referencia:

- `Valor uni` pode orientar o preenchimento manual de custo medio/custo unitario inicial.
- `preco de venda` deve ser preenchido manualmente ou por uma fonte futura confiavel.
- produtos cadastrados sem preco de venda revisado devem entrar com `preco aberto`.
- `Valor uni = Aberto` representa custo pendente, nao preco de venda.
- tamanhos devem ser normalizados para evitar duplicidade, por exemplo `5 ml` e `5ml`.

### Movimento inicial

Na primeira versao, o usuario cadastra o produto manualmente e registra uma
entrada inicial manual quando houver estoque existente.

Em uma importacao futura, cada linha importada deve gerar um movimento de
entrada inicial quando `Quantidade > 0`.

Campos:

- produto;
- tipo: `purchase`;
- quantidade: valor informado manualmente, ou coluna `Quantidade` se houver importacao futura;
- custo unitario: valor informado manualmente, ou valor convertido de `Valor uni`
  se houver importacao futura;
- observacao: `Entrada inicial manual` no MVP, ou `Importado da planilha` se
  houver importacao futura.

### Venda legada

Quando houver vendidos na planilha ou quando `Estoque < Quantidade`, usar a
informacao apenas como referencia de conferencia no MVP. Nao gerar receita nem
lucro automaticamente sem preco de venda confiavel.

Modo seguro:

- criar o produto com `current_stock` igual a coluna `Estoque`;
- registrar em observacao a quantidade original e a quantidade vendida/inferida;
- marcar a linha para revisao quando houver venda legada sem preco de venda;
- gerar movimento de venda legado apenas se uma importacao futura for
  priorizada e houver preco de venda confirmado.

Campos:

- produto;
- tipo: `sale`;
- quantidade vendida;
- preco unitario: valor confirmado, nao o `Valor uni` legado;
- forma de pagamento: preencher apenas se a linha tiver Pix, Cartao ou R$;
- status de recebimento: recebido quando houver valor recebido igual ao total da venda; pendente quando nao houver valor recebido.

## 4. Regras para cadastro manual e eventual importacao futura

### Quantidade

- Se `Quantidade` estiver vazia, tratar como zero e marcar pendencia.
- Se `Quantidade` for negativa, bloquear cadastro/importacao da linha.
- Se `Estoque` estiver preenchido, usar como saldo final esperado.

### Vendidos

- Se `Vendidos` estiver preenchido, usar esse valor.
- Se `Vendidos` estiver vazio e `Quantidade` e `Estoque` estiverem preenchidos, inferir:

```txt
vendidosInferido = Quantidade - Estoque
```

- Se o resultado for negativo, marcar divergencia.

### Valor unitario

- Se `Valor uni` for monetario, converter para number em reais e usar como custo unitario legado.
- Se `Valor uni` for `Aberto`, tratar o custo como pendente:

```txt
averageCost = null
pendingData = true
```

- Produto com preco aberto nao deve ser vendido sem definir preco no momento da venda.
- Produto com custo pendente nao deve ser vendido ate definir custo medio.
- `Valor uni` nao deve ser usado como preco de venda sem revisao manual.

### Valor total

- Quando `Valor uni` e `Quantidade` forem numericos, calcular:

```txt
valorTotalCalculado = Quantidade * Valor uni
```

- Se `Valor Total` informado for diferente do calculado, marcar divergencia para revisao.
- O sistema deve exibir o valor calculado, nao confiar cegamente no total informado.

### Recebimento

- Valores de Pix, Cartao e dinheiro devem ser armazenados no movimento de venda.
- Se a planilha tiver valores agregados sem produto claro, usar apenas como
  anotacao de referencia, nao como recebimento por produto.

## 5. Divergencias observadas na amostra

As linhas abaixo precisam de revisao antes de cadastro definitivo ou de uma
eventual importacao automatica:

| Produto | Tamanho | Quantidade | Valor uni | Valor Total informado | Valor esperado | Problema |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Lavanda | 5 ml | 2 | 62,00 | 186,00 | 124,00 | Total informado diverge. |
| On Guard | 2,5ml | 4 | 39,00 | 195,00 | 156,00 | Total informado diverge. |
| Balance | 5ml | 1 | 52,50 | 39,00 | 52,50 | Total informado diverge. |
| DeepBlue | 2,5ml | 1 | 108,00 | 94,50 | 108,00 | Total informado diverge. |
| Frankincense | 5ml | 1 | 202,00 | 153,00 | 202,00 | Total informado diverge. |
| Zengest | 15ml | 1 | Aberto | vazio | indeterminado | Preco/custo pendente. |

Observacao: essas divergencias podem significar desconto, preco de venda diferente de custo, erro de digitacao ou coluna com significado diferente. O sistema deve separar custo e preco para eliminar essa ambiguidade e nao deve calcular lucro legado dessas linhas automaticamente.

## 6. Produtos e variacoes observados

| Produto | Tamanho |
| --- | --- |
| Beauty Power | 210g |
| Breathe | 10m |
| Zengest | 5ml |
| Zengest | 10ml |
| Zengest | 15ml |
| Lavanda | 5 ml |
| Lavanda | 10ml |
| On Guard | 2,5ml |
| On Guard | 5ml |
| On Guard | 15ml |
| Wild Orange | 2,5ml |
| Wild Orange | 5ml |
| Wild Orange | 15ml |
| Steady | 10ml |
| Tamer | 10ml |
| Copaiba | 5ml |
| Melaleuca | 2,5ml |
| Melaleuca | 10ml |
| DeepBlue | 2,5ml |
| DeepBlue | 5ml |
| DeepBlue | 120g |
| Lemongras | 5ml |
| Lemon | 5ml |
| Balance | 2,5ml |
| Balance | 5ml |
| AromaTouch | 2,5ml |
| Frankincense | 5ml |
| Tangerina | 5ml |
| DDRPRIME | 15ml |

## 7. Decisoes de referencia fechadas

- `Valor uni` representa custo unitario legado e pode orientar o preenchimento manual de custo.
- `Valor uni = Aberto` representa custo pendente.
- `Valor Total` representa total legado informado e deve ser usado apenas para conferencia.
- `Total em produtos` representa metrica agregada da planilha e nao deve virar campo editavel por produto.
- `Recebido` deve ser tratado como valor legado agregado quando nao houver vinculo claro com produto.
- Produtos com `Estoque = 0` e `Vendidos` vazio devem ficar pendentes de revisao; nao devem virar venda, perda ou ajuste automaticamente.
- Vendas legadas nao devem gerar receita/lucro automaticamente no MVP.
- Receita/lucro so devem existir quando preco de venda e custo estiverem definidos.

## 8. Criterio de aceite do levantamento

- todos os campos relevantes da planilha estao cobertos por requisitos ou decisoes de exclusao;
- produtos podem ser cadastrados manualmente como produto + tamanho;
- linhas com preco aberto ou custo pendente estao previstas como pendencias;
- divergencias de total estao documentadas para revisao;
- estoque existente pode ser registrado manualmente por movimento de entrada;
- receita/lucro so existem quando houver venda com preco e custo confirmados;
- totais de Pix, Cartao, dinheiro e recebido nao sao inventados quando a planilha nao traz o dado por produto.
