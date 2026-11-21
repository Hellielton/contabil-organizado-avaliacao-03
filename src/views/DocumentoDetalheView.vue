<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import StatusChip from '../components/StatusChip.vue'
import VencimentoChip from '../components/VencimentoChip.vue'
import EstadoLista from '../components/EstadoLista.vue'
import { useDocumentosStore } from '../stores/documentos'
import { useAuthStore } from '../stores/auth'
import { statusDocumento, statusInfo } from '../data/documentos'
import { formatarMoeda, formatarCompetencia, formatarData } from '../utils/formatadores'

// O parâmetro dinâmico :id da rota chega como prop (props: true no router)
const props = defineProps({
  id: { type: String, required: true },
})

const store = useDocumentosStore()
const auth = useAuthStore()
const router = useRouter()

const documento = computed(() => store.buscarPorId(props.id))
const confirmandoExclusao = ref(false)
const podeEditar = computed(() => auth.ehDono(documento.value))

const itensStatus = statusDocumento.map((valor) => ({
  title: statusInfo[valor].rotulo,
  value: valor,
}))

onMounted(() => store.carregarSeNecessario())

watch(
  documento,
  (doc) => {
    document.title = doc ? `${doc.numero} | Contábil Organizado` : 'Documento | Contábil Organizado'
  },
  { immediate: true },
)

async function excluir() {
  confirmandoExclusao.value = false
  const excluido = await store.remover(props.id)
  if (excluido) router.push({ name: 'documentos' })
}
</script>

<template>
  <div>
    <v-btn to="/documentos" variant="text" prepend-icon="mdi-arrow-left" class="mb-4">
      Voltar para documentos
    </v-btn>

    <EstadoLista
      :carregando="store.carregando"
      :erro="store.erro"
      @tentar-novamente="store.carregar"
    >
      <v-card v-if="documento">
        <v-card-item>
          <v-card-title class="text-h5">{{ documento.numero }}</v-card-title>
          <v-card-subtitle>{{ documento.tipo }}</v-card-subtitle>
          <template #append>
            <StatusChip :status="documento.status" />
          </template>
        </v-card-item>

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-list density="compact">
                <v-list-item title="Cliente" :subtitle="documento.cliente" />
                <v-list-item title="Competência" :subtitle="formatarCompetencia(documento.competencia)" />
                <v-list-item title="Data do documento" :subtitle="formatarData(documento.data)" />
                <v-list-item title="Vencimento" :subtitle="formatarData(documento.vencimento)">
                  <template #append>
                    <VencimentoChip :documento="documento" />
                  </template>
                </v-list-item>
                <v-list-item title="Valor" :subtitle="formatarMoeda(documento.valor)" />
              </v-list>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                :disabled="!podeEditar"
                :hint="podeEditar ? '' : 'Somente o dono pode alterar o status'"
                :persistent-hint="!podeEditar"
                :model-value="documento.status"
                :items="itensStatus"
                label="Status"
                @update:model-value="(novo) => store.mudarStatus(documento.id, novo)"
              />
              <div class="text-subtitle-2 mb-1">Observações</div>
              <p class="text-medium-emphasis">{{ documento.observacoes || 'Sem observações.' }}</p>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions v-if="podeEditar">
          <v-btn
            color="primary"
            variant="tonal"
            prepend-icon="mdi-pencil-outline"
            :to="{ name: 'documento-editar', params: { id: documento.id } }"
          >
            Editar
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            prepend-icon="mdi-delete-outline"
            @click="confirmandoExclusao = true"
          >
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-alert
        v-else-if="store.carregado"
        type="warning"
        variant="tonal"
        title="Documento não encontrado"
      >
        Não existe documento com o código {{ id }}.
      </v-alert>
    </EstadoLista>

    <v-dialog v-model="confirmandoExclusao" max-width="420">
      <v-card title="Excluir documento?">
        <v-card-text>Esta ação não pode ser desfeita.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmandoExclusao = false">Cancelar</v-btn>
          <v-btn color="error" variant="flat" :loading="store.salvando" @click="excluir">Excluir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
