-- Documentos contábeis (lado "N" do relacionamento cliente -> documentos).
-- A chave estrangeira cliente_id impede documento sem cliente e, com ON DELETE
-- RESTRICT, impede excluir um cliente que ainda tem documentos.

create table documentos (
  id          bigint generated always as identity primary key,
  cliente_id  bigint      not null references clientes (id) on delete restrict,
  tipo        text        not null check (tipo in (
                'Nota Fiscal', 'Extrato Bancário', 'Guia de Imposto',
                'Folha de Pagamento', 'Contrato', 'Recibo')),
  numero      text        not null check (char_length(numero) between 1 and 60),
  competencia text        not null check (competencia ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  data        date        not null,
  vencimento  date,                                   -- opcional
  valor       numeric(14, 2) check (valor > 0),       -- opcional
  status      text        not null default 'pendente'
                check (status in ('pendente', 'conferido', 'arquivado')),
  observacoes text        not null default '',
  usuario_id  uuid        not null,
  criado_em   timestamptz not null default now(),

  -- Evita o mesmo documento (tipo + número) duplicado para o mesmo cliente
  constraint documentos_cliente_tipo_numero_unico unique (cliente_id, tipo, numero)
);

create index documentos_cliente_idx on documentos (cliente_id);
create index documentos_usuario_idx on documentos (usuario_id);
create index documentos_vencimento_idx on documentos (vencimento);
