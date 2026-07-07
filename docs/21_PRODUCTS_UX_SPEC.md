# G.A Essencia

Especificacao de UX para a secao de Produtos.

Produto: G.A Essencia
Objetivo: desenhar telas simples para cadastrar produtos, consultar estoque, registrar vendas e acompanhar receita/lucro bruto.

# 21 - Products UX Spec

## 1. Principio

O modulo de Produtos precisa ser tao simples quanto o resto do app, com foco em operacao diaria:

- saber o que tem em estoque;
- vender produto rapidamente;
- conferir o que foi recebido;
- enxergar receita e lucro bruto sem planilha.

## 2. Rota

- `/products`

## 3. Layout

### Desktop

- sidebar fixa;
- header com titulo da pagina e acao principal;
- cards de resumo no topo;
- filtros e busca;
- tabela principal;
- modal ou painel lateral para cadastro, venda e movimento;
- historico em modal, painel ou secao expansivel.

### Mobile

- header compacto;
- cards de resumo empilhados;
- busca acima da lista;
- filtros essenciais visiveis;
- cards de produto no lugar da tabela;
- acoes por produto em menu curto ou bottom sheet.

## 4. Estrutura da tela

### Topo

- busca por produto ou tamanho;
- filtro por categoria;
- filtro por status;
- filtro por estoque baixo;
- filtro por dados pendentes;
- filtro por periodo para vendas/recebimentos;
- botao `Novo produto`;
- acao secundaria `Registrar venda`.

### Cards de resumo

- Produtos ativos;
- Itens com estoque baixo;
- Valor em estoque;
- Receita do periodo;
- Lucro bruto do periodo;
- Recebido no periodo.

### Resumo de recebimento

Exibir um bloco discreto com:

- Pix;
- Cartao;
- Dinheiro;
- Total recebido.

## 5. Lista de produtos

Desktop:

```txt
Produto | Tamanho | Saldo | Minimo | Custo | Preco | Valor estoque | Vendidos | Receita | Recebido | Lucro | Status | Acoes
```

Mobile:

- nome do produto;
- tamanho;
- saldo atual;
- preco de venda;
- valor em estoque;
- receita, recebido e lucro do periodo;
- alerta de estoque baixo;
- alerta de preco aberto ou dado pendente;
- acoes em menu curto.

## 6. Formulario de produto

Ordem sugerida:

1. nome;
2. tamanho;
3. imagem opcional;
4. codigo interno;
5. categoria;
6. unidade;
7. estoque minimo;
8. custo medio opcional;
9. preco de venda;
10. preco aberto;
11. observacao.

Regras de UX:

- labels sempre visiveis;
- ajuda curta abaixo de campos numericos;
- orientar que estoque inicial deve ser registrado por `Registrar entrada` apos salvar;
- destaque quando custo estiver pendente;
- destaque quando preco estiver aberto;
- botao de salvar com texto claro;
- imagem pode entrar como upload simples em etapa futura.

## 7. Formulario de venda

Modal desktop ou bottom sheet mobile.

Campos:

- produto;
- quantidade;
- preco unitario;
- forma de pagamento;
- status de recebimento;
- valor recebido;
- data operacional;
- observacao.

Area de resumo:

- saldo atual;
- saldo apos venda;
- receita da venda;
- custo estimado;
- lucro bruto;
- recebido.

Regras de UX:

- quando quantidade for maior que saldo, bloquear envio e mostrar mensagem objetiva;
- quando produto tiver preco aberto, pedir preco unitario maior que zero antes de permitir salvar;
- quando produto tiver custo pendente, bloquear venda e orientar preencher custo ou registrar entrada com custo;
- quando recebimento for `recebido`, preencher valor recebido com o total da venda;
- quando recebimento for `pendente`, preencher valor recebido com zero;
- quando recebimento for `parcial`, permitir valor maior que zero e menor que total da venda.

## 8. Formulario de movimentacao

Usado para entrada, uso interno, perda e ajuste.

Campos:

- produto;
- tipo de movimentacao;
- quantidade para entrada, uso interno e perda;
- alteracao de estoque assinada para ajuste;
- custo unitario para entrada;
- data operacional;
- observacao.

Area de resumo:

- saldo atual;
- saldo estimado apos a movimentacao;
- valor em estoque estimado.

## 9. Historico

O historico por produto deve mostrar:

```txt
Data | Tipo | Quantidade | Saldo alterado | Preco | Receita | Recebido | Lucro | Observacao
```

O historico deve ser ordenado do mais recente para o mais antigo.

## 10. Estados

### Loading

- skeleton para lista, cards e resumo financeiro.

### Empty state

Mensagem sugerida:

`Nenhum produto cadastrado.`

Acao:

`Novo produto`

### Sem resultado

Mensagem sugerida:

`Nenhum item encontrado para os filtros aplicados.`

### Dados pendentes

Mensagem sugerida:

`Revise custo ou preco antes de vender este produto.`

### Erro

Mensagem sugerida:

`Nao foi possivel salvar. Tente novamente.`

### Sucesso

Mensagens sugeridas:

`Produto salvo com sucesso.`

`Venda registrada com sucesso.`

`Movimentacao registrada com sucesso.`

## 11. Acoes por item

- editar;
- registrar venda;
- registrar entrada;
- registrar uso interno;
- registrar perda;
- ajustar estoque;
- ver historico;
- inativar.

## 12. Hierarquia visual

- nome e tamanho identificam o produto;
- saldo atual deve ser muito legivel;
- preco e lucro devem ser visiveis sem poluir a linha;
- alerta de estoque baixo deve ter prioridade sobre badges secundarios;
- alerta de preco aberto deve aparecer antes da venda;
- historico deve ser acessivel, mas nao competir com a lista principal.

## 13. Acessibilidade

- inputs com label;
- botao com texto ou icone com `aria-label`;
- foco visivel;
- contraste adequado para alerta de estoque baixo;
- area de toque generosa no mobile;
- mensagens de erro proximas aos campos.

## 14. Fluxos sugeridos

### Cadastro

```txt
Produtos -> Novo produto -> Preencher dados -> Salvar -> Produto aparece na lista
```

### Entrada

```txt
Produto -> Registrar entrada -> Informar quantidade/custo/data -> Salvar -> Saldo aumenta
```

### Venda

```txt
Produto -> Registrar venda -> Informar quantidade/pagamento -> Conferir resumo -> Salvar -> Saldo reduz e receita aparece
```

### Conferencia

```txt
Produtos -> Filtrar periodo -> Conferir receita/lucro/recebido -> Ver historico
```

## 15. Ajustes visuais recomendados

- badge para `Estoque baixo`;
- badge para `Zerado`;
- badge para `Preco aberto`;
- badge para `Inativo`;
- destaque discreto para Pix, cartao e dinheiro no resumo;
- cor verde para resultado positivo;
- cor amber para pendencias;
- cor red para perda, estoque zerado ou erro.
