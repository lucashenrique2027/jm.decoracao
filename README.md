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

## subir a aplicação com docker:
### Após iniciar o Docker Desktop e no mesmo terminal rode:

```sh
docker-compose up --build
```

## Acessar aplicação
- frontend express          http://localhost:8080
- backend nginx direto      http://localhost:3000/api (usar para testes)
- backend nginx via proxy   http://localhost:8080/api (usar para chamada de api real)
