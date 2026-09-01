// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProductForm } from '../features/products/ProductForm'
import { StockEntryForm } from '../features/products/StockEntryForm'
import { StockMovementForm } from '../features/products/StockMovementForm'
import { StockSaleForm } from '../features/products/StockSaleForm'

vi.mock('../services/storage/productImageStorage', () => ({
  deleteProductImageByUrl: vi.fn(),
  uploadProductImage: vi.fn(),
  validateProductImageFile: vi.fn(() => null),
}))

const productOptions = [{ label: 'Lavanda - 5ml', value: 'product-1' }]

let mounted: Array<{ container: HTMLDivElement; root: Root }> = []

function renderForm(node: React.ReactNode) {
  const container = document.createElement('div')
  const root = createRoot(container)

  document.body.appendChild(container)
  mounted.push({ container, root })
  act(() => root.render(node))

  return container
}

function expectEveryExplicitLabelHasControl(container: HTMLElement) {
  const labels = Array.from(container.querySelectorAll('label[for]'))

  expect(labels.length).toBeGreaterThan(0)

  labels.forEach((label) => {
    const controlId = label.getAttribute('for')

    expect(controlId).toBeTruthy()
    expect(container.querySelector(`#${controlId}`)).not.toBeNull()
  })
}

function expectNamedActions(container: HTMLElement) {
  const buttons = Array.from(container.querySelectorAll('button'))

  expect(buttons.length).toBeGreaterThan(0)
  buttons.forEach((button) => {
    expect(
      button.textContent?.trim() || button.getAttribute('aria-label'),
    ).toBeTruthy()
  })
}

afterEach(() => {
  mounted.forEach(({ container, root }) => {
    act(() => root.unmount())
    container.remove()
  })
  mounted = []
  vi.clearAllMocks()
})

describe('acessibilidade dos formularios de produtos', () => {
  it('associa os campos do cadastro a labels, ajuda e ações nomeadas', () => {
    const container = renderForm(
      <ProductForm onSubmit={vi.fn()} />,
    )

    expectEveryExplicitLabelHasControl(container)
    expectNamedActions(container)
    expect(container.querySelector('input[type="file"]')?.getAttribute('aria-label')).toBe(
      'Selecionar imagem do produto',
    )
    expect(container.querySelector('input[type="checkbox"]')?.closest('label')).not.toBeNull()
  })

  it('mantem campos associados nos fluxos de entrada, ajuste e venda', () => {
    const forms = [
      <StockEntryForm
        key="entry"
        averageCost={62}
        currentStock={1}
        onSubmit={vi.fn()}
        productOptions={productOptions}
      />,
      <StockMovementForm
        key="movement"
        averageCost={62}
        currentStock={1}
        onSubmit={vi.fn()}
        productOptions={productOptions}
      />,
      <StockSaleForm
        key="sale"
        averageCost={62}
        currentStock={1}
        onSubmit={vi.fn()}
        productOptions={productOptions}
      />,
    ]

    forms.forEach((form) => {
      const container = renderForm(form)

      expectEveryExplicitLabelHasControl(container)
      expectNamedActions(container)
    })
  })
})
