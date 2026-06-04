import { useState } from 'react'
import { useNavigate } from 'react-router'
import { authRepository } from '../../repositories/auth.repository'

export function useLogout() {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function signOut() {
    setErrorMessage(null)
    setIsLoggingOut(true)

    try {
      await authRepository.signOut()
      navigate('/login', { replace: true })
    } catch {
      setErrorMessage('Nao foi possivel sair. Tente novamente.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return {
    errorMessage,
    isLoggingOut,
    signOut,
  }
}
