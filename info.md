# Loja JM Decoração — Documentação Técnica

> Plataforma de vendas para comércio artesanal de produtos de vidro, desenvolvida como Trabalho de Conclusão de Curso.  
> Stack: Vite + React · Node.js · PostgreSQL · MinIO · Nginx · Docker Compose

---

## Visão Geral

Este projeto é uma plataforma de catálogo e pedidos para um ateliê artesanal localizado em Atibaia — SP. O sistema foi concebido para absorver as operações repetitivas do fluxo de vendas — exibição de produtos, recebimento de pedidos e gestão de entregas — liberando o proprietário para as atividades que exigem julgamento humano: produção e relacionamento com clientes.

A arquitetura é baseada em microsserviços orquestrados via Docker Compose, onde cada serviço possui responsabilidade única, fronteiras bem definidas e comunicação controlada por um proxy reverso central.

---

## Estrutura de Diretórios

```
./
├── backend/        → API Node.js — lógica de negócio e endpoints
├── docker/         → Dockerfiles e configurações de cada serviço
├── docs/           → Documentação técnica e briefing do projeto
├── frontend/       → Aplicação Vite + React — interface do usuário
├── infra/          → Script de migração de imagens para o bucket MinIO
├── scripts/        → Scripts de inicialização e configuração dos serviços
├── uploads/        → Imagens dos produtos (origem para migração ao MinIO)
├── docker-compose.yaml
├── info.md         → Este documento
└── README.md
```

Cada diretório de primeira camada corresponde à fronteira de um contêiner específico. Os únicos serviços que não possuem diretório próprio na raiz — MinIO e PostgreSQL — utilizam imagens oficiais configuradas diretamente no `docker-compose.yaml`. O Nginx possui Dockerfile próprio em `./docker/nginx/`, mas não possui diretório de serviço na raiz.

---

## Serviços e Contêineres

| Serviço | Tecnologia | Porta Interna | Porta Externa |
|---|---|---|---|
| `vite-app` | Vite + React (Node Alpine) | `5173` | — |
| `app` | Node.js + Express | `3000` | — |
| `nginx` | Nginx | `80` | `8080` |
| `postgres` | PostgreSQL 16 Alpine | `5432` | — |
| `minio` | MinIO (S3) | `9000` / `9001` | `9000` / `9001` |
| `storage-migrator` | Node Alpine (efêmero) | — | — |

Os serviços `vite-app`, `app` e `postgres` estão selados na rede Docker interna `app-network` e não são acessíveis diretamente pelo host. O Nginx é o único ponto de entrada da aplicação. O MinIO expõe duas portas: `9000` para acesso às imagens (API S3) e `9001` para o console de administração web.

---

## Fluxo de Requisição

```
Usuário (browser)
  → http://localhost:8080  (Nginx)
    → http://vite-app:5173  (Frontend — páginas e componentes)
      → http://app:3000     (API — dados autenticados ou públicos)
        → PostgreSQL        (banco de dados)

Imagens dos produtos (acesso público, sem intermediação do Nginx):
  → http://localhost:9000/loja-jm/{nome-do-arquivo}
```

O frontend, uma vez entregue ao navegador do usuário, realiza chamadas às rotas mapeadas no Nginx (`/api`) que são redirecionadas internamente para a API (`http://app:3000`). As imagens dos produtos são consumidas diretamente do MinIO pelo navegador, sem passar pela API ou pelo Nginx, pois o bucket `loja-jm` possui política de leitura pública (`anonymous download`).

---

## Diretórios — Detalhamento

### `./frontend`

Aplicação SPA (Single Page Application) construída com Vite e React. Toda a interface é servida em uma única página HTML, onde os componentes são injetados e substituídos dinamicamente sem recarregamento completo.

