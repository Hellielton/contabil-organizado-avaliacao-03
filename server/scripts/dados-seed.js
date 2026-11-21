// Dados de exemplo para o script de seed (npm run seed). Cada documento referencia o cliente pelo nome.
export const documentosIniciais = [
  {
    "id": 1,
    "numero": "NF-e 001542",
    "tipo": "Nota Fiscal",
    "cliente": "Padaria Pão Quente Ltda",
    "competencia": "2026-10",
    "data": "2026-10-05",
    "vencimento": "2026-11-10",
    "valor": 4850.9,
    "status": "pendente",
    "observacoes": "Falta conferir CFOP e retenções."
  },
  {
    "id": 2,
    "numero": "EXT-BB-1026",
    "tipo": "Extrato Bancário",
    "cliente": "Padaria Pão Quente Ltda",
    "competencia": "2026-10",
    "data": "2026-10-31",
    "vencimento": "2026-11-05",
    "valor": 32110.45,
    "status": "conferido",
    "observacoes": "Conciliação bancária concluída."
  },
  {
    "id": 3,
    "numero": "DAS-2026-10",
    "tipo": "Guia de Imposto",
    "cliente": "Mecânica Boa Viagem ME",
    "competencia": "2026-10",
    "data": "2026-11-20",
    "vencimento": "2026-11-20",
    "valor": 1275.33,
    "status": "pendente",
    "observacoes": "Vence em 20/11. Enviar ao cliente."
  },
  {
    "id": 4,
    "numero": "FOLHA-0926",
    "tipo": "Folha de Pagamento",
    "cliente": "Clínica Vida Plena",
    "competencia": "2026-09",
    "data": "2026-09-30",
    "vencimento": "2026-10-07",
    "valor": 58420,
    "status": "arquivado",
    "observacoes": "Arquivada na pasta 2026/09."
  },
  {
    "id": 5,
    "numero": "CT-2026-014",
    "tipo": "Contrato",
    "cliente": "Transportadora Rio Cuiabá",
    "competencia": "2026-08",
    "data": "2026-08-12",
    "vencimento": "2026-09-01",
    "valor": 120000,
    "status": "arquivado",
    "observacoes": "Contrato de prestação de serviços, vigência de 12 meses."
  },
  {
    "id": 6,
    "numero": "REC-000318",
    "tipo": "Recibo",
    "cliente": "Mecânica Boa Viagem ME",
    "competencia": "2026-10",
    "data": "2026-10-18",
    "vencimento": "2026-11-12",
    "valor": 850,
    "status": "conferido",
    "observacoes": ""
  },
  {
    "id": 7,
    "numero": "NF-e 000987",
    "tipo": "Nota Fiscal",
    "cliente": "Clínica Vida Plena",
    "competencia": "2026-10",
    "data": "2026-10-22",
    "vencimento": "2026-11-25",
    "valor": 12980,
    "status": "pendente",
    "observacoes": "Aguardando o XML do fornecedor."
  },
  {
    "id": 8,
    "numero": "GPS-2026-10",
    "tipo": "Guia de Imposto",
    "cliente": "Clínica Vida Plena",
    "competencia": "2026-10",
    "data": "2026-11-20",
    "vencimento": "2026-11-20",
    "valor": 7314.2,
    "status": "conferido",
    "observacoes": "Guia conferida com a folha de outubro."
  },
  {
    "id": 9,
    "numero": "EXT-SIC-1026",
    "tipo": "Extrato Bancário",
    "cliente": "Transportadora Rio Cuiabá",
    "competencia": "2026-10",
    "data": "2026-10-31",
    "vencimento": "2026-11-18",
    "valor": 84520.12,
    "status": "pendente",
    "observacoes": "Extrato incompleto, solicitar ao cliente."
  },
  {
    "id": 10,
    "numero": "FOLHA-1026",
    "tipo": "Folha de Pagamento",
    "cliente": "Padaria Pão Quente Ltda",
    "competencia": "2026-10",
    "data": "2026-10-30",
    "vencimento": "2026-11-30",
    "valor": 21340.75,
    "status": "conferido",
    "observacoes": ""
  }
]
