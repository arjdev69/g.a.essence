# G.A Essencia

Backlog tecnico para desenvolvimento da secao de Produtos.

Produto: G.A Essencia
Objetivo: quebrar a implementacao de Produtos em tarefas pequenas e verificaveis.

# 26 - Products Tasks

## Regra de execucao

Implementar uma task por vez.
Nao implementar funcionalidades fora do escopo da task atual.

Antes de iniciar codigo, ler `27_PRODUCTS_DATABASE.md` e
`28_PRODUCTS_API_CONTRACTS.md`.

O documento `24_PRODUCTS_SPREADSHEET_MAPPING.md` e referencia de levantamento
da planilha atual. Ele nao cria obrigacao de importacao para o MVP da secao.

Toda task de UI deve considerar responsividade mobile e acessibilidade basica
desde a implementacao, mantendo TASK-P035 e TASK-P036 como revisao final.

### TASK-P000

Confirmar a estrategia de cadastro manual inicial:

- primeira versao sem importacao automatica da planilha;
- planilha usada apenas como referencia de campos, divergencias e regras;
- produtos cadastrados manualmente;
- entradas iniciais de estoque registradas manualmente como movimento de entrada;
- cadastro de produto sempre inicia com saldo zero;
- preco de venda informado no cadastro ou na venda;
- produtos sem preco revisado com `preco aberto`;
- produtos sem custo definido com custo pendente.

## EPIC-014 Produtos - Dominio

### TASK-P001

Criar tipos em `src/domain/products/product.types.ts`.

### TASK-P002

Criar funcoes de dominio:

- `calculateStockDelta`;
- `calculateStockAfterMovement`;
- `calculateInventoryValue`;
- `calculateSaleResult`;
- `calculateWeightedAverageCost`;
- `isLowStock`;
- `normalizeProductName`;
- `normalizeProductSize`;
- `assertIntegerQuantity`.

### TASK-P003

Criar testes unitarios das funcoes de dominio.

## EPIC-015 Produtos - Validacoes

### TASK-P004

Criar `product.schema.ts` com validacoes de cadastro, preco aberto, custo
pendente e ausencia de saldo inicial direto.

### TASK-P005

Criar `stockMovement.schema.ts` com validacoes de entrada, venda, uso interno,
perda, ajuste, quantidade inteira, `occurredAt` e recebimento.

### TASK-P006

Criar testes de validacao de produto e movimentacao.

## EPIC-016 Produtos - Banco

### TASK-P007

Criar migracao Supabase para tabela `products` conforme `27_PRODUCTS_DATABASE.md`.

### TASK-P008

Criar migracao Supabase para tabela `stock_movements` conforme `27_PRODUCTS_DATABASE.md`.

### TASK-P009

Criar indices, constraints, triggers de `updated_at` e RLS.

### TASK-P010

Atualizar `src/services/supabase/database.types.ts`.

### TASK-P011

Criar funcao SQL/RPC obrigatoria para registrar movimento e atualizar saldo de forma atomica.

### TASK-P011A

Criar smoke/integration tests da RPC e RLS:

- entrada atualiza saldo no mesmo commit;
- venda com estoque insuficiente faz rollback;
- produto inativo bloqueia movimento;
- usuario nao acessa dados de outro usuario;
- venda sem custo medio falha;
- quantidade fracionada falha;
- regras de recebimento falham corretamente.

## EPIC-017 Produtos - Repositories

### TASK-P012

Criar `product.repository.ts` conforme `28_PRODUCTS_API_CONTRACTS.md`.

### TASK-P013

Criar `stockMovement.repository.ts` conforme `28_PRODUCTS_API_CONTRACTS.md`.

### TASK-P014

Criar consultas agregadas para resumo de estoque, receita, lucro e recebimento
usando `occurredAt` como data de periodo.

## EPIC-018 Produtos - UI Base

### TASK-P015

Adicionar rota `/products`.

### TASK-P016

