# Contábil Organizado — API

![Node](https://img.shields.io/badge/Node-%E2%89%A520.6-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![Postgres](https://img.shields.io/badge/Postgres-Supabase-3ecf8e?logo=supabase&logoColor=white)
![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0-6ba539)
![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-blue)

API REST em Express para o projeto Contábil Organizado. Documentação interativa em **`/api-docs`** (JSON em `/api-docs.json`).

## Arquitetura em camadas

```
src/
├── routes/        liga cada URL a um método do controller (GET público; escrita protegida)
├── controllers/   lê a requisição e monta a resposta HTTP
├── services/      regras de negócio (dono, cliente com documentos, status inicial)
├── repositories/  único lugar com SQL (pg)
├── validators/    validação e normalização do corpo das requisições
├── middlewares/   autenticar (JWT do Supabase) e tratamento central de erros
├── config/        variáveis de ambiente, pool do Postgres, cliente Supabase
├── docs/          especificação OpenAPI
├── errors/        AppError e fábricas (400, 401, 403, 404, 409)
└── container.js   monta as camadas (injeção de dependência)
```

## Banco de dados

Schema versionado em `migrations/*.sql`, aplicado por `npm run migrate` (tabela `schema_migrations` guarda o que já rodou).

- `clientes` (id, nome, documento_fiscal, email, usuario_id, criado_em) — nome único por usuário
- `documentos` (id, **cliente_id → clientes(id) ON DELETE RESTRICT**, tipo, numero, competencia, data, vencimento, valor, status, observacoes, usuario_id, criado_em) — com restrições `CHECK` e número único por cliente/tipo
- RLS habilitado nas duas tabelas (o acesso é só pela API)

## Autenticação

Supabase Auth. O front envia `Authorization: Bearer <access_token>`; o middleware `autenticar` valida o token no Supabase e
coloca o usuário em `req.usuario`. Sem token válido: **401**. Usuário logado que não é dono: **403**.

## Instalação

```bash
npm install
cp .env.example .env     # preencha
npm run migrate
npm run seed             # opcional (precisa de SEED_USUARIO_ID)
npm run dev
```

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| --- | :---: | --- |
| `DATABASE_URL` | ✔ | String de conexão Postgres (Supabase → Connect → **Session pooler**) |
| `SUPABASE_URL` | ✔ | URL do projeto |
| `SUPABASE_ANON_KEY` | ✔ | Chave `anon` |
| `DATABASE_SSL` | | `true` no Supabase |
| `PORT` | | Padrão 3000 (o Render define sozinho) |
| `CORS_ORIGIN` | | Origens permitidas, separadas por vírgula |
| `SEED_USUARIO_ID` | | Dono dos dados de exemplo |

## Scripts

`npm start` · `npm run dev` · `npm run migrate` · `npm run seed` · `npm test`

## Endpoints

Veja a tabela completa no [README do projeto](../README.md#endpoints) ou em `/api-docs`.

## Testes

`npm test` usa o executor nativo do Node (`node --test`), sem dependências extras, e testa validadores, serviços (com
repositórios falsos), autenticação, tratamento de erros e a especificação OpenAPI.

## Licença

MIT
