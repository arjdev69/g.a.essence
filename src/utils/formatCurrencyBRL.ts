export function formatCurrencyBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    currency: 'BRL',
    style: 'currency',
  })
    .format(value)
    .replace(/\u00a0/g, ' ')
}
