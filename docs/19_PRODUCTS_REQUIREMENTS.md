# G.A Essencia

Documento de requisitos para a secao de Produtos.

Produto: G.A Essencia
Objetivo: controlar cadastro, saldo, vendas, recebimentos, receita e lucro bruto de produtos.

# 19 - Products Requirements

## 1. Glossario

- Produto: item cadastrado para controle de estoque.
- Variacao: diferenca de tamanho, volume ou apresentacao do produto, como `Lavanda 5ml` e `Lavanda 10ml`.
- Movimento de estoque: registro que altera ou audita o saldo de um produto.
- Entrada: movimento que aumenta estoque.
- Venda: movimento que reduz estoque e gera receita.
- Uso interno: movimento que reduz estoque sem gerar receita.
- Perda: movimento que reduz estoque sem gerar receita.
- Ajuste: movimento para corrigir saldo por inventario ou conferencia.
- Saldo atual: quantidade disponivel no momento.
- Estoque minimo: limite usado para alerta visual.
- Preco de venda: valor cobrado do cliente por unidade.
- Custo unitario: custo informado para uma entrada especifica.
- Custo medio: custo medio atual do produto; pode ficar pendente quando o custo ainda nao foi informado.
- Valor em estoque: saldo atual multiplicado pelo custo medio quando o custo estiver definido.
- Receita bruta: total vendido antes de deducoes.
- Lucro bruto: receita bruta menos custo dos produtos vendidos.
- Forma de pagamento: Pix, cartao ou dinheiro.
- Recebido: valor efetivamente recebido.
- Inativacao: produto fica indisponivel para novas operacoes, mas historico permanece.

## 2. Perfis

No MVP da secao continua existindo um unico usuario autenticado administrador.
Esse usuario e responsavel por criar produtos, registrar entradas, registrar vendas, corrigir estoque e consultar resultados.

## 3. Fonte atual de requisitos

A planilha atual possui as colunas:

```txt
Produto | Tamanho | Quantidade | Valor uni | Valor Total | Vendidos | Estoque | Pix | Cartao | R$ | Total em produtos | Recebido
```

A planilha e uma referencia de levantamento, nao uma fonte obrigatoria de
importacao para o MVP da secao.

Mapeamento inicial:

- `Produto` -> nome do produto;
- `Tamanho` -> variacao/tamanho;
- `Quantidade` -> quantidade inicial ou quantidade comprada;
- `Valor uni` -> custo unitario legado para estoque inicial; quando estiver `Aberto`, o custo fica pendente;
- `Valor Total` -> total calculado ou informado;
- `Vendidos` -> quantidade vendida;
- `Estoque` -> saldo atual;
- `Pix` -> valor recebido por Pix;
- `Cartao` -> valor recebido por cartao;
- `R$` -> valor recebido em dinheiro;
- `Total em produtos` -> indicador agregado;
- `Recebido` -> total recebido.

Regra de levantamento:

- o sistema nao deve depender de uma unica coluna para representar custo e preco de venda;
- a implementacao deve possuir campos separados para custo e preco;
- `Valor uni` nao deve preencher automaticamente o preco de venda;
- produtos cadastrados sem preco definido devem ficar com preco aberto;
- produtos cadastrados sem custo definido devem ficar com custo pendente;
- dados legados inconsistentes devem ser revisados antes de cadastro definitivo
  ou de eventual importacao futura.

## 4. Requisitos funcionais

### RF-101 Cadastro de produto

Permitir cadastrar produto com nome, tamanho, unidade, categoria, custo medio opcional, preco de venda ou preco aberto, estoque minimo e observacao.
Opcionalmente, permitir imagem do produto para identificacao visual.

O cadastro do produto nao deve alterar saldo. Todo estoque inicial deve ser
registrado depois como movimento de entrada, para manter historico auditavel.

### RF-102 Listagem de produtos

Exibir produtos ativos e inativos com busca e filtros.

### RF-103 Edicao de produto

Permitir alterar dados cadastrais do produto sem apagar historico.

### RF-104 Inativacao de produto

Permitir inativar produto sem remover historico.

### RF-105 Saldo atual

Exibir quantidade atual disponivel por produto e variacao.

### RF-106 Valor em estoque

Exibir valor em estoque por produto:

```txt
valorEmEstoque = saldoAtual * custoMedio
```

Quando o custo medio estiver pendente, o valor em estoque deve aparecer como
pendente e nao como zero.

### RF-107 Movimentacao de entrada

Permitir registrar aumento de estoque com quantidade, custo unitario opcional,
data operacional e observacao.

### RF-108 Movimentacao de venda

Permitir registrar venda com quantidade, preco unitario maior que zero, forma
de pagamento, status de recebimento, valor recebido e data operacional.

Venda exige preco e custo definidos para manter receita e lucro bruto confiaveis.

### RF-109 Movimentacao de uso interno

Permitir registrar baixa de estoque por uso interno sem gerar receita.

### RF-110 Movimentacao de perda

Permitir registrar baixa por perda, quebra, vencimento ou descarte sem gerar receita.

### RF-111 Movimentacao de ajuste

Permitir corrigir saldo por inventario ou conferencia.

### RF-112 Historico de movimentacoes

Exibir movimentos por produto em ordem decrescente.

### RF-113 Alerta de estoque baixo

Sinalizar quando saldo estiver igual ou abaixo do estoque minimo.

### RF-114 Receita por produto

Exibir receita bruta de vendas por produto e periodo.

### RF-115 Lucro bruto por produto

