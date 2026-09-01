# G.A Essencia

Documentacao para orientar a criacao da secao de Produtos, com foco em controle de estoque, vendas simples e resultado bruto por produto.

Produto: G.A Essencia
Objetivo: manter o padrao do app e substituir a planilha manual de produtos por um modulo simples para controlar cadastro, saldo, entradas, vendas, recebimentos, receita e lucro bruto.
Stack alvo: React + TypeScript + Vite + Tailwind + Supabase.

# 18 - Products Plan

## 1. Contexto

Hoje o produto resolve agenda, pacientes, profissionais, servicos, atendimentos, dashboard, relatorios e exportacao.
A secao de Produtos entra como uma expansao operacional da clinica para controlar produtos comprados, produtos vendidos, saldo em estoque e recebimento por forma de pagamento.

A fonte operacional atual e uma planilha com as colunas:

```txt
Produto | Tamanho | Quantidade | Valor uni | Valor Total | Vendidos | Estoque | Pix | Cartao | R$ | Total em produtos | Recebido
```

Essa planilha mistura cadastro, estoque, venda e recebimento na mesma tabela.
Ela sera usada como referencia de levantamento, mas nao sera importada no MVP
da secao. O sistema deve separar esses conceitos para reduzir erro de calculo
e manter historico auditavel.

## 2. Problema que esta sendo resolvido

- controle manual de produtos em planilha;
- calculos manuais de estoque, valor total, receita e recebido;
- risco de divergencia entre quantidade comprada, quantidade vendida e estoque;
- dificuldade para saber o valor parado em produtos;
- pouca clareza sobre receita por forma de pagamento;
- ausencia de historico confiavel de entradas, vendas, perdas e ajustes;
- dificuldade para identificar produtos com preco aberto ou dado incompleto.

## 3. Definicao da secao

A secao de Produtos deve funcionar como um controle de estoque simples com venda manual:

- cadastro de produtos e variacoes por tamanho;
- saldo atual de estoque;
- preco de venda;
- custo unitario ou custo medio;
- valor total em estoque;
- movimentacoes de entrada, venda, uso interno, perda e ajuste;
- recebimento por Pix, cartao ou dinheiro;
- receita bruta;
- custo da venda;
- lucro bruto;
- alerta de estoque minimo;
- historico de movimentacoes por produto.

## 4. Premissas

- a operacao continua com um unico usuario autenticado;
- nao ha multi-clinica no MVP da secao;
- o estoque e unico por usuario;
- produto + tamanho representa uma variacao distinta de estoque;
- a unidade de medida precisa ser simples e padronizada por produto;
- vendas de produtos serao registradas manualmente;
- recebimentos serao registrados por forma de pagamento simples;
- cada venda tera uma unica forma de pagamento no MVP da secao;
- lucro sera lucro bruto, sem considerar taxas de cartao, impostos, frete ou custos indiretos;
- a imagem do produto e opcional e nao bloqueia o cadastro.

## 4.1 Decisoes fechadas de levantamento

- A coluna `Valor uni` da planilha sera tratada como custo unitario legado para estoque inicial.
- `Valor uni` nao sera usado automaticamente como preco de venda.
- O preco de venda deve ser cadastrado em campo separado.
- Produtos cadastrados sem preco de venda ficam com `preco aberto` ate revisao manual.
- Receita e lucro bruto nao devem ser inventados para vendas legadas quando nao houver preco de venda confiavel.
- Pagamento dividido entre Pix, cartao e dinheiro fica fora do MVP da secao.
- Importacao automatica da planilha fica fora do MVP da secao.

## 5. Escopo recomendado para o MVP da secao

Incluido:

