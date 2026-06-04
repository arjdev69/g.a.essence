import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { LoadingState } from '../../components/ui/LoadingState'
import { authRepository } from '../../repositories/auth.repository'

type ProtectedRouteProps = {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied'>(
    'checking',
  )

  useEffect(() => {
    let isActive = true

    async function checkUser() {
      const user = await authRepository.getCurrentUser()

      if (!isActive) {
        return
      }

      setStatus(user ? 'allowed' : 'denied')
    }

    void checkUser()

    return () => {
      isActive = false
    }
  }, [])

  if (status === 'checking') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 p-6 text-zinc-950">
        <div className="w-full max-w-sm">
          <LoadingState label="Carregando sessao..." rows={3} variant="form" />
        </div>
      </main>
    )
  }

  if (status === 'denied') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
