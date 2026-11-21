<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotificacoesStore } from '../stores/notificacoes'

const auth = useAuthStore()
const notificacoes = useNotificacoesStore()
const route = useRoute()
const router = useRouter()

const form = ref(null)
const modo = ref('entrar') // 'entrar' | 'cadastrar'
const email = ref('')
const senha = ref('')
const mostrarSenha = ref(false)
const mensagem = ref(null) // { tipo, texto }

const cadastrando = computed(() => modo.value === 'cadastrar')

const regras = {
  email: [
    (v) => !!v || 'Informe o e-mail',
    (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'E-mail inválido',
  ],
  senha: [
    (v) => !!v || 'Informe a senha',
    (v) => v.length >= 6 || 'A senha deve ter pelo menos 6 caracteres',
  ],
}

onMounted(() => {
  document.title = 'Entrar | Contábil Organizado'
})

// Só aceita redirecionamento para caminhos internos do próprio site
function destino() {
  const r = route.query.redirect
  return typeof r === 'string' && r.startsWith('/') && !r.startsWith('//') ? r : '/documentos'
}

async function enviar() {
  mensagem.value = null
  const { valid } = await form.value.validate()
  if (!valid) return

  if (cadastrando.value) {
    const r = await auth.cadastrar(email.value.trim(), senha.value)
    if (!r.ok) {
      mensagem.value = { tipo: 'error', texto: r.mensagem }
    } else if (r.precisaConfirmar) {
      mensagem.value = { tipo: 'success', texto: 'Conta criada! Confirme o e-mail que enviamos e depois entre.' }
      modo.value = 'entrar'
    } else {
      notificacoes.notificar('Conta criada. Bem-vindo!')
      router.push(destino())
    }
  } else {
    const r = await auth.entrar(email.value.trim(), senha.value)
    if (!r.ok) {
      mensagem.value = { tipo: 'error', texto: r.mensagem }
    } else {
      notificacoes.notificar('Login realizado.')
      router.push(destino())
    }
  }
}

function alternar() {
  modo.value = cadastrando.value ? 'entrar' : 'cadastrar'
  mensagem.value = null
}
</script>

<template>
  <v-card max-width="440" class="mx-auto mt-4" variant="outlined">
    <v-card-item>
      <v-card-title class="text-h5">{{ cadastrando ? 'Criar conta' : 'Entrar' }}</v-card-title>
      <v-card-subtitle>É preciso estar logado para cadastrar, editar ou excluir.</v-card-subtitle>
    </v-card-item>

    <v-card-text>
      <v-alert v-if="mensagem" :type="mensagem.tipo" variant="tonal" class="mb-4" :text="mensagem.texto" />

      <v-form ref="form" @submit.prevent="enviar">
        <v-text-field
          v-model="email"
          label="E-mail"
          type="email"
          autocomplete="email"
          prepend-inner-icon="mdi-email-outline"
          :rules="regras.email"
        />
        <v-text-field
          v-model="senha"
          label="Senha"
          :type="mostrarSenha ? 'text' : 'password'"
          :autocomplete="cadastrando ? 'new-password' : 'current-password'"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="mostrarSenha ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          :rules="regras.senha"
          @click:append-inner="mostrarSenha = !mostrarSenha"
        />
        <v-btn type="submit" color="primary" variant="flat" block :loading="auth.carregando">
          {{ cadastrando ? 'Criar conta' : 'Entrar' }}
        </v-btn>
      </v-form>
    </v-card-text>

    <v-card-actions class="justify-center">
      <v-btn variant="text" size="small" @click="alternar">
        {{ cadastrando ? 'Já tenho conta' : 'Não tenho conta' }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
