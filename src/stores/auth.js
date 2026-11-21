import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, supabaseConfigurado } from '../services/supabase'

// Traduz as mensagens mais comuns do Supabase Auth
function traduzir(erro) {
  const m = (erro?.message ?? '').toLowerCase()
  if (m.includes('invalid login')) return 'E-mail ou senha incorretos.'
  if (m.includes('already registered')) return 'Este e-mail já está cadastrado.'
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar (veja sua caixa de entrada).'
  if (m.includes('password should be')) return 'A senha deve ter pelo menos 6 caracteres.'
  if (m.includes('rate limit')) return 'Muitas tentativas. Aguarde um pouco e tente de novo.'
  if (m.includes('fetch')) return 'Não foi possível falar com o Supabase. Verifique a conexão.'
  return erro?.message ?? 'Erro inesperado de autenticação.'
}

export const useAuthStore = defineStore('auth', () => {
  const sessao = ref(null)
  const pronto = ref(false) // a sessão salva já foi lida?
  const carregando = ref(false)
  let iniciando = null

  const logado = computed(() => sessao.value !== null)
  const usuarioId = computed(() => sessao.value?.user?.id ?? null)
  const email = computed(() => sessao.value?.user?.email ?? null)

  // Lê a sessão salva no navegador (uma vez só) e passa a acompanhar mudanças.
  function iniciar() {
    if (!iniciando) {
      iniciando = (async () => {
        try {
          if (supabaseConfigurado) {
            const { data } = await supabase.auth.getSession()
            sessao.value = data.session
            supabase.auth.onAuthStateChange((_evento, nova) => {
              sessao.value = nova
            })
          }
        } catch {
          sessao.value = null
        } finally {
          pronto.value = true
        }
      })()
    }
    return iniciando
  }

  // Devolve { ok, mensagem }
  async function executar(acao) {
    if (!supabaseConfigurado) {
      return { ok: false, mensagem: 'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.' }
    }
    carregando.value = true
    try {
      const { data, error } = await acao()
      if (error) return { ok: false, mensagem: traduzir(error) }
      return { ok: true, data }
    } catch (e) {
      return { ok: false, mensagem: traduzir(e) }
    } finally {
      carregando.value = false
    }
  }

  async function entrar(emailInformado, senha) {
    const r = await executar(() => supabase.auth.signInWithPassword({ email: emailInformado, password: senha }))
    return { ok: r.ok, mensagem: r.mensagem }
  }

  async function cadastrar(emailInformado, senha) {
    const r = await executar(() => supabase.auth.signUp({ email: emailInformado, password: senha }))
    if (!r.ok) return { ok: false, mensagem: r.mensagem }
    // Se o projeto exige confirmação de e-mail, não vem sessão
    return { ok: true, precisaConfirmar: !r.data.session }
  }

  async function sair() {
    await supabase.auth.signOut()
    sessao.value = null
  }

  // Regra de interface (a regra de verdade está na API): só o dono edita/exclui.
  function ehDono(registro) {
    return logado.value && registro?.usuarioId === usuarioId.value
  }

  // Token enviado à API no cabeçalho Authorization
  function token() {
    return sessao.value?.access_token ?? null
  }

  return { sessao, pronto, carregando, logado, usuarioId, email, iniciar, entrar, cadastrar, sair, ehDono, token }
})
