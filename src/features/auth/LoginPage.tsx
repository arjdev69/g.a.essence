import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { loginSchema, type LoginFormData } from './login.schema'
import { useLogin } from './useLogin'

export function LoginPage() {
  const { errorMessage, signIn } = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function handleLogin(input: LoginFormData) {
    await signIn(input)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-10 text-zinc-950">
      <section className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-medium text-emerald-700">G.A Essencia</p>
          <h1 className="mt-3 text-2xl font-semibold">Entrar</h1>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(handleLogin)}>
          {errorMessage ? (
            <p
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {errorMessage}
            </p>
          ) : null}

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-800" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />
            {errors.email ? (
              <p className="text-sm text-red-700" id="email-error">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-zinc-800"
              htmlFor="password"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
              {...register('password')}
            />
            {errors.password ? (
              <p className="text-sm text-red-700" id="password-error">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            Entrar
          </button>
        </form>
      </section>
    </main>
  )
}
