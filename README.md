## pré-requisitos
### Instale os pacotes a seguir:
(Docker Desktop),(Git)

## baixar repositório (no terminal git bash)

```sh
git clone https://github.com/lucashenrique2027/jm.decoracao.git
```

## Mude de diretório:
```sh
cd  "./Loja-JM-Decoracao"
```

## Gere as variaveis:
```sh
./scripts/init-env.sh
```


## subir a aplicação com docker:
### Após iniciar o Docker Desktop e no mesmo terminal rode:

```sh
docker compose up --build
```

> Versão legada: `docker-compose up --build`

## Enviar imagens para a aplicação:
### Se for a primeira vez iniciando o projeto rode isto para popular o estoque de imagens do projeto:

```sh
docker compose -f docker-compose.upload.yml run --rm storage-migrator
```

## Delete as variáveis:
```sh
rm ./.env
```

## Acessar aplicação
- frontend                  http://localhost:8080
- Minio imagens produtos    http://localhost:9001      