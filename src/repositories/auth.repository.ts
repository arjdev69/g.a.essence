import { supabaseClient } from '../services/supabase/supabaseClient'
import type { SignInInput } from '../features/auth/auth.types'
import type { User } from '@supabase/supabase-js'

export const authRepository = {
  async signIn(input: SignInInput): Promise<void> {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    })

    if (error) {
      throw error
    }
  },

  async signOut(): Promise<void> {
    const { error } = await supabaseClient.auth.signOut({ scope: 'local' })

    if (error) {
      throw error
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
      error,
    } = await supabaseClient.auth.getUser()

    if (error) {
      return null
    }

    return user
  },
}
