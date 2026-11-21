import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as servico from '../services/clientesService'
import { useNotificacoesStore } from './notificacoes'

export const useClientesStore = defineStore('clientes', () => {
  const notificacoes = useNotificacoesStore()

  const itens = ref([])
  const carregando = ref(false)
  const carregado = ref(false)
  const erro = ref(null)
  const salvando = ref(false)

  const total = computed(() => itens.value.length)

  function buscarPorId(id) {
    return itens.value.find((c) => c.id === Number(id))
  }

  function substituir(cliente) {
    const i = itens.value.findIndex((c) => c.id === cliente.id)
    if (i >= 0) itens.value[i] = cliente
    else itens.value.push(cliente)
    itens.value.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  }

  async function executar(acao, mensagemSucesso) {
    salvando.value = true
    try {
      const resultado = await acao()
      notificacoes.notificar(mensagemSucesso)
      return resultado
    } catch (e) {
      notificacoes.notificar(e.mensagem ?? 'Erro inesperado.', 'error')
      return null
    } finally {
      salvando.value = false
    }
  }

  async function carregar() {
    carregando.value = true
    erro.value = null
    try {
      itens.value = await servico.listar()
      carregado.value = true
    } catch (e) {
      erro.value = e.mensagem ?? 'Erro inesperado ao carregar os clientes.'
    } finally {
      carregando.value = false
    }
  }

  async function carregarSeNecessario() {
    if (!carregado.value && !carregando.value) await carregar()
  }

  function criar(dados) {
    return executar(async () => {
      const novo = await servico.criar(dados)
      substituir({ totalDocumentos: 0, ...novo })
      return novo
    }, 'Cliente cadastrado.')
  }

  function atualizar(id, dados) {
    return executar(async () => {
      const antigo = buscarPorId(id)
      const cliente = await servico.atualizar(id, dados)
      substituir({ totalDocumentos: antigo?.totalDocumentos ?? 0, ...cliente })
      return cliente
    }, 'Cliente atualizado.')
  }

  function remover(id) {
    return executar(async () => {
      await servico.remover(id)
      itens.value = itens.value.filter((c) => c.id !== Number(id))
      return true
    }, 'Cliente excluído.')
  }

  return { itens, carregando, carregado, erro, salvando, total, buscarPorId, carregar, carregarSeNecessario, criar, atualizar, remover }
})
