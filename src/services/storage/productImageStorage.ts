import { supabaseClient } from '../supabase/supabaseClient'

const productImageBucket = 'product-images'
const maxProductImageSizeBytes = 5 * 1024 * 1024
const allowedProductImageTypes = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
])

function getRequiredUserId() {
  return supabaseClient.auth.getUser().then(({ data: { user }, error }) => {
    if (error || !user) {
      throw error ?? new Error('Usuario autenticado nao encontrado.')
    }

    return user.id
  })
}

function createProductImageId() {
  const browserCrypto = globalThis.crypto

  if (browserCrypto?.randomUUID) {
    return browserCrypto.randomUUID()
  }

  const bytes = new Uint8Array(16)

  if (browserCrypto?.getRandomValues) {
    browserCrypto.getRandomValues(bytes)
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256)
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'))

  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-')
}

function getFileExtension(file: File) {
  if (file.type === 'image/png') {
    return 'png'
  }

  if (file.type === 'image/webp') {
    return 'webp'
  }

  if (file.type === 'image/jpeg') {
    return 'jpg'
  }

  const fileNameExtension = file.name.split('.').pop()?.toLowerCase()

  return fileNameExtension && fileNameExtension.length <= 5
    ? fileNameExtension
    : 'img'
}

function extractProductImagePath(imageUrl: string) {
  try {
    const url = new URL(imageUrl)
    const marker = `/storage/v1/object/public/${productImageBucket}/`
    const pathStartIndex = url.pathname.indexOf(marker)

    if (pathStartIndex < 0) {
      return null
    }

    const relativePath = url.pathname.slice(pathStartIndex + marker.length)

    return relativePath ? decodeURIComponent(relativePath) : null
  } catch {
    return null
  }
}

export function validateProductImageFile(file: File) {
  if (!allowedProductImageTypes.has(file.type)) {
    return 'Use uma imagem PNG, JPG ou WEBP.'
  }

  if (file.size > maxProductImageSizeBytes) {
    return 'A imagem deve ter no maximo 5 MB.'
  }

  return null
}

export async function uploadProductImage(file: File): Promise<{
  imagePath: string
  imageUrl: string
}> {
  const userId = await getRequiredUserId()
  const imagePath = `${userId}/${createProductImageId()}.${getFileExtension(file)}`

  const { error } = await supabaseClient.storage
    .from(productImageBucket)
    .upload(imagePath, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    throw error
  }

  return {
    imagePath,
    imageUrl: supabaseClient.storage.from(productImageBucket).getPublicUrl(imagePath)
      .data.publicUrl,
  }
}

export async function deleteProductImageByUrl(imageUrl: string) {
  const imagePath = extractProductImagePath(imageUrl)

  if (!imagePath) {
    return
  }

  const { error } = await supabaseClient.storage
    .from(productImageBucket)
    .remove([imagePath])

  if (error) {
    throw error
  }
}
