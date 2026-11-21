<script setup>
import { ref, onMounted } from 'vue'
import EstadoLista from '../components/EstadoLista.vue'
import { useClientesStore } from '../stores/clientes'
import { useAuthStore } from '../stores/auth'

const store = useClientesStore()
const auth = useAuthStore()

const clienteParaExcluir = ref(null)

onMounted(() => {
  document.title = 'Clientes | Contábil Organizado'
  store.carregar() // recarrega sempre: a contagem de documentos muda em outras telas
})

async function excluir() {
  const id = clienteParaExcluir.value.id
  clienteParaExcluir.value = null
  await store.remover(id)
}
</script>

<template>
  <div>
    <div class="d-flex align-center flex-wrap ga-2 mb-4">
      <h1 class="text-h4">Clientes</h1>
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-plus" :to="{ name: 'cliente-novo' }">Novo cliente</v-btn>
    </div>

    <EstadoLista
      :carregando="store.carregando"
      :erro="store.erro"
      :vazio="store.carregado && store.total === 0"
      mensagem-vazia="Nenhum cliente cadastrado ainda. Clique em Novo cliente para começar."
      @tentar-novamente="store.carregar"
    >
      <v-table class="border rounded">
        <thead>
          <tr>
            <th>Nome</th>
            <th class="d-none d-sm-table-cell">CPF / CNPJ</th>
            <th class="d-none d-md-table-cell">E-mail</th>
            <th class="text-center">Documentos</th>
            <th class="text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in store.itens" :key="c.id">
            <td>{{ c.nome }}</td>
            <td class="d-none d-sm-table-cell">{{ c.documentoFiscal ?? '—' }}</td>
            <td class="d-none d-md-table-cell">{{ c.email ?? '—' }}</td>
            <td class="text-center">
              <v-btn
                variant="text"
                size="small"
                :to="{ name: 'documentos', query: { cliente: c.nome } }"
                :aria-label="`Ver documentos de ${c.nome}`"
              >
                {{ c.totalDocumentos }}
              </v-btn>
            </td>
            <td class="text-right text-no-wrap">
              <template v-if="auth.ehDono(c)">
                <v-btn
                  icon="mdi-pencil-outline"
                  size="small"
                  variant="text"
                  :to="{ name: 'cliente-editar', params: { id: c.id } }"
                  :aria-label="`Editar ${c.nome}`"
                />
                <v-btn
                  icon="mdi-delete-outline"
                  size="small"
                  variant="text"
                  color="error"
                  :aria-label="`Excluir ${c.nome}`"
                  @click="clienteParaExcluir = c"
                />
              </template>
              <span v-else class="text-caption text-medium-emphasis">somente leitura</span>
            </td>
          </tr>
        </tbody>
      </v-table>
    </EstadoLista>

    <v-dialog :model-value="clienteParaExcluir !== null" max-width="440" @update:model-value="clienteParaExcluir = null">
      <v-card title="Excluir cliente?">
        <v-card-text>
          <strong>{{ clienteParaExcluir?.nome }}</strong> será removido. Se o cliente tiver documentos, a
          exclusão é bloqueada: exclua os documentos antes.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="clienteParaExcluir = null">Cancelar</v-btn>
          <v-btn color="error" variant="flat" :loading="store.salvando" @click="excluir">Excluir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
