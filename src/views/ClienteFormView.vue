<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ClienteForm from '../components/ClienteForm.vue'
import EstadoLista from '../components/EstadoLista.vue'
import { useClientesStore } from '../stores/clientes'
import { useAuthStore } from '../stores/auth'

// Criar (/clientes/novo) ou editar (/clientes/:id/editar)
const props = defineProps({
  id: { type: String, default: null },
})

const store = useClientesStore()
const auth = useAuthStore()
const router = useRouter()

const editando = computed(() => props.id !== null)
const cliente = computed(() => (editando.value ? store.buscarPorId(props.id) : null))
const semPermissao = computed(() => editando.value && cliente.value && !auth.ehDono(cliente.value))

onMounted(() => {
  document.title = `${editando.value ? 'Editar' : 'Novo'} cliente | Contábil Organizado`
  if (editando.value) store.carregarSeNecessario()
})

async function salvar(dados) {
  const resultado = editando.value ? await store.atualizar(props.id, dados) : await store.criar(dados)
  if (resultado) router.push({ name: 'clientes' })
}
</script>

<template>
  <div>
    <v-btn :to="{ name: 'clientes' }" variant="text" prepend-icon="mdi-arrow-left" class="mb-4">Voltar</v-btn>
    <h1 class="text-h4 mb-4">{{ editando ? 'Editar cliente' : 'Novo cliente' }}</h1>

    <ClienteForm
      v-if="!editando"
      :salvando="store.salvando"
      @salvar="salvar"
      @cancelar="router.push({ name: 'clientes' })"
    />

    <EstadoLista v-else :carregando="store.carregando" :erro="store.erro" @tentar-novamente="store.carregar">
      <v-alert
        v-if="semPermissao"
        type="error"
        variant="tonal"
        title="Sem permissão"
        text="Só o dono do cadastro pode editá-lo."
      />
      <ClienteForm
        v-else-if="cliente"
        :key="cliente.id"
        :cliente="cliente"
        :salvando="store.salvando"
        @salvar="salvar"
        @cancelar="router.push({ name: 'clientes' })"
      />
      <v-alert
        v-else-if="store.carregado"
        type="warning"
        variant="tonal"
        title="Cliente não encontrado"
        :text="`Não existe cliente com o código ${id}.`"
      />
    </EstadoLista>
  </div>
</template>
