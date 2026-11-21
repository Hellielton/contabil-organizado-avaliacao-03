// "2026-11-20" -> Date local (evita erro de fuso horário do new Date("2026-11-20"))
function paraData(texto) {
  const [ano, mes, dia] = texto.split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}

// Quantos dias faltam para o vencimento (negativo = já venceu)
export function diasParaVencer(vencimento, hoje = new Date()) {
  const inicioDoDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  return Math.round((paraData(vencimento) - inicioDoDia) / 86400000)
}

const plural = (n) => (n === 1 ? 'dia' : 'dias')

// Situação do prazo de um documento: chave, rótulo, cor do Vuetify e ícone.
// Documento arquivado já está concluído, então o prazo deixa de importar.
export function situacaoVencimento(documento, hoje = new Date()) {
  if (documento.status === 'arquivado') {
    return { chave: 'concluido', rotulo: 'Concluído', cor: 'success', icone: 'mdi-check-circle-outline', dias: null }
  }
  if (!documento.vencimento) {
    return { chave: 'sem-prazo', rotulo: 'Sem prazo', cor: 'secondary', icone: 'mdi-calendar-blank-outline', dias: null }
  }

  const dias = diasParaVencer(documento.vencimento, hoje)
  if (dias < 0) {
    return { chave: 'vencido', rotulo: `Vencido há ${-dias} ${plural(-dias)}`, cor: 'error', icone: 'mdi-alert-circle-outline', dias }
  }
  if (dias === 0) {
    return { chave: 'hoje', rotulo: 'Vence hoje', cor: 'warning', icone: 'mdi-alarm', dias }
  }
  if (dias <= 7) {
    return { chave: 'proximo', rotulo: `Vence em ${dias} ${plural(dias)}`, cor: 'warning', icone: 'mdi-calendar-alert', dias }
  }
  return { chave: 'no-prazo', rotulo: `Vence em ${dias} dias`, cor: 'info', icone: 'mdi-calendar-check-outline', dias }
}