```
./frontend/
├── eslint.config.js          → Configuração do ESLint com suporte a HMR (bind mount em dev)
├── index.html                → Ponto de entrada HTML
├── public/                   → Assets estáticos públicos
└── src/
    ├── main.jsx              → Inicialização da aplicação React
    ├── admin/                → Painel administrativo (Admin.jsx, login_admin.js, login_admin.css)
    ├── components/           → Componentes reutilizáveis
    │   ├── carrinho/         → Carrinho de compras (Carrinho.jsx, style.css)
    │   ├── Footer/           → Rodapé (Footer.jsx, style.css)
    │   ├── Header/           → Cabeçalho e navegação (Header.jsx, style.css)
    │   ├── ProdutoDetalhes/  → Modal de detalhes do produto (ProdutoDetalhes.jsx, style.css)
    │   └── Vitrine/          → Grade de exibição dos produtos (Vitrine.jsx, style.css)
    ├── context/
    │   └── CarrinhoContext.jsx → Gerenciamento de estado global do carrinho
    ├── pages/                → Páginas principais da aplicação
    │   ├── Home/             → Página inicial (Home.jsx, style.css)
    │   ├── Login/            → Login de cliente e admin (Login.jsx, LoginAdmin.jsx, style.css)
    │   └── Sobre/            → Página institucional (Sobre.jsx, style.css)
    └── services/
        └── products.js       → Funções de busca de produtos na API e montagem de URLs do MinIO
```

O arquivo `./frontend/src/services/products.js` é responsável por buscar os produtos na API (`http://localhost:8080/api/listar`) e montar a URL pública de cada imagem apontando diretamente para o bucket MinIO (`http://localhost:9000/loja-jm/{imagemUpload}`).

---

### `./backend`

API REST construída em Node.js com Express. Gerencia toda a lógica de negócio: produtos, clientes, pedidos e autenticação.

```
./backend/
├── server.js                     → Declaração do servidor Express, porta e registro de rotas
├── package.json                  → Dependências Node.js da API
├── models/
│   ├── db.js                     → Conexão com o PostgreSQL
│   ├── schema.js                 → Definição do esquema do banco de dados
│   └── supabase.js               → Conexão com o Supabase (autenticação)
├── router/
│   └── produtosController.js     → Controlador central das rotas de produtos
├── routes/
│   ├── admin.js                  → Endpoints administrativos
│   ├── clientes.js               → Endpoints de cadastro e gestão de clientes
│   ├── pedidos.js                → Endpoints de criação e consulta de pedidos
│   ├── produtos.js               → Endpoints públicos de produtos
│   └── produtosAdmin.js          → Endpoints de gestão de produtos (admin)
└── src/
    └── config/
        └── s3.js                 → Conexão com o bucket MinIO via SDK S3
    └── services/
        └── uploadService.js      → Funções de upload e remoção de imagens no MinIO
```

O arquivo `./backend/src/config/s3.js` configura a conexão com o MinIO utilizando o SDK S3 compatível. O `./backend/src/services/uploadService.js` expõe as funções que a API utiliza para enviar e remover imagens dos produtos diretamente no bucket, sendo esta a única via de escrita autorizada no MinIO.

---

### `./docker`

Centraliza todos os Dockerfiles e arquivos de configuração dos serviços.

```
./docker/
├── migrator-images/
│   ├── Dockerfile        → Node Alpine — contêiner efêmero de migração
│   └── package.json      → Dependências do migrador
├── nginx/
│   ├── Dockerfile        → Imagem Nginx personalizada
│   └── nginx.conf        → Configuração do proxy reverso
├── node/
│   └── Dockerfile        → Imagem da API Node.js
├── postgres/
│   ├── init.sql          → Criação do schema, tabelas e tipos
│   └── seed.sql          → Dados iniciais (produtos, zonas de entrega)
└── vite/
    ├── Dockerfile        → Imagem do frontend Vite
    ├── package.json      → Dependências do frontend
    ├── package-lock.json
    └── vite.config.js    → Configuração do Vite (HMR, proxy)
```

O `./docker/nginx/nginx.conf` define três rotas principais:

- `/` → proxy para `http://vite-app:5173` (frontend)
- `/api` → proxy para `http://app:3000` (API)
- `/storageImages/` → proxy para `http://minio:9000/loja-jm/` (imagens via Nginx, rota alternativa)

---

### `./infra`

```
./infra/
└── s3.js     → Script de migração: conecta ao MinIO e envia todas as imagens de ./uploads para o bucket loja-jm
```

Este arquivo é executado exclusivamente pelo contêiner efêmero `storage-migrator`. Ele verifica quais imagens ainda não estão no bucket antes de enviá-las, respeitando a idempotência da operação. Após a conclusão, o contêiner encerra com `exit 0` e não é reiniciado (`restart: "no"`).

---

### `./scripts`

```
./scripts/
└── entryMinio.sh     → Entrypoint do serviço MinIO
```

O `./scripts/entryMinio.sh` é o ponto de entrada do contêiner MinIO. Ele executa as seguintes operações em sequência:

