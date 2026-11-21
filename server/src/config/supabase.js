import { createClient } from '@supabase/supabase-js'

// Cliente do Supabase usado só para conferir tokens de login (supabase.auth.getUser).
// A chave "anon" é pública por definição; ela não dá acesso ao banco.
export function criarClienteSupabase({ supabaseUrl, supabaseAnonKey }) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