Adicionar item `Produtos` no menu principal.

### TASK-P017

Criar `ProductsPage` com loading, empty state, error state, filtros e listagem.

### TASK-P018

Criar cards de resumo:

- produtos ativos;
- estoque baixo;
- valor em estoque;
- receita;
- lucro bruto;
- recebido.

## EPIC-019 Produtos - Cadastro

### TASK-P019

Criar `ProductForm`.

### TASK-P020

Integrar criacao de produto.

### TASK-P021

Integrar edicao de produto.

### TASK-P022

Integrar inativacao de produto.

## EPIC-020 Produtos - Movimentacoes

### TASK-P023

Criar formulario de entrada.

### TASK-P024

Criar formulario de venda.

### TASK-P025

Criar formulario de uso interno/perda/ajuste.

### TASK-P026

Integrar registro de movimentacao usando a RPC atomica.

### TASK-P027

Exibir historico por produto.

## EPIC-021 Produtos - Financeiro Simples

### TASK-P028

Calcular e exibir receita bruta por produto.

### TASK-P029

Calcular e exibir lucro bruto por produto.

### TASK-P030

Calcular e exibir recebido por Pix, cartao e dinheiro.

### TASK-P031

Filtrar resumos por periodo.

## EPIC-022 Produtos - Exportacao

### TASK-P034

Criar exportacao CSV do resumo de produtos.

## EPIC-023 Produtos - Polimento e Validacao

### TASK-P035

- [x] Responsividade mobile da tela de produtos validada com cards, filtros e ações essenciais em alvos de toque de 44px; campos de entrada usam 16px no mobile e não há tabela na variante mobile.

Responsividade mobile da tela de produtos.

### TASK-P036

- [x] Formulários de cadastro, entrada, ajuste e venda revisados com labels associados, ajuda anunciável, ações nomeadas e cobertura automatizada.

Revisar acessibilidade dos formularios e acoes.

### TASK-P037

Executar fluxo completo com massa de teste manual baseada nos dados reais da
planilha, sem importacao automatica.

### TASK-P038

Executar `npm run test`, `npm run lint` e `npm run build`.

## EPIC-026 Produtos - Recebimentos Pendentes

### TASK-P042

- [x] Filtro de pagamento pendente (fiado) implementado na listagem e na
  exportacao, com vendas `pending` e `partial`, combinacao com os demais
  filtros e cobertura automatizada no mobile e no repository.

Adicionar filtro `Pagamento pendente (fiado)` na listagem e na exportacao de
Produtos. O filtro deve considerar vendas `pending` ou `partial`, manter os
demais filtros combinaveis e ter cobertura automatizada no mobile e no
repository.

## EPIC-024 Produtos - Imagem Opcional

### TASK-P039

Criar bucket/policies de storage para imagem de produto, se upload for priorizado.

### TASK-P040

Implementar upload, preview, troca e remocao de imagem.

### TASK-P041

Validar fallback visual para produtos sem imagem.

## EPIC-025 Produtos - Futuro/Opcional

### TASK-P032 (futura/opcional)

Criar parser/normalizador da planilha legada apenas se importacao for
priorizada futuramente.

### TASK-P033 (futura/opcional)

Criar relatorio de divergencias da planilha apenas se importacao for
priorizada futuramente.

## Ordem recomendada

1. TASK-P000.
2. TASK-P001 a TASK-P003.
3. TASK-P004 a TASK-P006.
4. TASK-P007 a TASK-P011A.
5. TASK-P012 a TASK-P014.
6. TASK-P015 a TASK-P018.
7. TASK-P019 a TASK-P022.
8. TASK-P023 a TASK-P027.
9. TASK-P028 a TASK-P031.
10. TASK-P034.
11. TASK-P035 a TASK-P038.
12. TASK-P042.
13. TASK-P039 a TASK-P041, apenas se imagem for priorizada.
14. TASK-P032 e TASK-P033, apenas se importacao for priorizada futuramente.
