import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '../stores/auth'

// Guard de rota: o :id precisa ser um número. Se não for (ex.: /documentos/abc),
// a navegação é desviada para a página 404.
function validarId(to) {
  if (/^\d+$/.test(to.params.id)) return true
  return {
    name: 'not-found',
    params: { pathMatch: to.path.substring(1).split('/') },
    query: to.query,
    hash: to.hash,
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/documentos',
      name: 'documentos',
      component: () => import('../views/DocumentosView.vue'),
    },
    {
      // Formulário de criação
      path: '/documentos/novo',
      name: 'documento-novo',
      meta: { requerLogin: true },
      component: () => import('../views/DocumentoFormView.vue'),
    },
    {
      // Rota com parâmetro dinâmico: /documentos/3
      path: '/documentos/:id',
      name: 'documento-detalhe',
      component: () => import('../views/DocumentoDetalheView.vue'),
      props: true,
      beforeEnter: validarId,
    },
    {
      // Formulário de edição: /documentos/3/editar
      path: '/documentos/:id/editar',
      name: 'documento-editar',
      meta: { requerLogin: true },
      component: () => import('../views/DocumentoFormView.vue'),
      props: true,
      beforeEnter: validarId,
    },
    {
      path: '/clientes',
      name: 'clientes',
      component: () => import('../views/ClientesView.vue'),
    },
    {
      path: '/clientes/novo',
      name: 'cliente-novo',
      component: () => import('../views/ClienteFormView.vue'),
      meta: { requerLogin: true },
    },
    {
      path: '/clientes/:id/editar',
      name: 'cliente-editar',
      component: () => import('../views/ClienteFormView.vue'),
      props: true,
      meta: { requerLogin: true },
      beforeEnter: validarId,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      // Rota própria do domínio: painel de vencimentos
      path: '/vencimentos',
      name: 'vencimentos',
      component: () => import('../views/VencimentosView.vue'),
    },
    {
      // Rota 404: captura qualquer caminho que não existe
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

// Guard global: rotas com meta.requerLogin só abrem para quem está logado.
// Quem não está vai para /login e volta para onde queria ir depois de entrar.
router.beforeEach(async (to) => {
  if (!to.meta.requerLogin) return true
  const auth = useAuthStore()
  await auth.iniciar()
  if (auth.logado) return true
  return { name: 'login', query: { redirect: to.fullPath } }
})

export default router
