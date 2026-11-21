<script setup>
import { computed, onMounted } from 'vue'
import ResumoStatus from '../components/ResumoStatus.vue'
import DocumentoCard from '../components/DocumentoCard.vue'
import EstadoLista from '../components/EstadoLista.vue'
import { useDocumentosStore } from '../stores/documentos'
import { useAuthStore } from '../stores/auth'

const store = useDocumentosStore()
const auth = useAuthStore()

// As 3 primeiras pendências para dar destaque na tela inicial
const pendencias = computed(() => store.pendentes.slice(0, 3))

onMounted(() => {
  document.title = 'Início | Contábil Organizado'
  store.carregarSeNecessario()
})
</script>

<template>
  <div>
    <h1 class="text-h4 mb-1">Organização de Documentos Contábeis</h1>
    <p class="text-medium-emphasis mb-6">
      Acompanhe notas, extratos, guias, folhas e contratos por cliente e competência.
    </p>

    <EstadoLista
      :carregando="store.carregando"
      :erro="store.erro"
      :vazio="store.carregado && store.total === 0"
      mensagem-vazia="Nenhum documento cadastrado ainda."
      @tentar-novamente="store.carregar"
    >
      <h2 class="text-h5 mb-3">Situação dos documentos</h2>
      <ResumoStatus :documentos="store.itens" class="mb-8" />

      <div class="d-flex align-center mb-3">
        <h2 class="text-h5">Pendências em destaque</h2>
        <v-spacer />
        <v-btn to="/documentos" variant="text" color="primary" append-icon="mdi-arrow-right">
          Ver todos
        </v-btn>
      </div>

      <v-row v-if="pendencias.length">
        <v-col v-for="doc in pendencias" :key="doc.id" cols="12" md="4">
          <DocumentoCard :documento="doc" :editavel="auth.ehDono(doc)" @avancar-status="store.avancarStatus" />
        </v-col>
      </v-row>
      <v-alert v-else type="success" variant="tonal" text="Nenhum documento pendente. Tudo em dia!" />
    </EstadoLista>
  </div>
</template>