1. Inicia o servidor MinIO em background (`minio server /data --console-address ":9001"`)
2. Aguarda a inicialização do servidor
3. Configura o alias local do cliente `mc`
4. Cria o bucket `loja-jm` com a flag `--ignore-existing` (idempotente)
5. Define a política de acesso público de leitura (`mc anonymous set download`)
6. Aguarda o processo principal com `wait $minio_pid`

---

### `./uploads`

```
./uploads/     → Imagens dos produtos em seu estado local (origem para migração)
```

Este diretório serve exclusivamente como origem para o contêiner `storage-migrator`. As imagens aqui presentes são enviadas ao bucket MinIO na primeira execução. Em produção, as imagens são gerenciadas diretamente via API — o diretório `./uploads` deixa de ser relevante após a migração inicial.

---

### `./docs`

```
./docs/
├── briefing_tcc_atelie.docx    → Briefing completo de requisitos (formato Word)
└── briefing_tcc_atelie.txt     → Briefing completo de requisitos (formato texto)
```

---

## Banco de Dados

O PostgreSQL é inicializado com dois arquivos SQL montados via volume:

- `./docker/postgres/init.sql` — define o schema `jm`, os tipos enumerados (`user_role`, `status_pedido`) e todas as tabelas: `usuarios`, `clientes`, `produtos`, `zonas_entrega`, `pedidos`, `pedido_itens`
- `./docker/postgres/seed.sql` — popula as tabelas com dados iniciais: produtos de exemplo e zonas de entrega de Atibaia e cidades vizinhas

A conexão com o banco é gerenciada em `./backend/models/db.js`.

---

## Storage de Imagens — MinIO

O MinIO opera como um serviço de armazenamento de objetos compatível com a API S3. O bucket `loja-jm` armazena todas as imagens dos produtos com acesso público de leitura.

**Fluxo de leitura (frontend):**
```
Browser → http://localhost:9000/loja-jm/{nome-do-arquivo}
```

**Fluxo de escrita (admin):**
```
Painel Admin → API (./backend/src/services/uploadService.js) → MinIO
```

A escrita no bucket é exclusividade da API, que possui as credenciais de acesso via variáveis de ambiente. O frontend nunca escreve diretamente no MinIO.

---

## Observabilidade e Saúde dos Serviços

O `docker-compose.yaml` define healthchecks para os serviços críticos:

| Serviço | Healthcheck |
|---|---|
| `app` | `wget --spider http://localhost:3000/health` |
| `postgres` | `pg_isready -U $DB_USER -d $DB_NAME` |
| `minio` | `mc ls local/loja-jm` (valida bucket criado) |

O `storage-migrator` possui `depends_on: minio: condition: service_healthy`, garantindo que as imagens só sejam enviadas após o bucket estar criado e acessível. O Nginx aguarda `app: service_healthy` e `vite-app: service_started` antes de aceitar conexões externas.

---

## Variáveis de Ambiente

Todas as configurações sensíveis são gerenciadas via `.env` na raiz do projeto. O arquivo `.env.example` documenta as variáveis necessárias sem expor valores reais.

Variáveis esperadas:

```
DB_USER

DB_NAME
MINIO_ROOT_USER

```

---

## Como Executar

```bash
# Subir todos os serviços
docker compose up --build

# Subir apenas o migrador de imagens manualmente
docker compose up --build storage-migrator

# Parar e remover todos os contêineres
docker compose down
```

A aplicação estará disponível em `http://localhost:8080` após todos os serviços passarem nos healthchecks.

---

## Estado Atual do Projeto

O projeto encontra-se em desenvolvimento ativo. A infraestrutura base está estável e os seguintes módulos estão operacionais:

- ✅ Orquestração de serviços via Docker Compose
- ✅ Proxy reverso com Nginx
- ✅ Banco de dados PostgreSQL com schema e seed
- ✅ Storage de imagens com MinIO e migração automatizada
- ✅ Frontend consumindo produtos e imagens do MinIO
- ⏳ Rotas de gestão de imagens e produtos via API (em desenvolvimento)
- ⏳ Autenticação com Supabase + JWT (em desenvolvimento)
- ⏳ Integração com Mercado Pago (planejado)
- ⏳ Chatbot de catálogo com IA (planejado)

---

*Documentação gerada durante o desenvolvimento — TCC Ateliê Artesanal Atibaia*