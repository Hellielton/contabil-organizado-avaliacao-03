<script setup>
import { ref } from 'vue'

// Formulário de cliente: criar (cliente = null) ou editar.
const props = defineProps({
  cliente: { type: Object, default: null },
  salvando: { type: Boolean, default: false },
})

const emit = defineEmits(['salvar', 'cancelar'])

const form = ref(null)
const campos = ref({
  nome: props.cliente?.nome ?? '',
  documentoFiscal: props.cliente?.documentoFiscal ?? '',
  email: props.cliente?.email ?? '',
})

const regras = {
  nome: [
    (v) => !!(v && v.trim()) || 'Campo obrigatório',
    (v) => v.trim().length >= 2 || 'Mínimo de 2 caracteres',
  ],
  documentoFiscal: [(v) => !v || /^[\d./-]{11,18}$/.test(v) || 'Informe um CPF ou CNPJ válido (só números, . / -)'],
  email: [(v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'E-mail inválido'],
}

async function salvar() {
  const { valid } = await form.value.validate()
  if (!valid) return
  emit('salvar', {
    nome: campos.value.nome.trim(),
    documentoFiscal: campos.value.documentoFiscal.trim() || null,
    email: campos.value.email.trim() || null,
  })
}
</script>

<template>
  <v-card variant="outlined" max-width="640">
    <v-card-text>
      <v-form ref="form" @submit.prevent="salvar">
        <v-text-field v-model="campos.nome" label="Nome / razão social" :rules="regras.nome" counter="120" maxlength="120" />
        <v-text-field v-model="campos.documentoFiscal" label="CPF ou CNPJ (opcional)" :rules="regras.documentoFiscal" />
        <v-text-field v-model="campos.email" type="email" label="E-mail (opcional)" :rules="regras.email" />

        <div class="d-flex justify-end ga-2">
          <v-btn variant="text" :disabled="salvando" @click="emit('cancelar')">Cancelar</v-btn>
          <v-btn type="submit" color="primary" variant="flat" :loading="salvando">
            {{ cliente ? 'Salvar alterações' : 'Cadastrar cliente' }}
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>
