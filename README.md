## pré-requisitos
### Instale os pacotes a seguir:
(Docker Desktop),(Git)

### Ambiente Linux:
(Docker engine,Docker compose),(Git)

## baixar repositório (no terminal git bash)

```BASH
git clone https://github.com/lucashenrique2027/jm.decoracao.git
```

## Mude de diretório:
```BASH
cd  "./Loja-JM-Decoracao"
```

### Se estiver no Linux
## De permissões:
```BASH
chmod +x ./scripts/init-env.sh
```

## Gere as variaveis:
```BASH
./scripts/init-env.sh
```


## subir a aplicação com docker:
### Após iniciar o Docker Desktop e no mesmo terminal rode:

```BASH
docker compose up --build
```

> Versão legada: `docker-compose up --build`

## Enviar imagens para a aplicação:
### Se for a primeira vez iniciando o projeto rode isto para popular o estoque de imagens do projeto:

```BASH
docker compose -f docker-compose.upload.yml run --rm storage-migrator
```

## Delete as variáveis:
```BASH
rm ./.env
```

## Acessar aplicação
- frontend                  http://localhost:8080
- Minio imagens produtos    http://localhost:9001      