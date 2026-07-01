# G.A Essencia

Especificacao de UX para a nova secao de Produtos.

Produto: G.A Essencia
Objetivo: desenhar telas simples para cadastrar produtos, consultar saldo e registrar movimentacoes.

# 21 - UX Spec

## 1. Principio

O modulo de Produtos precisa ser tao simples quanto o resto do app, com foco em consulta rapida e operacao de estoque sem friccao.

## 2. Rota

- `/products`

## 3. Layout

### Desktop

- sidebar fixa;
- header com titulo da pagina e acao principal;
- cards de resumo no topo;
- tabela principal com filtros;
- painel lateral ou modal para cadastro e movimento.

### Mobile

- header compacto;
- cards empilhados;
- filtro simplificado no topo;
- acao principal sempre visivel;
- evitar tabela horizontal longa.

## 4. Estrutura da tela

### Topo

- busca por nome ou codigo;
- filtro por categoria;
- filtro por status;
- filtro por estoque baixo;
- botao `Novo produto`.

### Cards de resumo

- Total de produtos ativos;
- Itens com estoque baixo;
- Movimentacoes recentes;
- Estoque zerado.

### Lista de produtos

Desktop:

```txt
Produto | Categoria | Unidade | Saldo | Minimo | Status | Acoes
```

Mobile:

- nome do produto;
- categoria;
- saldo atual;
- alerta de estoque baixo;
- acoes em menu curto.

## 5. Formulario de produto

Ordem sugerida:

1. nome;
2. imagem do produto;
3. codigo interno;
4. categoria;
5. unidade;
6. saldo inicial;
7. estoque minimo;
8. custo medio opcional;
9. observacao.

Regras de UX:

- labels sempre visiveis;
- ajuda curta abaixo de campos numericos;
- destaque quando saldo inicial for zero;
- botao de salvar com texto claro.
- imagem pode entrar como upload simples com preview e opcao de remover.

## 6. Formulario de movimentacao

Modal desktop ou bottom sheet mobile.

Campos:

- produto;
- tipo de movimentacao;
- quantidade;
- observacao;

Area de resumo:

- saldo atual;
- saldo estimado apos a movimentacao.

## 7. Estados

### Loading

- skeleton para lista e cards.

### Empty state

Mensagem sugerida:

`Nenhum produto cadastrado.`

### Sem resultado

Mensagem sugerida:

`Nenhum item encontrado para os filtros aplicados.`

### Erro

Mensagem sugerida:

`Nao foi possivel salvar. Tente novamente.`

### Sucesso

Mensagem sugerida:

`Produto salvo com sucesso.`

`Movimentacao registrada com sucesso.`

## 8. Acoes por item

- editar;
- inativar;
- registrar entrada;
- registrar saida;
- ajustar estoque;
- ver historico.

## 9. Hierarquia visual

- alerta de estoque baixo deve ter prioridade acima de badges secundarios;
- saldo atual deve ser o valor mais legivel do card;
- a acao principal deve ficar no canto superior direito da pagina;
- o historico deve ser acessivel, mas nao competir com a lista principal.

## 10. Acessibilidade

- inputs com label;
- botao com texto;
- foco visivel;
- contraste adequado para alerta de estoque baixo;
- area de toque generosa no mobile.

## 11. Fluxo sugerido

```txt
Produtos -> Novo produto -> Salvar -> Listar -> Registrar movimento -> Conferir saldo -> Ver historico
```

## 12. Ajustes visuais recomendados

- badge para `Estoque baixo`;
- badge para `Inativo`;
- badge para `Zerado`;
- thumbnail opcional do produto na lista;
- destaque visual discreto para movimentacao de entrada e saida;
- uso de cores consistentes com o sistema atual.
