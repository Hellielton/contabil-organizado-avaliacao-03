import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const chave = import.meta.env.VITE_SUPABASE_ANON_KEY

// A chave "anon" é pública por projeto: pode ficar no front-end.
// (O que nunca vai para o front é a senha do banco nem a service_role.)
export const supabaseConfigurado = Boolean(url && chave)

export const supabase = createClient(url || 'http://localhost', chave || 'sem-chave')
