## pré-requisitos
### Instale os pacotes a seguir:
(Docker Desktop),(Git)

## baixar repositório (no terminal git bash)

```sh
git clone https://github.com/lucashenrique2027/Loja-JM-Decoracao
```

## Mude de diretório:
```sh
cd  "./Loja-JM-Decoracao"
```

## Use as variaveis:
Altere o nome do arquivo ".env.example" para -> ".env".
de forma mais automatica rode:

```sh
mv .env.example .env
```

## subir a aplicação com docker:
### Após iniciar o Docker Desktop e no mesmo terminal rode:

```sh
docker-compose up --build
```

Docker Compose moderno:
```sh
docker compose up --build
```

## Enviar imagens para a aplicação:
### Se for a primeira vez iniciando o projeto rode isto para popular o estoque de imagens do projeto:

```sh
docker compose -f docker-compose.upload.yml run --rm storage-migrator
```

## Acessar aplicação
- frontend express          http://localhost:8080
- Swagger Docs              http://localhost:8080/api/info
- backend nginx direto      http://localhost:3000/api (usar para testes)
- backend nginx via proxy   http://localhost:8080/api (usar para chamada de api real)
- Minio imagens produtos    http://localhost:9001      

psql -h localhost -U jm -d jm_decoracao