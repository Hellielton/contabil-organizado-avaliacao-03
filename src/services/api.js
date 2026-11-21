import axios from 'axios'
import { supabase, supabaseConfigurado } from './supabase'

// Instância dedicada do Axios: toda chamada à API passa por ela.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  timeout: 60000, // a API gratuita do Render pode levar ~1 min para "acordar"
})

// Interceptor de REQUISIÇÃO: anexa o token do usuário logado (Authorization: Bearer ...),
// que a API confere no Supabase Auth, e registra a chamada no console em desenvolvimento.
api.interceptors.request.use(async (config) => {
  if (supabaseConfigurado) {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  if (import.meta.env.DEV) {
    console.debug(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
  }
  return config
})

// Interceptor de RESPOSTA: transforma qualquer falha em uma mensagem legível,
// para a store e as telas não precisarem interpretar erros do Axios.
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    if (erro.code === 'ECONNABORTED') {
      erro.mensagem = 'A API demorou demais para responder.'
    } else if (!erro.response) {
      erro.mensagem = 'Não foi possível conectar à API. Verifique se o servidor está rodando (npm start na pasta server).'
    } else if (erro.response.status === 401) {
      erro.mensagem = 'Sua sessão expirou ou você não está logado. Entre novamente.'
    } else {
      erro.mensagem = erro.response.data?.mensagem ?? `Erro ${erro.response.status} ao falar com a API.`
    }
    return Promise.reject(erro)
  },
)

export default api
