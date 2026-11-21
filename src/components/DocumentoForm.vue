<script setup>
import { ref } from 'vue'
import { tiposDocumento } from '../data/documentos'

// Formulário usado tanto para criar (documento = null) quanto para editar.
const props = defineProps({
  documento: { type: Object, default: null },
  salvando: { type: Boolean, default: false },
  clientes: { type: Array, default: () => [] }, // clientes que o usuário pode escolher
})

const emit = defineEmits(['salvar', 'cancelar'])

const form = ref(null)

// Date -> "2026-11-16" (horário local)
function paraISO(data) {
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${data.getFullYear()}-${mes}-${dia}`
}

function valoresIniciais() {
  const hoje = new Date()
  const emUmaSemana = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 7)
  const doc = props.documento
  return {
    tipo: doc?.tipo ?? null,
    numero: doc?.numero ?? '',
    clienteId: doc?.clienteId ?? null,
    competencia: doc?.competencia ?? paraISO(hoje).slice(0, 7),
    data: doc?.data ?? paraISO(hoje),
    vencimento: doc?.vencimento ?? paraISO(emUmaSemana),
    valor: doc?.valor ?? null,
    observacoes: doc?.observacoes ?? '',
  }
}

const campos = ref(valoresIniciais())

// Opcionais: só entram no documento se a caixa estiver marcada
const informarVencimento = ref(Boolean(props.documento?.vencimento))
const informarValor = ref(props.documento?.valor != null)

const obrigatorio = (v) => !!(v && String(v).trim()) || 'Campo obrigatório'
const valorPositivo = (v) => (v !== null && v !== '' && Number(v) > 0) || 'Informe um valor maior que zero'

async function salvar() {
  const { valid } = await form.value.validate()
  if (!valid) return
  emit('salvar', {
    ...campos.value,
    numero: campos.value.numero.trim(),
    vencimento: informarVencimento.value ? campos.value.vencimento : null,
    valor: informarValor.value ? Number(campos.value.valor) : null,
  })
}
</script>

<template>
  <v-card variant="outlined" max-width="720">
    <v-card-text>
      <v-form ref="form" @submit.prevent="salvar">
        <v-select
          v-model="campos.tipo"
          :items="tiposDocumento"
          label="Tipo de documento"
          :rules="[obrigatorio]"
        />
        <v-text-field v-model="campos.numero" label="Número / identificação" :rules="[obrigatorio]" />
        <v-select
          v-model="campos.clienteId"
          :items="clientes"
          item-title="nome"
          item-value="id"
          label="Cliente"
          :rules="[obrigatorio]"
          no-data-text="Nenhum cliente seu cadastrado"
        />

        <v-row dense>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="campos.competencia"
              type="month"
              label="Competência"
              :rules="[obrigatorio]"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="campos.data" type="date" label="Data do documento" :rules="[obrigatorio]" />
          </v-col>
        </v-row>

        <div class="text-subtitle-2 text-medium-emphasis mb-1">Opcionais</div>
        <v-row dense>
          <v-col cols="12" sm="6">
            <v-checkbox
              v-model="informarVencimento"
              label="Informar data de vencimento"
              density="compact"
              hide-details
            />
            <v-text-field
              v-if="informarVencimento"
              v-model="campos.vencimento"
              type="date"
              label="Data de vencimento"
              :rules="[obrigatorio]"
              class="mt-2"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-checkbox v-model="informarValor" label="Informar valor" density="compact" hide-details />
            <v-text-field
              v-if="informarValor"
              v-model="campos.valor"
              type="number"
              min="0"
              step="0.01"
              label="Valor (R$)"
              :rules="[valorPositivo]"
              class="mt-2"
            />
          </v-col>
        </v-row>

        <v-textarea
          v-model="campos.observacoes"
          label="Observações (opcional)"
          rows="2"
          auto-grow
          class="mt-2"
        />

        <div class="d-flex justify-end ga-2">
          <v-btn variant="text" :disabled="salvando" @click="emit('cancelar')">Cancelar</v-btn>
          <v-btn type="submit" color="primary" variant="flat" :loading="salvando">
            {{ documento ? 'Salvar alterações' : 'Criar documento' }}
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>
