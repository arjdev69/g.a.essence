# G.A Essencia

Especificacao tecnica da nova secao de Produtos.

Produto: G.A Essencia
Objetivo: desenhar a estrutura tecnica para o modulo de controle de estoque.

# 20 - Specification

## 1. Feature overview

### FEATURE-101 Product Catalog

Cadastro e manutencao dos produtos.

### FEATURE-102 Stock Movement

Lancamento de entrada, saida e ajuste de estoque.

### FEATURE-103 Inventory Summary

Consulta de saldo atual e alerta de estoque baixo.

### FEATURE-104 Movement History

Consulta de historico por produto.

## 2. Estrutura sugerida de dominio

```ts
export type ProductStatus = 'active' | 'inactive'

export type StockMovementType = 'in' | 'out' | 'adjustment'

export type Product = {
  id: string
  userId: string
  name: string
  imageUrl?: string | null
  internalCode?: string | null
  category?: string | null
  unit: string
  currentStock: number
  minimumStock: number
  averageCost?: number | null
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
  notes?: string | null
  createdAt: string
  updatedAt: string
}
```

## 3. Regras de dominio

- produto inativo nao recebe movimento novo;
- quantidade de movimento deve ser maior que zero para entrada e saida; ajuste pode ser negativo ou positivo;
- entrada soma ao saldo;
- saida subtrai do saldo;
- ajuste substitui a diferenca necessaria para corrigir o saldo;
- estoque baixo ocorre quando saldo atual for menor ou igual ao minimo;
- o saldo pode ser armazenado no produto para leitura rapida;
- o historico de movimento e a fonte de auditoria.

## 4. Funcoes de dominio sugeridas

```ts
export function calculateStockAfterMovement(
  currentStock: number,
  movementType: StockMovementType,
  quantity: number,
) {
  if (movementType !== 'adjustment' && quantity <= 0) {
    return currentStock
  }

  if (movementType === 'in') {
    return currentStock + quantity
  }

  if (movementType === 'out') {
    return Math.max(0, currentStock - quantity)
  }

  return Math.max(0, currentStock + quantity)
}
```

```ts
export function isLowStock(currentStock: number, minimumStock: number) {
  return currentStock <= minimumStock
}
```

## 5. Persistencia sugerida

### Tabela products

Campos principais:

- id;
- user_id;
- name;
- internal_code;
- category;
- unit;
- current_stock;
- minimum_stock;
- average_cost;
- notes;
- status;
- created_at;
- updated_at.

### Tabela stock_movements

Campos principais:

- id;
- user_id;
- product_id;
- type;
- quantity;
- notes;
- created_at;
- updated_at.

## 6. Regras de integridade

- `products.user_id` referencia o usuario autenticado;
- `stock_movements.product_id` referencia `products.id`;
- `current_stock` nao deve ficar negativo;
- `minimum_stock` deve ser maior ou igual a zero;
- `quantity` deve ser maior que zero para entrada e saida; ajuste pode ser negativo ou positivo;
- `type` deve ser um valor valido de movimentacao;
- RLS deve limitar leitura e escrita ao dono do registro.

## 7. Contratos de repositorio

### productRepository

- list();
- getById();
- create();
- update();
- deactivate();
- search();

### stockMovementRepository

- listByProductId();
- create();
- listRecent();

## 8. Validacoes de formulario

- nome obrigatorio;
- unidade obrigatoria;
- saldo inicial nao pode ser negativo;
- estoque minimo nao pode ser negativo;
- quantidade de movimento deve ser maior que zero para entrada e saida;
- ajuste pode ser positivo ou negativo;
- ajuste precisa de observacao quando houver correcao manual relevante.

## 9. Decisoes tecnicas

- manter modulo isolado em `domain/products`;
- manter telas em `features/products`;
- evitar acoplamento com calculos financeiros de atendimentos;
- usar repositorio para persistencia;
- tratar saldo como dado de leitura rapida, mas preservar o historico de movimento.
- imagem do produto e opcional e nao pode bloquear o cadastro.
