<script setup>
import { computed } from 'vue'
import { statusDocumento, statusInfo } from '../data/documentos'
import { formatarMoeda } from '../utils/formatadores'

const props = defineProps({
  documentos: { type: Array, required: true },
})

// Uma entrada por status, com quantidade e valor total
const resumo = computed(() =>
  statusDocumento.map((status) => {
    const doGrupo = props.documentos.filter((doc) => doc.status === status)
    return {
      status,
      ...statusInfo[status],
      quantidade: doGrupo.length,
      total: doGrupo.reduce((soma, doc) => soma + (doc.valor ?? 0), 0),
    }
  }),
)
</script>

<template>
  <v-row>
    <v-col v-for="item in resumo" :key="item.status" cols="12" sm="4">
      <v-card variant="tonal" :color="item.cor">
        <v-card-text class="d-flex align-center ga-4">
          <v-icon :icon="item.icone" size="40" />
          <div>
            <div class="text-h4">{{ item.quantidade }}</div>
            <div class="text-subtitle-1">{{ item.rotulo }}</div>
            <div class="text-caption">{{ formatarMoeda(item.total) }}</div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
