<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DocumentoForm from '../components/DocumentoForm.vue'
import EstadoLista from '../components/EstadoLista.vue'
import { useDocumentosStore } from '../stores/documentos'
import { useClientesStore } from '../stores/clientes'
import { useAuthStore } from '../stores/auth'

// Mesma tela para criar (rota /documentos/novo, sem id) e editar (/documentos/:id/editar)
const props = defineProps({
  id: { type: String, default: null },
})

const store = useDocumentosStore()
const clientesStore = useClientesStore()
const auth = useAuthStore()
const router = useRouter()

const editando = computed(() => props.id !== null)
const documento = computed(() => (editando.value ? store.buscarPorId(props.id) : null))

// Só dá para vincular o documento a clientes que são do próprio usuário
const meusClientes = computed(() => clientesStore.itens.filter((c) => auth.ehDono(c)))
const semPermissao = computed(() => editando.value && documento.value && !auth.ehDono(documento.value))
const semClientes = computed(() => clientesStore.carregado && meusClientes.value.length === 0)

const rotaVoltar = computed(() =>
  editando.value ? { name: 'documento-detalhe', params: { id: props.id } } : { name: 'documentos' },
)

onMounted(() => {
  document.title = `${editando.value ? 'Editar' : 'Novo'} documento | Contábil Organizado`
  clientesStore.carregarSeNecessario()
  if (editando.value) store.carregarSeNecessario()
})

async function salvar(dados) {
  if (editando.value) {
    // PUT substitui o documento inteiro, então o status atual é enviado junto
    const atualizado = await store.atualizar(props.id, { ...dados, status: documento.value.status })
    if (atualizado) router.push({ name: 'documento-detalhe', params: { id: props.id } })
  } else {
    const novo = await store.criar(dados)
    if (novo) router.push({ name: 'documento-detalhe', params: { id: novo.id } })
  }
}
</script>

<template>
  <div>
    <v-btn :to="rotaVoltar" variant="text" prepend-icon="mdi-arrow-left" class="mb-4">Voltar</v-btn>
    <h1 class="text-h4 mb-4">{{ editando ? 'Editar documento' : 'Novo documento' }}</h1>

    <v-alert
      v-if="semClientes && !semPermissao"
      type="info"
      variant="tonal"
      class="mb-4"
      title="Cadastre um cliente primeiro"
      text="Todo documento pertence a um cliente. Você ainda não tem clientes cadastrados."
    >
      <v-btn class="mt-2" size="small" variant="outlined" :to="{ name: 'cliente-novo' }">Cadastrar cliente</v-btn>
    </v-alert>

    <DocumentoForm
      v-if="!editando && !semClientes"
      :salvando="store.salvando"
      :clientes="meusClientes"
      @salvar="salvar"
      @cancelar="router.push(rotaVoltar)"
    />

    <EstadoLista
      v-else
      :carregando="store.carregando"
      :erro="store.erro"
      @tentar-novamente="store.carregar"
    >
      <v-alert
        v-if="semPermissao"
        type="error"
        variant="tonal"
        title="Sem permissão"
        text="Só o dono do documento pode editá-lo."
      />
      <DocumentoForm
        v-else-if="documento"
        :key="documento.id"
        :documento="documento"
        :clientes="meusClientes"
        :salvando="store.salvando"
        @salvar="salvar"
        @cancelar="router.push(rotaVoltar)"
      />
      <v-alert
        v-else-if="store.carregado"
        type="warning"
        variant="tonal"
        title="Documento não encontrado"
        :text="`Não existe documento com o código ${id}.`"
      />
    </EstadoLista>
  </div>
</template>
