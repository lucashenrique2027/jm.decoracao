# Infraestrutura do Projeto

Este documento tem por objetivo informar como o projeto é constituído, serviços, funções e arquitetura escolhida para atender a necessidade de um comércio físico. Até o momento este documento está atualizado com informações atuais, mas futuramente mais funcionalidades e tecnologias podem ser envolvidas.

O projeto atualmente é totalmente localhost, rodado na máquina que clona o projeto e que contenha as dependências necessárias que o `README.md` lista e seguindo seus passos.

---

## Serviços e Imagens

O projeto utiliza de serviços e imagens de softwares em versões específicas para atender funcionalidades e também ser a base do projeto. Todas as imagens customizadas (build a partir de Dockerfile) executam seus processos com **usuário não-root**, como medida de segurança:

| Imagem | Função | Usuário de execução |
|--------|--------|----------------------|
| `node:20-alpine` | Backend | `node` |
| `nginxinc/nginx-unprivileged:alpine` | Proxy Reverso | `nginx` (não-root, nativo da imagem) |
| `postgres:16-alpine` | Banco de Dados | `postgres` (padrão da imagem oficial) |
| `node:20-alpine` | Migrador de Imagens | `node` |
| `minio/minio` | Banco de Imagens | padrão da imagem oficial |
| `node:20-alpine` (build) + `nginxinc/nginx-unprivileged:alpine` (runtime) | Servidor Estático (Vite) | `nginx` (não-root, nativo da imagem) |

> **Nota:** o Nginx e o frontend (Vite) migraram de `nginx:alpine`/`nginx:latest` para `nginxinc/nginx-unprivileged:alpine`. Essa imagem é mantida pela mesma organização oficial do Nginx e já vem configurada para rodar sem privilégios de root, escutando internamente na porta **8080** em vez da 80 (portas abaixo de 1024 exigem root no Linux).

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

[Ver Diagrama de Entidade e Relacionamento](images/doc/DER.png)

| Campo | Valor |
|-------|-------|
| Nome do serviço | `postgres` |
| Nome do container | `loja-jm-decoracao-prod-postgres-1` |
| Imagem | `postgres:16-alpine` |
| URL interna Docker | `postgres:5432` |
| Redes | `services` |
| Porta exposta ao host | nenhuma (não publicada) |

### Hardening de autenticação (`pg_hba.conf`)

Por padrão, a imagem oficial do PostgreSQL libera conexões via socket Unix local (`local ... trust`) sem exigir senha — pensado para facilitar scripts de inicialização e administração local. Para este projeto, esse comportamento foi substituído por um `pg_hba.conf` customizado, que exige autenticação (`scram-sha-256`) mesmo para conexões locais:

```
local   all   all                  scram-sha-256
host    all   all   127.0.0.1/32   scram-sha-256
host    all   all   ::1/128        scram-sha-256
host    all   all   0.0.0.0/0      reject
```

O arquivo é montado em `/etc/postgresql/pg_hba.conf` (caminho fora do controle do `initdb`, para não ser sobrescrito na inicialização do banco) e referenciado via parâmetro de boot do container:

```yaml
command: ["postgres", "-c", "hba_file=/etc/postgresql/pg_hba.conf"]
```

Esse ajuste vai além do exigido pela Trilha A do guia (cujo equivalente de isolamento de rede, na Trilha B, seria feito via Security Groups), mas reforça o princípio de menor privilégio mesmo dentro do próprio container do banco.

---

## Banco de Imagens — MinIO

Saindo do banco de dados, entenderemos o banco de imagens. A imagem de software dele é o MinIO, guardando as imagens pelo nome no bucket próprio de imagens de produtos.

| Campo | Valor |
|-------|-------|
| Nome do serviço | `minio` |
| Nome do container | `jm_storage_images` |
| Imagem | `minio/minio` |
| URL host (dados/imagens) | `http://localhost:9000` |
| URL interna Docker | `http://minio:9000` |
| Bucket | `loja-jm` (leitura pública, escrita restrita às credenciais root) |
| Redes | `app`, `storage` |

> **Nota de segurança:** o console administrativo do MinIO (porta `9001`) **não é exposto ao host**. Apenas a porta `9000` (necessária para servir as imagens dos produtos publicamente) está publicada. O acesso ao painel administrativo só é possível internamente, dentro da rede Docker.

---

## Migrador de Imagens

O serviço a seguir é necessário para popular o banco de imagens MinIO. Ele roda à parte dos serviços, é o único independente e manual, sendo necessário apenas no build da aplicação com imagens — depois ele é descartado.

| Campo | Valor |
|-------|-------|
| Nome do serviço | `storage-migrator` |
| Nome do container | `jm_migrator` |
| Imagem base | `node:20-alpine` |
| Redes | `storage` |

---

## Proxy Reverso — Nginx

O serviço que é tanto externo quanto interno é o Nginx. Serve como proxy reverso da aplicação web, recebe requisições no navegador dos usuários e redireciona para serviços internos. É o mediador da aplicação.

[Ver diagrama do sistema](images/doc/diagrama-sistema.pdf)

| Campo | Valor |
|-------|-------|
| Nome do serviço | `nginx` |
| Imagem base | `nginxinc/nginx-unprivileged:alpine` |
| Nome da imagem | `loja-jm-decoracao-prod-nginx` |
| Nome do container | `loja-jm-decoracao-prod-nginx-1` |
| URL host | `http://localhost:8080` |
| Porta interna (non-root) | `8080` |
| Redes | `app` |

**Roteamento interno (`nginx.conf`):**

| Rota | Destino |
|------|---------|
| `/` | `vite-app:8080` |
| `/api` | `api:3000` |
| `/storageImages/` | `minio:9000/loja-jm/` |

---

## Frontend — Vite + Nginx Alpine

O serviço que naturalmente sucede o Nginx proxeador é o frontend. É o conjunto de páginas feitas com JSX compiladas para JS puro que o navegador do usuário receberá ao fazer uma requisição em `localhost:8080`.

| Campo | Valor |
|-------|-------|
| Nome do serviço | `vite-app` |
| Imagem base (build) | `node:20-alpine` |
| Imagem base (runtime) | `nginxinc/nginx-unprivileged:alpine` |
| Nome da imagem | `loja-jm-decoracao-prod-vite-app` |
| Nome do container | `loja-jm-decoracao-prod-vite-app-1` |
| URL host | `http://localhost:8080` (via proxy do Nginx) |
| URL interna Docker | `http://vite-app:8080` |
| Redes | `app` |

---

## Backend — Node.js / Express

O cérebro da aplicação. O serviço backend é o mais importante por ser o autenticador, recebe e envia dados e envia a saída de consultas organizadas para o site do navegador do usuário expô-las, tendo como intermédio o serviço Nginx. É o único serviço que está nas 3 redes.

| Campo | Valor |
|-------|-------|
| Nome do serviço | `api` |
| Nome da imagem | `loja-jm-decoracao-prod-api` |
| Nome do container | `loja-jm-decoracao-prod-api-1` |
| URL host | `http://localhost:8080/api` (via proxy do Nginx) |
| Porta exposta ao host | nenhuma (não publicada — acesso só via Nginx) |
| URL interna Docker | `http://api:3000` |
| Redes | `app`, `services`, `storage` |

> **Nota:** o serviço é o único ponto de ponte entre as três redes, e por isso o único caminho possível entre a camada de apresentação e a camada de persistência (`postgres`, na rede `services`). O Nginx e o frontend não têm rota de rede até o banco de dados — ver `evidencias-seguranca.md` para a comprovação prática desse isolamento.