- cadastro de produto;
- campo de tamanho/variacao;
- listagem e busca;
- edicao e inativacao;
- categoria opcional;
- unidade de medida;
- saldo atual;
- estoque minimo;
- custo unitario ou custo medio;
- preco de venda;
- valor total em estoque;
- movimentacao manual de entrada;
- movimentacao manual de venda;
- movimentacao de uso interno, perda e ajuste;
- registro de forma de pagamento da venda: Pix, cartao ou dinheiro;
- status de recebimento: recebido, pendente ou parcial;
- receita bruta por produto;
- lucro bruto por produto;
- alerta visual de estoque baixo;
- historico de movimentacoes;
- filtros por produto, tamanho, categoria, status, estoque baixo, pagamento pendente (fiado) e periodo.

Fora do escopo inicial:

- pedidos de compra com fornecedor;
- contas a pagar;
- conciliacao bancaria;
- controle de taxa de cartao;
- pagamento dividido em mais de uma forma na mesma venda;
- impostos;
- emissao fiscal;
- multi-estoque;
- leitura por barcode/QR;
- integracao automatica com venda de atendimento;
- baixa automatica por atendimento;
- lote e validade como obrigatorios;
- precificacao automatica por margem desejada.

## 6. Principios de produto

- simples como a agenda atual;
- rapido para cadastrar produto e registrar venda;
- claro para consultar estoque no celular e no desktop;
- sem excesso de campos obrigatorios;
- historico deve ser auditavel;
- valores monetarios e quantidades devem ser consistentes;
- o sistema deve mostrar divergencias em vez de esconder calculos incorretos.

## 7. Dados observados na planilha atual

Produtos reais observados:

- Beauty Power 210g;
- Breathe 10m;
- Zengest 5ml, 10ml e 15ml;
- Lavanda 5ml e 10ml;
- On Guard 2,5ml, 5ml e 15ml;
- Wild Orange 2,5ml, 5ml e 15ml;
- Steady 10ml;
- Tamer 10ml;
- Copaiba 5ml;
- Melaleuca 2,5ml e 10ml;
- DeepBlue 2,5ml, 5ml e 120g;
- Lemongras 5ml;
- Lemon 5ml;
- Balance 2,5ml e 5ml;
- AromaTouch 2,5ml;
- Frankincense 5ml;
- Tangerina 5ml;
- DDRPRIME 15ml.

Observacoes de levantamento:

- `Produto` e `Tamanho` devem formar a identificacao visual principal.
- `Quantidade` representa quantidade inicial/comprada na planilha.
- `Vendidos` representa saidas por venda.
- `Estoque` representa saldo atual.
- `Pix`, `Cartao` e `R$` representam recebimentos por forma de pagamento.
- `Total em produtos` representa uma metrica agregada da planilha, nao uma propriedade individual do produto.
- `Recebido` representa valor recebido, mas precisa ser calculado por venda para ser confiavel.
- A linha `Zengest 15ml` tem `Valor uni` como `Aberto`; o sistema deve tratar preco/custo ausente como dado pendente, nao como zero.
- Algumas linhas da planilha aparentam ter `Valor Total` diferente de `Quantidade x Valor uni`; o sistema deve calcular automaticamente e sinalizar divergencias em cadastro ou eventual importacao futura.

## 8. Sequencia sugerida de execucao futura

1. Validar requisitos e regras de negocio deste documento.
2. Definir modelo de dados de produtos, movimentos e vendas.
3. Definir UX da lista, formulario, venda e historico.
4. Criar entidades de dominio e validacoes.
5. Criar migracao Supabase, RLS e tipos.
6. Criar repositorios.
7. Criar telas e navegacao.
8. Criar testes de saldo, receita, lucro, recebimento e alerta.
9. Validar as regras contra a planilha real como referencia.

## 9. Criterios de sucesso

- cadastrar um produto com tamanho e preco sem friccao;
- consultar saldo atual em poucos segundos;
- registrar uma entrada sem depender de planilha;
- registrar uma venda com Pix, cartao ou dinheiro;
- visualizar receita bruta e lucro bruto por produto;
- identificar estoque minimo antes de faltar produto;
- manter historico confiavel sem apagar movimentos;
- impedir venda de produto com preco aberto ou custo pendente ate preencher os dados necessarios.
