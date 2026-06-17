import { afterEach, describe, expect, it, vi } from 'vitest'

import { downloadFile } from '../services/export'

describe('downloadFile', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('creates a blob url, triggers download and revokes the url', () => {
    const click = vi.fn()
    const open = vi.fn()
    const createElement = vi.fn().mockReturnValue({
      click,
    } as unknown as HTMLAnchorElement)
    const createObjectURL = vi.fn().mockReturnValue('blob:download-url')
    const revokeObjectURL = vi.fn()

    vi.stubGlobal('document', { createElement })
    vi.stubGlobal('URL', {
      createObjectURL,
      revokeObjectURL,
    })
    vi.stubGlobal('window', { open })

    downloadFile({
      content: 'conteudo do arquivo',
      filename: 'arquivo.txt',
      mimeType: 'text/plain;charset=utf-8',
    })

    expect(createElement).toHaveBeenCalledWith('a')
    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(click).toHaveBeenCalledTimes(1)
    expect(open).not.toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:download-url')
  })

  it('can open the file in a new tab instead of downloading it', () => {
    const open = vi.fn()
    const createObjectURL = vi.fn().mockReturnValue('blob:download-url')
    const revokeObjectURL = vi.fn()

    vi.stubGlobal('URL', {
      createObjectURL,
      revokeObjectURL,
    })
    vi.stubGlobal('window', { open })

    downloadFile({
      content: 'conteudo do arquivo',
      filename: 'agenda.ics',
      mimeType: 'text/calendar;charset=utf-8',
      openAfterDownload: true,
    })

    expect(open).toHaveBeenCalledWith(
      'blob:download-url',
      '_blank',
      'noopener,noreferrer',
    )
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:download-url')
  })
})
