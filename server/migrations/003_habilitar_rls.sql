-- Segurança no Supabase: tabelas do schema "public" ficam expostas pela API REST
-- automática do Supabase (PostgREST). Com o RLS ligado e sem nenhuma política,
-- essa API não enxerga nem altera nada. Só a nossa API Express, que conecta
-- direto no banco com o usuário "postgres" (que ignora o RLS), acessa os dados.

alter table clientes enable row level security;
alter table documentos enable row level security;