Exibir lucro bruto por produto e periodo.

### RF-116 Recebimento por forma de pagamento

Exibir totais recebidos por Pix, cartao e dinheiro.

No MVP da secao, cada venda deve possuir apenas uma forma de pagamento.
Pagamento dividido em mais de uma forma fica fora do escopo inicial.

### RF-117 Produtos com dados pendentes

Sinalizar produtos com dados pendentes quando:

- `salePriceOpen = true`;
- `salePrice = null`;
- `averageCost = null`.

### RF-118 Filtros

Permitir filtrar por nome, tamanho, categoria, status, estoque baixo, dados pendentes e periodo de movimentacao.

### RF-119 Navegacao de modulo

Disponibilizar a secao de Produtos no menu principal.

### RF-120 Exportacao CSV

Permitir exportar a listagem ou resumo de produtos em CSV com separador `;`.

## 5. Requisitos nao funcionais

- RNF-101: layout responsivo.
- RNF-102: listagem enxuta no celular.
- RNF-103: cadastro e venda com poucos cliques.
- RNF-104: dados isolados por usuario.
- RNF-105: historico persistente.
- RNF-106: codigo tipado e modular.
- RNF-107: telas nao acessam Supabase diretamente.
- RNF-108: formularios devem usar React Hook Form + Zod.
- RNF-109: estado remoto deve usar TanStack Query.
- RNF-110: testes para saldo, receita, lucro, recebimento e validacoes.
- RNF-111: valores monetarios devem usar duas casas decimais.
- RNF-112: quantidades devem aceitar apenas inteiros no primeiro corte; decimal fica para evolucao se houver produto fracionado. UI, validacao e RPC devem aplicar a mesma regra.

## 6. Regras de negocio

- RN-101: produto pertence a um unico usuario.
- RN-102: produto inativado nao pode receber novos movimentos.
- RN-103: produto e tamanho devem identificar uma variacao de estoque.
- RN-104: nome e tamanho devem ser normalizados para evitar duplicidade logica, como `5 ml` e `5ml`.
- RN-105: produto nasce com saldo zero; estoque inicial deve entrar por movimento de entrada.
- RN-106: saldo atual nao pode ficar negativo em venda, uso interno ou perda.
- RN-107: entrada aumenta saldo.
- RN-108: venda reduz saldo e gera receita.
- RN-109: uso interno reduz saldo e nao gera receita.
- RN-110: perda reduz saldo e nao gera receita.
- RN-111: ajuste pode aumentar ou reduzir saldo, mas nao gera receita.
- RN-112: ajuste deve usar `stockDelta` assinado; `quantity` persistida deve ser `abs(stockDelta)`.
- RN-113: venda exige preco unitario maior que zero.
- RN-114: produto com preco aberto nao deve ser vendido sem definir preco unitario maior que zero no momento da venda.
- RN-115: produto com custo medio pendente nao deve ser vendido ate o custo ser definido.
- RN-116: custo medio deve ser nulo ou maior ou igual a zero.
- RN-117: estoque minimo deve ser maior ou igual a zero.
- RN-118: receita bruta de venda e quantidade vendida multiplicada pelo preco unitario.
- RN-119: custo da venda usa o custo medio congelado no momento da venda.
- RN-120: lucro bruto e receita bruta menos custo da venda.
- RN-121: valor recebido nao pode ser maior que receita da venda.
- RN-122: se recebimento for `recebido`, valor recebido deve ser igual ao total da venda.
- RN-123: se recebimento for `pendente`, valor recebido deve ser zero.
- RN-124: se recebimento for `parcial`, valor recebido deve ser maior que zero e menor que total da venda.
- RN-125: Pix, cartao e dinheiro sao formas de pagamento simples; taxas nao entram no MVP.
- RN-126: cada venda possui uma unica forma de pagamento no MVP da secao.
- RN-127: pagamento dividido em mais de uma forma nao deve ser implementado no MVP da secao.
- RN-128: estoque minimo aciona destaque visual.
- RN-129: historico de movimentos nao deve ser apagado.
- RN-130: cadastro inicial deve permitir unidade de medida simples.
- RN-131: resumos por periodo devem usar a data operacional do movimento.

## 7. Campos base sugeridos

### Produto

- nome;
- tamanho;
- imagem opcional;
- codigo interno opcional;
- categoria opcional;
- unidade de medida;
- saldo atual;
- estoque minimo;
- custo medio opcional;
- preco de venda;
- preco aberto;
- observacao opcional;
- ativo.

### Movimento

- produto;
- tipo;
- quantidade;
- data operacional;
- data e hora de criacao;
- custo unitario no movimento;
- preco unitario no movimento;
- receita bruta;
- custo total;
- lucro bruto;
- forma de pagamento;
- status de recebimento;
- valor recebido;
- observacao opcional;
- usuario responsavel.

## 8. Criterios de aceite

- cadastrar e listar produtos com nome e tamanho;
- registrar entrada e atualizar saldo;
- registrar venda e reduzir saldo;
- impedir venda com quantidade maior que o saldo disponivel;
- calcular receita bruta da venda;
- calcular lucro bruto da venda;
- registrar recebimento por Pix, cartao ou dinheiro;
- visualizar saldo atualizado apos movimento;
- exibir valor em estoque;
- exibir alerta visual quando saldo estiver baixo;
- sinalizar produto com preco aberto;
- manter historico de movimentos por produto;
- inativar produto sem perder informacoes;
- exportar resumo em CSV.
