# G.A Essencia

Especificacao tecnica da secao de Produtos.

Produto: G.A Essencia
Objetivo: desenhar a estrutura tecnica para o modulo de estoque, vendas simples, recebimento, receita e lucro bruto.

# 20 - Products Specification

## 1. Feature overview

### FEATURE-101 Product Catalog

Cadastro e manutencao dos produtos e variacoes.

### FEATURE-102 Stock Movement

Lancamento de entrada, venda, uso interno, perda e ajuste.

### FEATURE-103 Inventory Summary

Consulta de saldo atual, valor em estoque, alerta de estoque baixo e produtos com dados pendentes.

### FEATURE-104 Product Sales Summary

Consulta de vendidos, receita bruta, recebido e lucro bruto por produto e periodo.

### FEATURE-105 Movement History

Consulta de historico por produto, com valores preservados no momento da movimentacao.

### FEATURE-106 Products CSV Export

Exportacao da listagem/resumo de produtos com separador `;`.

## 2. Tipos de dominio

```ts
export type ProductStatus = 'active' | 'inactive'

export type StockMovementType =
  | 'purchase'
  | 'sale'
  | 'internal_use'
  | 'loss'
  | 'adjustment'

export type PaymentMethod = 'pix' | 'card' | 'cash'

export type ReceiptStatus = 'received' | 'pending' | 'partial'

export type Product = {
  id: string
  userId: string
  name: string
  size: string
  imageUrl?: string | null
  internalCode?: string | null
  category?: string | null
  unit: string
  currentStock: number
  minimumStock: number
  averageCost: number | null
  salePrice: number | null
  salePriceOpen: boolean
  notes?: string | null
  status: ProductStatus
  createdAt: string
  updatedAt: string
}

export type StockMovement = {
  id: string
  userId: string
  productId: string
  type: StockMovementType
  quantity: number
  stockDelta: number
  unitCost: number | null
  unitSalePrice: number | null
  revenueValue: number
  costValue: number
  grossProfitValue: number
  paymentMethod: PaymentMethod | null
  receiptStatus: ReceiptStatus | null
  amountReceived: number
  notes?: string | null
  occurredAt: string
  createdAt: string
  updatedAt: string
}
```

## 2.1 Decisoes tecnicas fechadas

- O MVP da secao aceita uma unica forma de pagamento por venda.
- Pagamento dividido entre Pix, cartao e dinheiro fica fora do escopo inicial.
- `quantity` sempre armazena valor inteiro positivo no MVP.
- `stockDelta` armazena a direcao da movimentacao: positivo para entrada/aumento e negativo para saida/reducao.
- Em ajuste, o formulario deve informar um `stockDelta` assinado; a persistencia deve gravar `quantity = abs(stockDelta)`.
- Produto nasce com `currentStock = 0`; estoque inicial deve ser registrado como movimento de entrada.
- `averageCost = null` representa custo pendente.
- A coluna `Valor uni` da planilha deve ser tratada como custo unitario legado, nao como preco de venda.
- Movimento e atualizacao de saldo devem ser gravados por RPC/transacao atomica.

## 3. Regras de dominio

- produto inativo nao recebe movimento novo;
- produto e tamanho representam uma variacao de estoque;
- nome e tamanho devem ser normalizados antes de validar unicidade;
- `quantity` e sempre a quantidade absoluta informada pelo usuario e deve ser inteiro no MVP;
- `stockDelta` e a alteracao aplicada ao estoque;
- entrada usa `stockDelta` positivo;
- venda, uso interno e perda usam `stockDelta` negativo;
- ajuste usa `stockDelta` positivo ou negativo e persiste `quantity` como valor absoluto;
- saldo final nao pode ser negativo;
- estoque baixo ocorre quando saldo atual for menor ou igual ao minimo;
- produto com `salePriceOpen = true` deve exigir preco unitario maior que zero no momento da venda;
- produto com `averageCost = null` nao pode ser vendido ate o custo ser definido;
- cada venda possui uma unica forma de pagamento no MVP da secao;
- o filtro `paymentPending` deve considerar somente movimentos `sale` com
  `receiptStatus = 'pending'` ou `receiptStatus = 'partial'`;
- venda gera receita, custo e lucro bruto;
- venda congela o custo medio vigente no movimento para preservar historico;
- uso interno, perda e ajuste nao geram receita;
- resumos por periodo usam `occurredAt`, nao `createdAt`;
- o saldo pode ser armazenado no produto para leitura rapida;
- o historico de movimentos e a fonte de auditoria.

## 4. Funcoes de dominio sugeridas

### Saldo

