# Contábil Organizado

![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white)
![Vuetify](https://img.shields.io/badge/Vuetify-3-1867c0?logo=vuetify&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ecf8e?logo=supabase&logoColor=white)
![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0-6ba539?logo=openapiinitiative&logoColor=white)
![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-blue)

Aplicação full stack para **organizar documentos contábeis por cliente**: notas fiscais, extratos, guias de imposto,
folhas de pagamento, contratos e recibos, com competência, vencimento, valor e status (pendente → conferido → arquivado).

Projeto da disciplina **Frameworks Modernos para Desenvolvimento de Sistemas** (UNEMAT) — Avaliação 3.
Autor: **Hellielton Reis**.

## Links

| O quê | Endereço |
| --- | --- |
| Aplicação publicada (front-end) | `COLE AQUI A URL DA VERCEL` |
| API publicada | `COLE AQUI A URL DO RENDER` |
| Documentação Swagger | `COLE AQUI A URL DO RENDER`/api-docs |
| Repositório do front-end | este repositório |
| Repositório do back-end | `COLE AQUI O LINK DO REPOSITÓRIO DA API` (ou a pasta [`server/`](server) deste repositório) |

> A API roda no plano gratuito do Render: a primeira requisição após um período parado pode levar cerca de 1 minuto.

## Funcionalidades

- **CRUD completo de duas entidades relacionadas**: `clientes` (1) → `documentos` (N), com chave estrangeira real no banco.
- **Autenticação** com Supabase Auth (cadastro, login, logout). Leitura é pública; **escrita exige login**.
- **Só o dono** do registro edita ou exclui (a API responde 403; a interface esconde os botões).
- Cliente com documentos **não pode ser excluído** (409).
- Telas com os 3 estados (carregando, erro, vazio), formulários validados e layout responsivo.
- API documentada com **Swagger/OpenAPI 3** em `/api-docs`.

## Arquitetura

```
Navegador (Vue 3 + Vuetify + Pinia + Router)
   │  Axios  (Authorization: Bearer <token do Supabase>)
   ▼
API Express  ── rotas → controllers → services → repositories ──▶ Postgres (Supabase)
   │
   └── confere o token no Supabase Auth
```

Detalhes do back-end (camadas, migrations, testes): [server/README.md](server/README.md).

## Requisitos

- Node.js 22 ou superior
- Uma conta gratuita no [Supabase](https://supabase.com)

## Instalação (desenvolvimento)

```bash
# 1) Front-end (pasta raiz)
npm install
cp .env.example .env.local     # preencha as variáveis (veja abaixo)
npm run dev                    # http://localhost:5173

# 2) Back-end (em outro terminal)
cd server
npm install
cp .env.example .env           # preencha as variáveis
npm run migrate                # cria as tabelas no banco
npm run seed                   # (opcional) dados de exemplo
npm run dev                    # http://localhost:3000  ·  docs em /api-docs
```

No Windows (PowerShell) use `Copy-Item .env.example .env.local` no lugar de `cp`.

## Variáveis de ambiente

### Front-end (`.env.local`)

| Variável | Descrição |
| --- | --- |
| `VITE_API_URL` | URL da API, terminando em `/api` |
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave pública `anon` do Supabase |

### Back-end (`server/.env`)

| Variável | Descrição |
| --- | --- |
| `PORT` | Porta da API (padrão 3000) |
| `DATABASE_URL` | String de conexão Postgres do Supabase (Session pooler) |
| `DATABASE_SSL` | `true` para conexões com SSL (Supabase) |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | Usados para validar o token do usuário |
| `CORS_ORIGIN` | URL(s) do front permitidas, separadas por vírgula |
| `SEED_USUARIO_ID` | (opcional) id do usuário dono dos dados de exemplo |

Arquivos `.env` **nunca** são enviados ao Git.

## Scripts

| Onde | Comando | O que faz |
| --- | --- | --- |
| Front | `npm run dev` | Servidor de desenvolvimento |
| Front | `npm run build` | Gera a versão de produção em `dist/` |
| Back | `npm start` | Inicia a API |
| Back | `npm run dev` | API com reinício automático |
| Back | `npm run migrate` | Aplica as migrations SQL pendentes |
| Back | `npm run seed` | Insere dados de exemplo |
| Back | `npm test` | Roda os testes automatizados |

## Endpoints

Documentação interativa completa em **`/api-docs`**.

| Método | Rota | Login | Descrição |
| --- | --- | :---: | --- |
| GET | `/health` | — | Verifica API e banco |
| GET | `/api/clientes` | — | Lista clientes |
| POST | `/api/clientes` | ✔ | Cria cliente |
| GET | `/api/clientes/{id}` | — | Busca cliente |
| PUT | `/api/clientes/{id}` | ✔ dono | Atualiza cliente |
| DELETE | `/api/clientes/{id}` | ✔ dono | Exclui cliente (sem documentos) |
| GET | `/api/clientes/{id}/documentos` | — | Documentos de um cliente |
| GET | `/api/documentos?clienteId=&status=` | — | Lista documentos |
| POST | `/api/documentos` | ✔ | Cria documento (entra como pendente) |
| GET | `/api/documentos/{id}` | — | Busca documento |
| PUT | `/api/documentos/{id}` | ✔ dono | Atualiza documento |
| PATCH | `/api/documentos/{id}/status` | ✔ dono | Altera o status |
| DELETE | `/api/documentos/{id}` | ✔ dono | Exclui documento |

## Estrutura do front-end

```
src/
├── components/   componentes reutilizáveis (cards, formulários, chips, EstadoLista)
├── views/        telas (Home, Documentos, Clientes, Login, Vencimentos, formulários…)
├── router/       rotas, guard de validação de id e de login (meta.requerLogin)
├── stores/       Pinia: auth, clientes, documentos, notificacoes
├── services/     Axios (api.js), Supabase e chamadas à API
└── utils/        formatadores e regras de vencimento
```

## Testes

```bash
cd server && npm test
```

Testam validações, regras de negócio (dono, cliente com documentos, status inicial), autenticação, tratamento de erros e a
própria especificação OpenAPI (todas as rotas documentadas, `$ref` válidos, rotas de escrita com segurança).

## Deploy

- **Banco e autenticação:** Supabase
- **API:** Render (Web Service, diretório raiz `server`, build `npm install`, start `npm start`)
- **Front-end:** Vercel (`vercel.json` já trata as rotas da SPA)

Passo a passo em [LEIA-PRIMEIRO-AV3.md](LEIA-PRIMEIRO-AV3.md).

## Licença

Distribuído sob a licença [MIT](LICENSE).
