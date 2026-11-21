const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

// 1234.5 -> "R$ 1.234,50"
// Sem valor informado (null/undefined/vazio) -> "—", em vez de "R$ 0,00"
export function formatarMoeda(valor) {
  if (valor === null || valor === undefined || valor === '') return '—'
  return moeda.format(valor)
}

// "2026-10" -> "10/2026"
export function formatarCompetencia(competencia) {
  const [ano, mes] = competencia.split('-')
  return `${mes}/${ano}`
}

// "2026-10-05" -> "05/10/2026"
export function formatarData(data) {
  if (!data) return '—'
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}
