<script setup>
import { computed } from 'vue'
import { situacaoVencimento } from '../utils/vencimento'

const props = defineProps({
  documento: { type: Object, required: true },
})

const situacao = computed(() => situacaoVencimento(props.documento))
</script>

<template>
  <v-chip :color="situacao.cor" :prepend-icon="situacao.icone" size="small" variant="tonal">
    {{ situacao.rotulo }}
  </v-chip>
</template>
