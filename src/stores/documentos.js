import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as servico from '../services/documentosService'
import { statusDocumento } from '../data/documentos'
import { useNotificacoesStore } from './notificacoes'

export const useDocumentosStore = defineStore('documentos', () => {
  const notificacoes = useNotificacoesStore()

  // ---------- estado ----------
  const itens = ref([])
  const carregando = ref(false) // buscando a lista na API
  const carregado = ref(false) // a lista já foi carregada com sucesso
  const erro = ref(null) // mensagem de erro do carregamento
  const salvando = ref(false) // criando, editando, mudando status ou excluindo

  // ---------- getters ----------
  const total = computed(() => itens.value.length)
  const pendentes = computed(() => itens.value.filter((doc) => doc.status === 'pendente'))

  // ---------- auxiliares ----------
  function buscarPorId(id) {
    return itens.value.find((doc) => doc.id === Number(id))
  }

  function substituir(doc) {
    const posicao = itens.value.findIndex((item) => item.id === doc.id)
    if (posicao >= 0) itens.value[posicao] = doc
    else itens.value.unshift(doc)
  }

  // Executa uma ação que altera dados: controla "salvando", avisa o resultado
  // e devolve o resultado da ação, ou null se deu erro (nunca lança exceção).
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

  // ---------- ações assíncronas ----------
  async function carregar() {
    carregando.value = true
    erro.value = null
    try {
      itens.value = await servico.listar()
      carregado.value = true
    } catch (e) {
      erro.value = e.mensagem ?? 'Erro inesperado ao carregar os documentos.'
    } finally {
      carregando.value = false
    }
  }

  // As telas chamam esta no onMounted: só busca na API se ainda não buscou.
  async function carregarSeNecessario() {
    if (!carregado.value && !carregando.value) await carregar()
  }

  function criar(dados) {
    return executar(async () => {
      const novo = await servico.criar(dados)
      itens.value.unshift(novo)
      return novo
    }, 'Documento criado com sucesso.')
  }

  function atualizar(id, dados) {
    return executar(async () => {
      const doc = await servico.atualizar(id, dados)
      substituir(doc)
      return doc
    }, 'Documento atualizado.')
  }

  function mudarStatus(id, status) {
    return executar(async () => {
      const doc = await servico.mudarStatus(id, status)
      substituir(doc)
      return doc
    }, 'Status atualizado.')
  }

  // pendente -> conferido -> arquivado
  function avancarStatus(id) {
    const doc = buscarPorId(id)
    if (!doc) return Promise.resolve(null)
    const posicao = statusDocumento.indexOf(doc.status)
    if (posicao >= statusDocumento.length - 1) return Promise.resolve(null)
    return mudarStatus(id, statusDocumento[posicao + 1])
  }

  function remover(id) {
    return executar(async () => {
      await servico.remover(id)
      itens.value = itens.value.filter((doc) => doc.id !== Number(id))
      return true
    }, 'Documento excluído.')
  }

  return {
    itens,
    carregando,
    carregado,
    erro,
    salvando,
    total,
    pendentes,
    buscarPorId,
    carregar,
    carregarSeNecessario,
    criar,
    atualizar,
    mudarStatus,
    avancarStatus,
    remover,
  }
})
