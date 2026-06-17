type DownloadFileInput = {
  filename: string
  content: BlobPart
  mimeType?: string
  openAfterDownload?: boolean
}

export function downloadFile({
  filename,
  content,
  openAfterDownload = false,
  mimeType = 'application/octet-stream',
}: DownloadFileInput) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)

  if (openAfterDownload) {
    window.open(url, '_blank', 'noopener,noreferrer')
  } else {
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = filename
    anchor.click()
  }

  URL.revokeObjectURL(url)
}
