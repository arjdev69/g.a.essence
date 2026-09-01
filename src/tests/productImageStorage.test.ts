import { describe, expect, it } from 'vitest'
import { validateProductImageFile } from '../services/storage/productImageStorage'

describe('validateProductImageFile', () => {
  it('accepts png jpeg and webp files under 5 MB', () => {
    expect(
      validateProductImageFile(
        new File([new Uint8Array(1024)], 'photo.png', {
          type: 'image/png',
        }),
      ),
    ).toBeNull()

    expect(
      validateProductImageFile(
        new File([new Uint8Array(1024)], 'photo.jpg', {
          type: 'image/jpeg',
        }),
      ),
    ).toBeNull()

    expect(
      validateProductImageFile(
        new File([new Uint8Array(1024)], 'photo.webp', {
          type: 'image/webp',
        }),
      ),
    ).toBeNull()
  })

  it('rejects unsupported formats and oversized files', () => {
    expect(
      validateProductImageFile(
        new File([new Uint8Array(1024)], 'photo.gif', {
          type: 'image/gif',
        }),
      ),
    ).toBe('Use uma imagem PNG, JPG ou WEBP.')

    expect(
      validateProductImageFile(
        new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'photo.png', {
          type: 'image/png',
        }),
      ),
    ).toBe('A imagem deve ter no maximo 5 MB.')
  })
})
