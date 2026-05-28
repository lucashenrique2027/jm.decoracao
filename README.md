## pré-requisitos
### Instale os pacotes a seguir:
(Docker Desktop),(Git)


### Ambiente Linux:
(Docker engine,Docker compose),(Git)
Siga as instruções corretas e baixe atraves do link a sua versão adequada: 
https://docs.docker.com/engine/install/

Certifique de que o Docker daemon esteja rodando em sua máquina.

## baixar repositório (no terminal BASH)

### Ambiente Linux ou WSL:
faça:
```BASH
cd $HOME
```


```BASH
git clone https://github.com/lucashenrique2027/jm.decoracao.git
```

## Mude de diretório:
```BASH
cd  "./jm.decoracao"
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
docker compose up --build -d
```

> Versão legada: `docker-compose up --build -d`

## Enviar imagens para a aplicação:
### Se for a primeira vez iniciando o projeto rode isto para popular o estoque de imagens do projeto Após o comando anterior ser finalizado:

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