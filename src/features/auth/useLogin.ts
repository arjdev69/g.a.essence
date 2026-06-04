import { useState } from 'react'
import { useNavigate } from 'react-router'
import { authRepository } from '../../repositories/auth.repository'
import type { SignInInput } from './auth.types'

const invalidCredentialsMessage = 'E-mail ou senha invalidos.'

export function useLogin() {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function signIn(input: SignInInput) {
    setErrorMessage(null)

    try {
      await authRepository.signIn(input)
      navigate('/dashboard', { replace: true })
    } catch {
      setErrorMessage(invalidCredentialsMessage)
    }
  }

  return {
    errorMessage,
    signIn,
  }
}
