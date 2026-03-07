## pré-requisitos
docker instalado

## baixar repositório (no terminal git bash)
git clone https://github.com/SEU-USUARIO/SEU-REPO.git
cd SEU-REPO

## build do frontend
cd frontend
npm install
npm run build
cd ..

## subir docker
docker-compose up --build

Docker Compose moderno:

docker compose up --build

## Acessar aplicação
- frontend express          http://localhost:8080
- backend nginx direto      http://localhost:3000/api (usar para testes)
- backend nginx via proxy   http://localhost:8080/api (usar para chamada de api real)
