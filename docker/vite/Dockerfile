FROM node:20-alpine

WORKDIR /app

# copia package.json + package-lock.json para cache de dependências
COPY docker/vite/package*.json .
COPY docker/vite/vite.config.js .

# instala dependências
RUN npm install 

# copia o restante do frontend
COPY frontend ./frontend

# expõe a porta que o Vite usa (5173 por padrão)
EXPOSE 5173

# comando para rodar o Vite dev server
CMD ["npm","run", "dev"]