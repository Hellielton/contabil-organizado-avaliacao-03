<script setup>
import { ref, computed, onMounted } from 'vue'
import StatusChip from '../components/StatusChip.vue'
import VencimentoChip from '../components/VencimentoChip.vue'
import EstadoLista from '../components/EstadoLista.vue'
import { useDocumentosStore } from '../stores/documentos'
import { situacaoVencimento } from '../utils/vencimento'
import { formatarData, formatarMoeda } from '../utils/formatadores'

const store = useDocumentosStore()

const aba = ref('todos')

// Todos os documentos com sua situação de prazo, do vencimento mais próximo ao mais distante
const itens = computed(() =>
  store.itens
    .map((doc) => ({ doc, situacao: situacaoVencimento(doc) }))
    .sort((a, b) => (a.doc.vencimento ?? '9999').localeCompare(b.doc.vencimento ?? '9999')),
)

const vencidos = computed(() => itens.value.filter((i) => i.situacao.chave === 'vencido'))
const proximos = computed(() =>
  itens.value.filter((i) => ['hoje', 'proximo'].includes(i.situacao.chave)),
)
const concluidos = computed(() => itens.value.filter((i) => i.situacao.chave === 'concluido'))

const exibidos = computed(() => {
  if (aba.value === 'vencidos') return vencidos.value
  if (aba.value === 'proximos') return proximos.value
  if (aba.value === 'concluidos') return concluidos.value
  return itens.value
})

onMounted(() => {
  document.title = 'Vencimentos | Contábil Organizado'
  store.carregarSeNecessario()
})
</script>

<template>
  <div>
    <h1 class="text-h4 mb-1">Vencimentos</h1>
    <p class="text-medium-emphasis mb-6">Acompanhe os prazos dos documentos, do mais urgente ao mais distante.</p>

    <EstadoLista
      :carregando="store.carregando"
      :erro="store.erro"
      :vazio="store.carregado && store.total === 0"
      mensagem-vazia="Nenhum documento cadastrado ainda."
      @tentar-novamente="store.carregar"
    >
      <v-row class="mb-4">
        <v-col cols="12" sm="4">
          <v-card variant="tonal" color="error">
            <v-card-text class="d-flex align-center ga-4">
              <v-icon icon="mdi-alert-circle-outline" size="40" />
              <div>
                <div class="text-h4">{{ vencidos.length }}</div>
                <div class="text-subtitle-1">Vencidos</div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card variant="tonal" color="warning">
            <v-card-text class="d-flex align-center ga-4">
              <v-icon icon="mdi-calendar-alert" size="40" />
              <div>
                <div class="text-h4">{{ proximos.length }}</div>
                <div class="text-subtitle-1">Vencem em até 7 dias</div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card variant="tonal" color="success">
            <v-card-text class="d-flex align-center ga-4">
              <v-icon icon="mdi-check-circle-outline" size="40" />
              <div>
                <div class="text-h4">{{ concluidos.length }}</div>
                <div class="text-subtitle-1">Concluídos</div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-tabs v-model="aba" color="primary" class="mb-4" show-arrows>
        <v-tab value="todos">Todos ({{ itens.length }})</v-tab>
        <v-tab value="vencidos">Vencidos ({{ vencidos.length }})</v-tab>
        <v-tab value="proximos">Próximos 7 dias ({{ proximos.length }})</v-tab>
        <v-tab value="concluidos">Concluídos ({{ concluidos.length }})</v-tab>
      </v-tabs>

      <v-table v-if="exibidos.length" hover>
        <thead>
          <tr>
            <th>Vencimento</th>
            <th>Prazo</th>
            <th>Documento</th>
            <th>Cliente</th>
            <th>Status</th>
            <th class="text-right">Valor</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in exibidos" :key="item.doc.id">
            <td>{{ formatarData(item.doc.vencimento) }}</td>
            <td><VencimentoChip :documento="item.doc" /></td>
            <td>
              {{ item.doc.numero }}
              <div class="text-caption text-medium-emphasis">{{ item.doc.tipo }}</div>
            </td>
            <td>{{ item.doc.cliente }}</td>
            <td><StatusChip :status="item.doc.status" /></td>
            <td class="text-right">{{ formatarMoeda(item.doc.valor) }}</td>
            <td>
              <v-btn
                :to="{ name: 'documento-detalhe', params: { id: item.doc.id } }"
                variant="text"
                color="primary"
                size="small"
              >
                Detalhes
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
      <v-alert v-else type="success" variant="tonal" text="Nenhum documento nesta aba." />
    </EstadoLista>
  </div>
</template>
