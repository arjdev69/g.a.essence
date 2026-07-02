# G.A Essencia

Especificacao de testes para a secao de Produtos.

Produto: G.A Essencia
Objetivo: definir testes unitarios, validacoes e fluxos para estoque, venda, recebimento, receita e lucro bruto.

# 25 - Products Test Spec

## 1. Testes unitarios de dominio

### calculateStockDelta

Casos:

- purchase, quantity 3 -> stockDelta 3;
- sale, quantity 2 -> stockDelta -2;
- internal_use, quantity 1 -> stockDelta -1;
- loss, quantity 1 -> stockDelta -1;
- adjustment, quantity 4, adjustmentDelta 4 -> stockDelta 4;
- adjustment, quantity 2, adjustmentDelta -2 -> stockDelta -2;
- adjustment, quantity 2, adjustmentDelta 0 -> erro;
- purchase, quantity 0 -> erro.

### calculateStockAfterMovement

Casos:

- currentStock 3, stockDelta 2 -> 5;
- currentStock 3, stockDelta -1 -> 2;
- currentStock 3, stockDelta -3 -> 0;
- currentStock 3, stockDelta -4 -> erro de estoque insuficiente.

### isLowStock

Casos:

- currentStock 3, minimumStock 2 -> false;
- currentStock 2, minimumStock 2 -> true;
- currentStock 0, minimumStock 2 -> true.

### calculateInventoryValue

Casos:

- currentStock 3, averageCost 198 -> 594;
- currentStock 0, averageCost 198 -> 0;
- currentStock 1, averageCost 112.5 -> 112.5;
- currentStock 1, averageCost null -> pendente/null.

### calculateSaleResult

Casos:

- quantity 1, salePrice 198, unitCost 120 -> receita 198, custo 120, lucro 78;
- quantity 2, salePrice 62, unitCost 40 -> receita 124, custo 80, lucro 44;
- quantity 1, salePrice 94.5, unitCost 108 -> receita 94.5, custo 108, lucro -13.5;
- salePrice 0 -> erro;
- quantity decimal -> erro.

### calculateWeightedAverageCost

Casos:

- stock 0, averageCost 0, incoming 3, cost 198 -> 198;
- stock 2, averageCost 100, incoming 2, cost 200 -> 150;
- stock 0, averageCost null, incoming 3, cost 198 -> 198;
- stock 0, incoming 0 -> erro.

## 2. Testes de validacao de produto

Produto valido:

- nome preenchido;
- tamanho preenchido;
- unidade preenchida;
- estoque minimo >= 0;
- custo medio vazio ou >= 0;
- preco de venda > 0 ou preco aberto ligado.

Falhas:

- nome vazio;
- tamanho vazio;
- unidade vazia;
- estoque minimo negativo;
- custo medio negativo;
- preco de venda zero com preco aberto desligado;
- preco de venda negativo;
- preco vazio com preco aberto desligado.

## 3. Testes de validacao de venda

Venda valida:

- produto ativo;
- quantidade inteira > 0;
- quantidade <= saldo atual;
- preco unitario definido;
- custo medio definido;
- forma de pagamento definida;
- status de recebimento definido.
- uma unica forma de pagamento.

Falhas:

- produto inativo;
- quantidade zero;
- quantidade negativa;
- quantidade decimal;
- quantidade maior que saldo;
- produto com preco aberto sem preco informado;
- produto com custo pendente;
- preco unitario zero;
- venda recebida com valor recebido diferente do total;
- venda pendente com valor recebido maior que zero;
- venda parcial com valor recebido zero;
- venda parcial com valor recebido maior ou igual ao total.
- venda com mais de uma forma de pagamento no mesmo registro.

## 4. Testes de recebimento

Casos:

- Pix recebido soma em `recebidoPix`;
- cartao recebido soma em `recebidoCartao`;
- dinheiro recebido soma em `recebidoDinheiro`;
- venda pendente nao soma recebido;
- venda parcial soma apenas o valor recebido;
- total recebido e soma Pix + Cartao + dinheiro.
- pagamento dividido fica fora do MVP e deve falhar na validacao de venda.

## 5. Testes de historico

Casos:

- entrada gera movimento com stockDelta positivo;
- venda gera movimento com stockDelta negativo, receita e lucro;
- uso interno gera movimento com stockDelta negativo e receita zero;
- perda gera movimento com stockDelta negativo e receita zero;
- ajuste gera movimento com observacao quando necessario;
- ajuste persiste `quantity` positivo e `stockDelta` assinado;
- movimento usa `occurredAt` como data operacional;
- historico vem em ordem decrescente.

## 6. Testes de referencia da planilha

Estes testes validam regras observadas na planilha e nao bloqueiam o MVP se a
importacao automatica nao for priorizada.

Casos de referencia:

- linha com `Valor uni` monetario converte para number;
- linha com `Valor uni = Aberto` marca custo como pendente;
- vendidos vazio e estoque menor que quantidade infere vendidos;
- vendidos vazio e estoque igual a quantidade infere zero vendidos;
- total divergente gera alerta de revisao;
- total consistente nao gera alerta;
- estoque negativo bloqueia cadastro/importacao;
- total recebido sem produto claro nao gera recebimento por produto automaticamente.

## 7. Testes de RPC/RLS

Casos:

- RPC cria entrada e atualiza saldo no mesmo commit;
- venda com estoque insuficiente falha sem gravar movimento;
- venda de produto inativo falha;
- venda sem custo medio definido falha;
- venda com preco zero falha;
- quantidade fracionada falha;
- ajuste fracionado falha;
- usuario nao acessa produto/movimento de outro usuario;
- `occurredAt` e persistido e usado em filtro de periodo;
- regras de recebimento sao aplicadas no banco.

## 8. Testes de UI

Fluxos:

- cadastrar produto;
- editar produto;
- inativar produto;
- registrar entrada;
- registrar venda Pix recebida;
- registrar venda cartao pendente;
- registrar venda parcial;
- registrar perda;
- ajustar estoque;
- filtrar produtos com estoque baixo;
- filtrar produtos com preco aberto;
- filtrar produtos com custo pendente;
- ver historico;
- exportar CSV.

## 9. Testes de regressao tecnica

Comandos esperados:

```txt
npm run test
npm run lint
npm run build
```

Todos devem passar antes de considerar a task concluida.
