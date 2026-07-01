# G.A Essencia

Documentacao para orientar a criacao de uma nova secao de Produtos, com foco em controle de estoque.

Produto: G.A Essencia
Objetivo: manter o padrao do app e adicionar um modulo simples para cadastrar produtos, controlar saldo de estoque e registrar movimentacoes.
Stack alvo: React + TypeScript + Vite + Tailwind + Supabase.

# 18 - Products Plan

## 1. Contexto

Hoje o produto resolve agenda, pacientes, profissionais, servicos, atendimentos e financeiro.
A nova secao de Produtos entra como uma expansao do fluxo operacional da clinica, para controlar itens consumidos ou vendidos no dia a dia.

## 2. Problema que esta sendo resolvido

- controle manual de produtos em planilha;
- perda de visibilidade sobre saldo;
- risco de compra em excesso ou ruptura de estoque;
- dificuldade para consultar historico de entrada e saida;
- pouca clareza sobre produtos com estoque baixo.

## 3. Definicao da secao

A secao de Produtos deve funcionar como um controle de estoque simples, com:

- cadastro de produtos;
- saldo atual de estoque;
- movimentacoes de entrada, saida e ajuste;
- alerta de estoque minimo;
- historico de movimentacoes por produto.

## 4. Premissas

- a operacao continua com um unico usuario autenticado;
- nao ha multi-clinica no MVP;
- o estoque e unico por usuario;
- o sistema nao precisa controlar pedidos de compra neste primeiro momento;
- o sistema nao precisa integrar leitura de codigo de barras no MVP;
- a unidade de medida precisa ser simples e padronizada por produto.

## 5. Escopo recomendado para o MVP da secao

Incluido:

- cadastro de produtos;
- listagem e busca;
- edicao e inativacao;
- campos de categoria e unidade;
- saldo atual;
- movimentacao manual de estoque;
- alerta visual de estoque baixo;
- historico de movimentacoes;
- filtros por categoria, status e alerta de estoque.

Fora do escopo inicial:

- compras com fornecedor;
- financeiro de compras;
- multi-estoque;
- leitura por barcode/QR;
- integracao com vendas;
- baixa automatica por atendimento, salvo decisao futura;
- lote e validade como obrigatorio do MVP.

## 6. Principios de produto

- simples como a agenda atual;
- rapido para cadastrar e ajustar saldo;
- visivel no celular e no desktop;
- sem excesso de campos na primeira versao;
- historico deve ser auditavel;
- valores e quantidades devem ser consistentes.

## 7. Sequencia sugerida de execucao futura

1. Definir requisitos e modelo de dados.
2. Definir UX da lista, formulario e movimentacao.
3. Criar entidades de dominio e validacoes.
4. Criar repositorios e persistencia no Supabase.
5. Criar telas e navegacao.
6. Criar testes de regras de saldo e alerta.
7. Validar com cenarios reais de uso.

## 8. Critério de sucesso

- cadastrar um produto sem friccao;
- consultar saldo atual em poucos segundos;
- registrar uma entrada ou saida sem depender de planilha;
- identificar estoque minimo antes de faltar produto;
- manter historico confiavel sem apagar movimentos.
