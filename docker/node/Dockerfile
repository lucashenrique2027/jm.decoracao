FROM node:22
WORKDIR /app
# copia tudo (frontend e backend)
COPY . .
# instala dependencias backend 
WORKDIR /app/backend
RUN npm install
# instala dependencias frontend e gera build
WORKDIR /app/frontend
RUN npm install
RUN npm run build
# roda o servidor
WORKDIR /app/backend 
CMD ["npm", "start"]