```ts
export function assertIntegerQuantity(quantity: number) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('A quantidade deve ser um inteiro maior que zero.')
  }
}
```

```ts
export function calculateStockDelta(
  movementType: StockMovementType,
  quantity: number,
  adjustmentDelta?: number,
) {
  assertIntegerQuantity(quantity)

  if (movementType === 'adjustment') {
    if (
      adjustmentDelta === undefined ||
      adjustmentDelta === 0 ||
      !Number.isInteger(adjustmentDelta)
    ) {
      throw new Error('O ajuste precisa de uma alteracao de estoque.')
    }

    return adjustmentDelta
  }

  if (movementType === 'purchase') {
    return quantity
  }

  if (
    movementType === 'sale' ||
    movementType === 'internal_use' ||
    movementType === 'loss'
  ) {
    return -quantity
  }

  throw new Error('Tipo de movimentacao invalido.')
}
```

```ts
export function calculateStockAfterMovement(
  currentStock: number,
  stockDelta: number,
) {
  const nextStock = currentStock + stockDelta

  if (nextStock < 0) {
    throw new Error('Estoque insuficiente para a movimentacao.')
  }

  return nextStock
}
```

### Venda

```ts
export function calculateSaleResult(
  quantity: number,
  unitSalePrice: number,
  unitCost: number,
) {
  assertIntegerQuantity(quantity)

  if (unitSalePrice <= 0) {
    throw new Error('Venda exige preco unitario maior que zero.')
  }

  if (unitCost < 0) {
    throw new Error('Custo unitario nao pode ser negativo.')
  }

  const revenueValue = Number((quantity * unitSalePrice).toFixed(2))
  const costValue = Number((quantity * unitCost).toFixed(2))
  const grossProfitValue = Number((revenueValue - costValue).toFixed(2))

  return { revenueValue, costValue, grossProfitValue }
}
```

### Valor em estoque

```ts
export function calculateInventoryValue(
  currentStock: number,
  averageCost: number | null,
) {
  if (averageCost === null) {
    return null
  }

  return Number((currentStock * averageCost).toFixed(2))
}
```

### Estoque baixo

```ts
export function isLowStock(currentStock: number, minimumStock: number) {
  return currentStock <= minimumStock
}
```

### Custo medio

```ts
export function calculateWeightedAverageCost(input: {
  currentStock: number
  currentAverageCost: number | null
  incomingQuantity: number
  incomingUnitCost: number
}) {
  assertIntegerQuantity(input.incomingQuantity)

  if (input.incomingUnitCost < 0) {
    throw new Error('Custo de entrada nao pode ser negativo.')
  }

  if (input.currentAverageCost === null) {
    return Number(input.incomingUnitCost.toFixed(2))
  }

  const currentTotal = input.currentStock * input.currentAverageCost
  const incomingTotal = input.incomingQuantity * input.incomingUnitCost
  const nextStock = input.currentStock + input.incomingQuantity

  if (nextStock <= 0) {
    return 0
  }

  return Number(((currentTotal + incomingTotal) / nextStock).toFixed(2))
}
```

## 5. Persistencia sugerida

Detalhamento completo de SQL, RLS e RPC atomica: `27_PRODUCTS_DATABASE.md`.

### Tabela products

Campos principais:

- id;
- user_id;
- name;
- size;
- image_url;
- internal_code;
- category;
- unit;
- current_stock;
- minimum_stock;
- average_cost;
- sale_price;
- sale_price_open;
- notes;
- status;
- created_at;
- updated_at.

Constraints sugeridas:

- `current_stock >= 0`;
- `minimum_stock >= 0`;
- `average_cost is null or average_cost >= 0`;
- `sale_price_open = true and sale_price is null`, ou `sale_price_open = false and sale_price > 0`;
- `status in ('active', 'inactive')`.
- unicidade por `user_id`, nome normalizado e tamanho normalizado.

Indices sugeridos:

- `idx_products_user_id`;
- `idx_products_name`;
- `idx_products_status`;
- `idx_products_category`.

### Tabela stock_movements

Campos principais:

- id;
- user_id;
- product_id;
- type;
- quantity;
- stock_delta;
- unit_cost;
- unit_sale_price;
- revenue_value;
- cost_value;
- gross_profit_value;
- payment_method;
- receipt_status;
- amount_received;
- notes;
- occurred_at;
- created_at;
- updated_at.

Constraints sugeridas:

