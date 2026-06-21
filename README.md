# Loja JM Decoração

Aplicação full-stack containerizada com Docker Compose, composta por frontend (Vite), backend (Node.js/API), banco de dados (PostgreSQL) e armazenamento de imagens (MinIO), orquestrados via Nginx como proxy reverso.

> Para detalhes de arquitetura e infraestrutura, consulte [`arquitetura.md`](./docs/arquitetura.md) e [`infraestrutura.md`](./docs/infraestrutura.md).

## Pré-requisitos

### Instale os pacotes a seguir:
(Docker Desktop), (Git)

### Ambiente Linux:
(Docker Engine, Docker Compose), (Git)

Siga as instruções corretas e baixe através do link a sua versão adequada:
https://docs.docker.com/engine/install/

Certifique-se de que o Docker daemon esteja rodando em sua máquina.

## Baixar repositório (no terminal BASH)

### Ambiente Linux ou WSL:

```BASH
cd $HOME
```

```BASH
git clone https://github.com/lucashenrique2027/jm.decoracao.git
```

## Mude de diretório:

```BASH
cd "./jm.decoracao"
```

### Se estiver no Linux

## Dê permissões:

```BASH
chmod +x ./scripts/init-env.sh
```

## Gere as variáveis:

```BASH
./scripts/init-env.sh
```

> O script gera o arquivo `.env` localmente, com credenciais aleatórias
> (senha do banco, JWT secrets, senha root do MinIO), usando entropia
> nativa do sistema (`/dev/urandom`). Nenhuma credencial fica versionada
> no repositório — cada execução do script gera segredos únicos.

## Subir a aplicação com Docker:

### Após iniciar o Docker Desktop e no mesmo terminal, rode:

```BASH
docker compose up --build -d
```

> Versão legada: `docker-compose up --build -d`

## Enviar imagens para a aplicação:

### Se for a primeira vez iniciando o projeto, rode isto para popular o estoque de imagens do projeto, após o comando anterior ser finalizado:

```BASH
docker compose -f docker-compose.upload.yml run --rm storage-migrator
```

## Acessar aplicação

- Frontend                          http://localhost:8080
- MinIO (acesso direto às imagens)  http://localhost:9000/loja-jm/\<nome-do-arquivo\>

> O console administrativo do MinIO (porta 9001) **não é exposto ao host**
> de forma intencional, por segurança. Apenas a porta 9000 (leitura das
> imagens do bucket público) é publicada.

## Limpeza (Cleanup)

Para remover os containers e as imagens construídas, sem apagar os dados persistidos:

```BASH
docker compose down
```

Para remover também os volumes nomeados (`postgres_data`, `minio_data`), apagando todos os dados do banco e das imagens:

```BASH
docker compose down -v
```

### Sobre a remoção do `.env`

O arquivo `.env` é gerado localmente pelo `init-env.sh` e usado apenas
no momento em que os containers são criados (`docker compose up`).
Depois que os containers estão em execução, as variáveis já foram
injetadas no ambiente de cada um — então remover o `.env` da raiz do
projeto **não interrompe a aplicação em execução**:

```BASH
rm ./.env
```

Ele só volta a ser necessário se você precisar **recriar os containers
do zero** (`docker compose up --build`) ou rodar o `storage-migrator`
novamente. Nesses casos, basta executar `./scripts/init-env.sh` de novo
para gerar um novo `.env`, com novas credenciais aleatórias.

Por isso ele não é versionado no repositório: cada execução pode gerar
suas próprias credenciais, eliminando o risco de hardcode de senhas
ou segredos no código-fonte. Chaves de API e segredos de pipeline
(CI/CD) são gerenciados via GitHub Secrets, nunca expostos em texto plano.