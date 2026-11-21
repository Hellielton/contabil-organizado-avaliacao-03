import { defineStore } from 'pinia'
import { ref } from 'vue'

// Mensagem rápida (snackbar) compartilhada por todas as stores.
export const useNotificacoesStore = defineStore('notificacoes', () => {
  const atual = ref(null) // { texto, cor }

  function notificar(texto, cor = 'success') {
    atual.value = { texto, cor }
  }

  function limpar() {
    atual.value = null
  }

  return { atual, notificar, limpar }
})
