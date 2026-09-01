import { Download } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../components/ui'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

function isRunningAsInstalledApp() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function InstallPwaButton() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(() =>
    isRunningAsInstalledApp(),
  )

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }

    function handleAppInstalled() {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    const displayModeQuery = window.matchMedia('(display-mode: standalone)')
    const handleDisplayModeChange = () => {
      setIsInstalled(isRunningAsInstalledApp())
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    displayModeQuery.addEventListener('change', handleDisplayModeChange)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      displayModeQuery.removeEventListener('change', handleDisplayModeChange)
    }
  }, [])

  async function handleInstallClick() {
    if (!installPrompt) {
      window.alert(
        'Para instalar, use a opcao "Instalar app" ou "Adicionar a tela inicial" do seu navegador.',
      )
      return
    }

    const promptEvent = installPrompt
    setInstallPrompt(null)

    await promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice

    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
  }

  if (isInstalled) {
    return null
  }

  return (
    <Button
      aria-label="Instalar app"
      className="min-h-11 rounded-md px-3"
      icon={<Download className="h-4 w-4" aria-hidden="true" />}
      onClick={handleInstallClick}
      title="Instalar app"
      variant="secondary"
    >
      <span className="hidden sm:inline">Instalar app</span>
      <span className="sm:hidden">Instalar</span>
    </Button>
  )
}
