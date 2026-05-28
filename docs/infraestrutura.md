# Infraestrutura do Projeto

Este documento tem por objetivo informar como o projeto é constituído, serviços, funções e arquitetura escolhida para atender a necessidade de um comércio físico. Até o momento este documento está atualizado com informações atuais, mas futuramente mais funcionalidades e tecnologias podem ser envolvidas.

O projeto atualmente é totalmente localhost, rodado na máquina que clona o projeto e que contenha as dependências necessárias que o `README.md` lista e seguindo seus passos.

---

## Serviços e Imagens

O projeto utiliza de serviços e imagens de softwares em versões específicas para atender funcionalidades e também ser a base do projeto:

| Imagem | Função |
|--------|--------|
| `node:20-alpine` | Backend |
| `nginx:latest` | Proxy Reverso |
| `postgres:16-alpine` | Banco de Dados |
| `node:alpine` | Migrador de Imagens |
| `minio/minio` | Banco de Imagens |
| `node:alpine` + `nginx:alpine` | Servidor Estático (Vite) |

---

## Redes e Volumes Docker

**Redes:**

| Rede | Driver |
|------|--------|
| `app` | bridge |
| `services` | bridge |
| `storage` | bridge |

**Volumes:**

| Volume | Uso |
|--------|-----|
| `postgres_data` | Persistência do banco de dados |
| `minio_data` | Persistência das imagens |

---

## Banco de Dados — PostgreSQL

Naturalmente começaremos a entender a base dos dados e seguindo o fluxo da explicação falando de outros micro serviços.

O banco de dados é localhost e isolado por natureza. Veja a imagem a seguir, relacionamentos e entidades para compor toda a estrutura e escopo de consultas que o projeto deve ter:

[Ver Diagrama de Entidade e Relacionamento](images/DER.png)

| Campo | Valor |
|-------|-------|
| Nome do serviço | `postgres` |
| Nome do container | `loja-jm-decoracao-prod-postgres-1` |
| Imagem | `postgres:16-alpine` |
| URL interna Docker | `postgres:5432` |
| Redes | `services` |

---

## Banco de Imagens — MinIO

Saindo do banco de dados, entenderemos o banco de imagens. A imagem de software dele é o MinIO, guardando as imagens pelo nome no bucket próprio de imagens de produtos.


| Campo | Valor |
|-------|-------|
| Nome do serviço | `minio` |
| Nome do container | `jm_storage_images` |
| Imagem | `minio/minio` |
| URL host (console) | `http://localhost:9001` |
| URL interna Docker | `http://minio:9000` |
| Bucket | `loja-jm` |
| Redes | `app`, `storage` |

---

## Migrador de Imagens

O serviço a seguir é necessário para popular o banco de imagens MinIO. Ele roda à parte dos serviços, é o único independente e manual, sendo necessário apenas no build da aplicação com imagens — depois ele é descartado.

| Campo | Valor |
|-------|-------|
| Nome do serviço | `storage-migrator` |
| Nome do container | `jm_migrator` |
| Redes | `storage` |

---

## Proxy Reverso — Nginx

O serviço que é tanto externo quanto interno é o Nginx. Serve como proxy reverso da aplicação web, recebe requisições no navegador dos usuários e redireciona para serviços internos. É o mediador da aplicação.

[Ver diagrama do sistema](images/diagrama-sistema.pdf)

| Campo | Valor |
|-------|-------|
| Nome do serviço | `nginx` |
| Nome da imagem | `loja-jm-decoracao-prod-nginx` |
| Nome do container | `loja-jm-decoracao-prod-nginx-1` |
| URL host | `http://localhost:8080` |
| Redes | `app` |

---

## Frontend — Vite + Nginx Alpine

O serviço que naturalmente sucede o Nginx proxeador é o frontend. É o conjunto de páginas feitas com JSX compiladas para JS puro que o navegador do usuário receberá ao fazer uma requisição em `localhost:8080`.

| Campo | Valor |
|-------|-------|
| Nome do serviço | `vite-app` |
| Nome da imagem | `loja-jm-decoracao-prod-vite-app` |
| Nome do container | `loja-jm-decoracao-prod-vite-app-1` |
| URL host | `http://localhost:8080` |
| URL interna Docker | `http://vite-app:80` |
| Redes | `app` |

---

## Backend — Node.js / Express

O cérebro da aplicação. O serviço backend é o mais importante por ser o autenticador, recebe e envia dados e envia a saída de consultas organizadas para o site do navegador do usuário expô-las, tendo como intermédio o serviço Nginx. É o único serviço que está em todas as 3 redes.

| Campo | Valor |
|-------|-------|
| Nome do serviço | `app` |
| Nome da imagem | `loja-jm-decoracao-prod-app` |
| Nome do container | `loja-jm-decoracao-prod-app-1` |
| URL host | `http://localhost:8080/api` |
| Porta exposta ao host | `3001` |
| URL interna Docker | `http://app:3000` |
| Redes | `app`, `services`, `storage` |