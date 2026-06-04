import { useLogout } from './useLogout'

export function LogoutButton() {
  const { errorMessage, isLoggingOut, signOut } = useLogout()

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={signOut}
        disabled={isLoggingOut}
        className="h-10 w-full rounded-md border border-stone-300 bg-white px-4 text-sm font-medium text-zinc-800 transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:text-stone-400"
      >
        {isLoggingOut ? 'Saindo...' : 'Sair'}
      </button>
      {errorMessage ? (
        <p className="text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
