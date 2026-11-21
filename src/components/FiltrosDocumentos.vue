<script setup>
import { tiposDocumento, statusDocumento, statusInfo } from '../data/documentos'

// Cada filtro é um v-model do componente pai: <FiltrosDocumentos v-model:busca="..." />
const busca = defineModel('busca', { type: String, default: '' })
const tipo = defineModel('tipo', { type: String, default: null })
const status = defineModel('status', { type: String, default: null })

const itensStatus = statusDocumento.map((valor) => ({
  title: statusInfo[valor].rotulo,
  value: valor,
}))

function limparFiltros() {
  busca.value = ''
  tipo.value = null
  status.value = null
}
</script>

<template>
  <v-row>
    <v-col cols="12" md="5">
      <v-text-field
        v-model="busca"
        label="Buscar por número ou cliente"
        prepend-inner-icon="mdi-magnify"
        clearable
        hide-details
      />
    </v-col>
    <v-col cols="12" sm="6" md="3">
      <v-select v-model="tipo" :items="tiposDocumento" label="Tipo" clearable hide-details />
    </v-col>
    <v-col cols="12" sm="6" md="3">
      <v-select v-model="status" :items="itensStatus" label="Status" clearable hide-details />
    </v-col>
    <v-col cols="12" md="1" class="d-flex align-center">
      <v-btn
        icon="mdi-filter-off-outline"
        variant="text"
        aria-label="Limpar filtros"
        @click="limparFiltros"
      />
    </v-col>
  </v-row>
</template>
