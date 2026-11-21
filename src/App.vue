<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useAuthStore } from './stores/auth'
import { useNotificacoesStore } from './stores/notificacoes'

const links = [
  { titulo: 'Início', to: '/', icone: 'mdi-home-outline' },
  { titulo: 'Clientes', to: '/clientes', icone: 'mdi-domain' },
  { titulo: 'Documentos', to: '/documentos', icone: 'mdi-folder-outline' },
  { titulo: 'Vencimentos', to: '/vencimentos', icone: 'mdi-calendar-clock-outline' },
]

// Responsivo: em telas pequenas o menu vira uma gaveta lateral
const { mobile } = useDisplay()
const gaveta = ref(false)

const auth = useAuthStore()
const notificacoes = useNotificacoesStore()
const router = useRouter()

onMounted(() => auth.iniciar())

// O snackbar abre quando há uma notificação e limpa ao fechar
const notificacaoVisivel = computed({
  get: () => notificacoes.atual !== null,
  set: (aberto) => {
    if (!aberto) notificacoes.limpar()
  },
})

async function sair() {
  await auth.sair()
  notificacoes.notificar('Você saiu da conta.', 'info')
  router.push('/')
}
</script>

<template>
  <v-app>
    <v-navigation-drawer v-if="mobile" v-model="gaveta" temporary>
      <v-list nav>
        <v-list-item
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          :prepend-icon="link.icone"
          :title="link.titulo"
          exact
        />
        <v-list-item to="/documentos/novo" prepend-icon="mdi-plus" title="Novo documento" />
        <v-divider class="my-2" />
        <v-list-item
          v-if="auth.logado"
          prepend-icon="mdi-logout"
          :title="`Sair (${auth.email})`"
          @click="sair"
        />
        <v-list-item v-else to="/login" prepend-icon="mdi-login" title="Entrar" />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar color="primary" flat>
      <v-app-bar-nav-icon v-if="mobile" @click="gaveta = !gaveta" />
      <v-app-bar-title>
        <v-icon icon="mdi-calculator-variant-outline" class="mr-2" />
        Contábil Organizado
      </v-app-bar-title>

      <template v-if="!mobile">
        <v-btn
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          :prepend-icon="link.icone"
          exact
        >
          {{ link.titulo }}
        </v-btn>
        <v-btn variant="outlined" prepend-icon="mdi-plus" class="mx-2" to="/documentos/novo">
          Novo documento
        </v-btn>
        <v-btn v-if="auth.logado" prepend-icon="mdi-logout" @click="sair">
          Sair
        </v-btn>
        <v-btn v-else prepend-icon="mdi-login" to="/login">Entrar</v-btn>
      </template>
      <v-btn v-else icon="mdi-plus" to="/documentos/novo" aria-label="Novo documento" />
    </v-app-bar>

    <v-main>
      <v-container>
        <router-view />
      </v-container>
    </v-main>

    <v-snackbar v-model="notificacaoVisivel" :color="notificacoes.atual?.cor" timeout="3500">
      {{ notificacoes.atual?.texto }}
    </v-snackbar>

    <v-footer class="justify-center text-center text-caption text-medium-emphasis">
      Desenvolvido por Hellielton Reis · Avaliação 3 · Vue 3 + Express + Supabase
    </v-footer>
  </v-app>
</template>
