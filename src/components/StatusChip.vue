<script setup>
import { computed } from 'vue'
import { statusInfo } from '../data/documentos'

const props = defineProps({
  status: { type: String, required: true },
})

const info = computed(() => statusInfo[props.status])
</script>

<template>
  <v-chip :color="info.cor" :prepend-icon="info.icone" size="small" variant="tonal">
    {{ info.rotulo }}
  </v-chip>
</template>
