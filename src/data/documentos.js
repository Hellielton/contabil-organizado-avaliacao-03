// Constantes do domínio: documentos contábeis.
// Os documentos em si vêm da API (pasta server/).

export const tiposDocumento = [
  'Nota Fiscal',
  'Extrato Bancário',
  'Guia de Imposto',
  'Folha de Pagamento',
  'Contrato',
  'Recibo',
]

// Aparência de cada status (rótulo, cor do Vuetify e ícone MDI)
export const statusInfo = {
  pendente: { rotulo: 'Pendente', cor: 'warning', icone: 'mdi-clock-outline' },
  conferido: { rotulo: 'Conferido', cor: 'info', icone: 'mdi-check-circle-outline' },
  arquivado: { rotulo: 'Arquivado', cor: 'success', icone: 'mdi-archive-outline' },
}

// Ordem do fluxo: pendente -> conferido -> arquivado
export const statusDocumento = Object.keys(statusInfo)