- `quantity > 0`;
- `quantity` inteiro no MVP;
- `stock_delta <> 0`;
- `stock_delta` inteiro no MVP;
- `unit_cost is null or unit_cost >= 0`;
- `unit_sale_price is null or unit_sale_price > 0`;
- `revenue_value >= 0`;
- `cost_value >= 0`;
- `amount_received >= 0`;
- `type in ('purchase', 'sale', 'internal_use', 'loss', 'adjustment')`;
- `payment_method in ('pix', 'card', 'cash')` quando preenchido;
- `receipt_status in ('received', 'pending', 'partial')` quando preenchido.
- para ajuste, `quantity = abs(stock_delta)`.

Indices sugeridos:

- `idx_stock_movements_user_id`;
- `idx_stock_movements_product_id`;
- `idx_stock_movements_type`;
- `idx_stock_movements_created_at`.

## 6. Regras de integridade

- `products.user_id` referencia o usuario autenticado;
- `stock_movements.user_id` referencia o usuario autenticado;
- `stock_movements.product_id` referencia `products.id`;
- RLS deve limitar leitura e escrita ao dono do registro;
- criacao de movimento e atualizacao de saldo devem ocorrer de forma atomica;
- registrar movimento e atualizar produto deve ser feito por funcao SQL/RPC em um unico commit;
- historico de movimento nao deve ser apagado pela UI;
- exclusao fisica nao deve ser oferecida no MVP da secao.

## 7. Contratos de repositorio

Detalhamento completo de DTOs, inputs, filtros e repositories:
`28_PRODUCTS_API_CONTRACTS.md`.

### productRepository

```ts
list(filters?: ProductFilters): Promise<ProductDTO[]>
getById(id: string): Promise<ProductDTO>
create(input: CreateProductInput): Promise<ProductDTO>
update(id: string, input: UpdateProductInput): Promise<ProductDTO>
deactivate(id: string): Promise<void>
getSummary(filters?: ProductSummaryFilters): Promise<ProductSummaryDTO>
exportCsv(filters?: ProductFilters): Promise<string>
```

### stockMovementRepository

```ts
listByProductId(productId: string): Promise<StockMovementDTO[]>
listRecent(filters?: StockMovementFilters): Promise<StockMovementDTO[]>
create(input: CreateStockMovementInput): Promise<StockMovementDTO>
```

### productSalesSummaryRepository

Pode ser implementado como query agregada ou funcao SQL.

```ts
getByProduct(filters: ProductSummaryFilters): Promise<ProductSalesSummaryDTO[]>
```

Resumo por forma de pagamento deve ser retornado por `productRepository.getSummary`.

## 8. Validacoes de formulario

### Produto

- nome obrigatorio;
- tamanho obrigatorio;
- unidade obrigatoria;
- estoque minimo nao pode ser negativo;
- custo medio pode ficar vazio; quando preenchido, nao pode ser negativo;
- preco de venda deve ser maior que zero quando `preco aberto` estiver desligado;
- se `preco aberto` estiver desligado, preco de venda deve ser informado;
- imagem e opcional.

### Movimentacao

- produto obrigatorio;
- tipo obrigatorio;
- quantidade inteira maior que zero;
- entrada pode informar custo unitario;
- venda exige preco unitario maior que zero;
- venda exige custo medio definido;
- venda exige forma de pagamento;
- venda exige status de recebimento;
- movimento deve aceitar data operacional;
- venda aceita uma unica forma de pagamento no MVP da secao;
- venda nao pode deixar saldo negativo;
- uso interno nao gera receita;
- perda nao gera receita;
- ajuste precisa de observacao quando houver correcao manual relevante.

## 9. Consultas e calculos de tela

### Produto

```txt
valorEmEstoque = currentStock * averageCost
```

Se `averageCost` estiver pendente, `valorEmEstoque` deve ser pendente.

### Venda

```txt
receita = quantity * unitSalePrice
custoVenda = quantity * unitCost
lucroBruto = receita - custoVenda
```

### Recebimento

```txt
recebidoPix = soma amountReceived onde paymentMethod = pix
recebidoCartao = soma amountReceived onde paymentMethod = card
recebidoDinheiro = soma amountReceived onde paymentMethod = cash
recebidoTotal = recebidoPix + recebidoCartao + recebidoDinheiro
```

Pagamento dividido:

```txt
fora do MVP da secao
```

## 10. Decisoes tecnicas

- manter modulo isolado em `domain/products`;
- manter telas em `features/products`;
- evitar acoplamento com calculos financeiros de atendimentos;
- usar repositories para persistencia;
- usar funcoes de dominio para saldo, receita, lucro e valor em estoque;
- usar RPC/transacao atomica para registrar movimentacao;
- tratar saldo como dado de leitura rapida;
- preservar valores financeiros no movimento para historico;
- imagem do produto e opcional e nao pode bloquear o cadastro;
- nao usar Redux, GraphQL, Firebase ou backend customizado.
