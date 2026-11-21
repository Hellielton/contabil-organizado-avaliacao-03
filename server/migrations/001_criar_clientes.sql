-- Clientes do escritório (lado "1" do relacionamento cliente -> documentos).
-- usuario_id guarda o dono do registro (id do usuário no Supabase Auth).

create table clientes (
  id               bigint generated always as identity primary key,
  nome             text        not null check (char_length(nome) between 2 and 120),
  documento_fiscal text,
  email            text,
  usuario_id       uuid        not null,
  criado_em        timestamptz not null default now(),

  -- Evita o mesmo cliente cadastrado duas vezes pelo mesmo usuário
  constraint clientes_usuario_nome_unico unique (usuario_id, nome)
);

create index clientes_usuario_idx on clientes (usuario_id);
