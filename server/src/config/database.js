import pg from 'pg'

// Por padrão o driver devolve alguns tipos como texto ou objeto. Aqui ajustamos
// para o formato que o front-end espera:
pg.types.setTypeParser(20, (valor) => parseInt(valor, 10)) // bigint (ids) -> número
pg.types.setTypeParser(1700, (valor) => parseFloat(valor)) // numeric (valor) -> número
pg.types.setTypeParser(1082, (valor) => valor) // date -> "AAAA-MM-DD" (sem fuso horário)

export function criarPool({ databaseUrl, databaseSsl }) {
  return new pg.Pool({
    connectionString: databaseUrl,
    ssl: databaseSsl ? { rejectUnauthorized: false } : false,
    max: 5,
  })
}
