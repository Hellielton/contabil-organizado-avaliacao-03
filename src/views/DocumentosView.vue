<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import FiltrosDocumentos from '../components/FiltrosDocumentos.vue'
import DocumentoCard from '../components/DocumentoCard.vue'
import EstadoLista from '../components/EstadoLista.vue'
import { useDocumentosStore } from '../stores/documentos'
import { useAuthStore } from '../stores/auth'

const store = useDocumentosStore()
const auth = useAuthStore()
const route = useRoute()

// /documentos?cliente=Nome (vindo da tela de clientes) já abre filtrado
const busca = ref(typeof route.query.cliente === 'string' ? route.query.cliente : '')
const tipo = ref(null)
const status = ref(null)

const documentosFiltrados = computed(() => {
  const termo = (busca.value ?? '').toLowerCase().trim()
  return store.itens.filter((doc) => {
    const bateBusca =
      !termo || doc.numero.toLowerCase().includes(termo) || doc.cliente.toLowerCase().includes(termo)
    const bateTipo = !tipo.value || doc.tipo === tipo.value
    const bateStatus = !status.value || doc.status === status.value
    return bateBusca && bateTipo && bateStatus
  })
})

onMounted(() => {
  document.title = 'Documentos | Contábil Organizado'
  store.carregarSeNecessario()
})
</script>

<template>
  <div>
    <div class="d-flex align-center flex-wrap ga-2 mb-4">
      <h1 class="text-h4">Documentos</h1>
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-plus" to="/documentos/novo">Novo documento</v-btn>
    </div>

    <FiltrosDocumentos
      v-model:busca="busca"
      v-model:tipo="tipo"
      v-model:status="status"
      class="mb-4"
    />

    <!-- Três estados da listagem: carregando, erro e vazio -->
    <EstadoLista
      :carregando="store.carregando"
      :erro="store.erro"
      :vazio="store.carregado && store.total === 0"
      mensagem-vazia="Nenhum documento cadastrado ainda. Clique em Novo documento para começar."
      @tentar-novamente="store.carregar"
    >
      <p class="text-medium-emphasis mb-4">
        {{ documentosFiltrados.length }} de {{ store.total }} documentos
      </p>

      <v-row v-if="documentosFiltrados.length">
        <v-col v-for="doc in documentosFiltrados" :key="doc.id" cols="12" sm="6" md="4">
          <DocumentoCard :documento="doc" :editavel="auth.ehDono(doc)" @avancar-status="store.avancarStatus" />
        </v-col>
      </v-row>
      <v-alert
        v-else
        type="warning"
        variant="tonal"
        text="Nenhum documento encontrado com esses filtros."
      />
    </EstadoLista>
  </div>
</template>
