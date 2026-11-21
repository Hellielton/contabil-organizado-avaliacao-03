<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  document.title = 'Página não encontrada | Contábil Organizado'
})
</script>

<template>
  <div class="text-center py-12">
    <v-icon icon="mdi-file-question-outline" size="96" color="secondary" />
    <h1 class="text-h4 mt-4 mb-2">404 — Página não encontrada</h1>
    <p class="text-medium-emphasis mb-6">O endereço que você tentou acessar não existe.</p>
    <v-btn to="/" color="primary" prepend-icon="mdi-home-outline">Voltar ao início</v-btn>
  </div>
</template>
