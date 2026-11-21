<script setup>
import StatusChip from './StatusChip.vue'
import VencimentoChip from './VencimentoChip.vue'
import { formatarMoeda, formatarCompetencia, formatarData } from '../utils/formatadores'

defineProps({
  documento: { type: Object, required: true },
  editavel: { type: Boolean, default: false }, // só o dono vê o botão de avançar status
})

const emit = defineEmits(['avancar-status'])
</script>

<template>
  <v-card variant="outlined" class="h-100 d-flex flex-column">
    <v-card-item>
      <template #prepend>
        <v-icon icon="mdi-file-document-outline" color="primary" />
      </template>
      <v-card-title>{{ documento.numero }}</v-card-title>
      <v-card-subtitle>{{ documento.tipo }} · {{ documento.cliente }}</v-card-subtitle>
    </v-card-item>

    <v-card-text>
      <div class="d-flex justify-space-between align-center mb-2">
        <StatusChip :status="documento.status" />
        <span class="text-medium-emphasis text-body-2">
          Competência {{ formatarCompetencia(documento.competencia) }}
        </span>
      </div>
      <div class="text-h6">{{ formatarMoeda(documento.valor) }}</div>
      <div class="d-flex align-center ga-2 mt-2">
        <VencimentoChip :documento="documento" />
        <span v-if="documento.vencimento" class="text-caption text-medium-emphasis">
          Venc. {{ formatarData(documento.vencimento) }}
        </span>
      </div>
    </v-card-text>

    <v-spacer />

    <v-card-actions>
      <v-btn
        :to="{ name: 'documento-detalhe', params: { id: documento.id } }"
        variant="text"
        color="primary"
      >
        Detalhes
      </v-btn>
      <v-spacer />
      <v-btn
        v-if="editavel && documento.status !== 'arquivado'"
        variant="tonal"
        size="small"
        @click="emit('avancar-status', documento.id)"
      >
        {{ documento.status === 'pendente' ? 'Marcar conferido' : 'Arquivar' }}
      </v-btn>
      <span v-else-if="documento.status === 'arquivado'" class="text-caption text-medium-emphasis pr-2">Concluído</span>
    </v-card-actions>
  </v-card>
</template>
