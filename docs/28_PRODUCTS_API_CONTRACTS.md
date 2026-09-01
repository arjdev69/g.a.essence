# G.A Essencia

Contratos de API/repositories para a secao de Produtos.

Produto: G.A Essencia
Objetivo: definir DTOs, inputs, filtros e repositories usados pela UI de Produtos.

# 28 - Products API Contracts

## 1. Convencoes

- Datas: ISO string.
- Dinheiro: number em reais com duas casas.
- Quantidade: number inteiro positivo no MVP.
- `stockDelta`: number inteiro assinado no MVP.
- CSV: separador `;`.
- Pagamento: uma unica forma por venda no MVP.

## 2. Tipos base

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
```

## 3. ProductDTO

```ts
export type ProductDTO = {
  id: string
  name: string
  size: string
  imageUrl: string | null
  internalCode: string | null
  category: string | null
  unit: string
  currentStock: number
  minimumStock: number
  averageCost: number | null
  salePrice: number | null
  salePriceOpen: boolean
  notes: string | null
  status: ProductStatus
  createdAt: string
  updatedAt: string
}
```

## 4. Product inputs

```ts
export type CreateProductInput = {
  name: string
  size: string
  imageUrl?: string | null
  internalCode?: string | null
  category?: string | null
  unit: string
  minimumStock: number
  averageCost?: number | null
  salePrice?: number | null
  salePriceOpen: boolean
  notes?: string | null
}

export type UpdateProductInput = Partial<CreateProductInput> & {
  status?: ProductStatus
}
```

Regras:

- `create` sempre cria produto com `currentStock = 0`.
- estoque inicial deve ser registrado depois por `stockMovementRepository.create`
  com `type = 'purchase'`.
- `averageCost = null` representa custo pendente.
- quando `salePriceOpen = false`, `salePrice` deve ser maior que zero.
- quando `salePriceOpen = true`, `salePrice` deve ser `null`.

## 5. StockMovementDTO

```ts
export type StockMovementDTO = {
  id: string
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
  notes: string | null
  occurredAt: string
  createdAt: string
  updatedAt: string
}
```

## 6. Stock movement inputs

```ts
export type CreateStockMovementInput = {
  productId: string
  type: StockMovementType
  quantity: number
  adjustmentDelta?: number
  unitCost?: number | null
  unitSalePrice?: number | null
  paymentMethod?: PaymentMethod | null
  receiptStatus?: ReceiptStatus | null
  amountReceived?: number
  notes?: string | null
  occurredAt?: string
}
```

Regras:

- `quantity` sempre inteiro positivo no MVP.
- `adjustmentDelta` e obrigatorio, assinado e inteiro quando `type = 'adjustment'`.
- `unitSalePrice`, `paymentMethod` e `receiptStatus` sao obrigatorios quando `type = 'sale'`.
- `unitSalePrice` deve ser maior que zero.
- `paymentMethod` deve ser unico por venda.
- `amountReceived` deve obedecer ao `receiptStatus`.
- `occurredAt` e opcional; quando ausente, usar a data/hora atual.

## 7. Filtros

```ts
export type ProductFilters = {
  search?: string
  category?: string
  status?: ProductStatus | 'all'
  lowStock?: boolean
  pendingData?: boolean
  paymentPending?: boolean
}

export type StockMovementFilters = {
  productId?: string
  type?: StockMovementType
  dateFrom?: string
  dateTo?: string
}

export type ProductSummaryFilters = {
  dateFrom?: string
  dateTo?: string
}
```

## 8. Summaries

```ts
export type ProductSummaryDTO = {
  activeProductsCount: number
  lowStockCount: number
  zeroStockCount: number
  pendingDataCount: number
  inventoryValue: number
  periodRevenue: number
  periodGrossProfit: number
  periodReceived: number
  receivedByPaymentMethod: {
    pix: number
    card: number
    cash: number
  }
}

export type ProductSalesSummaryDTO = {
  productId: string
  productName: string
  productSize: string
  soldQuantity: number
  revenueValue: number
  costValue: number
  grossProfitValue: number
  amountReceived: number
}
```

Regras de resumo:

- `pendingData` equivale a `salePriceOpen = true`, `salePrice = null` ou
  `averageCost = null`.
- `paymentPending` equivale a existir ao menos uma movimentacao `sale` do
  produto com `receipt_status = 'pending'` ou `receipt_status = 'partial'`.
  Isso representa venda fiada ou com saldo em aberto.
- `inventoryValue` deve somar apenas produtos com `averageCost` definido.
- filtros de periodo devem usar `occurredAt`.

## 9. Repositories

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

`create` deve chamar a RPC `create_stock_movement`.

### productSalesSummaryRepository

```ts
getByProduct(filters: ProductSummaryFilters): Promise<ProductSalesSummaryDTO[]>
```

## 10. CSV

Colunas sugeridas:

```txt
Produto;Tamanho;Saldo;Minimo;Custo Medio;Preco Venda;Valor Estoque;Vendidos;Receita;Lucro Bruto;Recebido;Status
```

## 11. Criterios de aceite dos contratos

- UI nao acessa Supabase diretamente.
- Repository de movimento usa RPC atomica.
- DTOs nao expõem `userId`.
- Valores monetarios chegam convertidos para number.
- Filtros suportam listagem e resumos da tela.
- Criacao de produto nao aceita saldo inicial direto.
- Data operacional de movimento trafega por `occurredAt`.
