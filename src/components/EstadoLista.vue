<script setup>
// Mostra os três estados de uma tela que consome API:
// carregando, erro (com botão para tentar de novo) e vazio.
// Quando nenhum deles se aplica, mostra o conteúdo (slot).
defineProps({
  carregando: { type: Boolean, default: false },
  erro: { type: String, default: null },
  vazio: { type: Boolean, default: false },
  mensagemVazia: { type: String, default: 'Nenhum registro encontrado.' },
})

const emit = defineEmits(['tentar-novamente'])
</script>

<template>
  <div v-if="carregando" class="py-8 text-center">
    <v-progress-circular indeterminate color="primary" size="48" />
    <p class="text-medium-emphasis mt-4">Carregando...</p>
  </div>

  <v-alert v-else-if="erro" type="error" variant="tonal" title="Não foi possível carregar os dados">
    <p>{{ erro }}</p>
    <v-btn
      class="mt-3"
      variant="outlined"
      size="small"
      prepend-icon="mdi-refresh"
      @click="emit('tentar-novamente')"
    >
      Tentar novamente
    </v-btn>
  </v-alert>

  <v-alert v-else-if="vazio" type="info" variant="tonal" :text="mensagemVazia" />

  <slot v-else />
</template>
