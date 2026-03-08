# Imagem base estável e leve
FROM node:20-alpine

# Define diretório de trabalho
WORKDIR /app/backend

# Copia apenas arquivos de dependência para cache do npm
COPY backend/package*.json ./

# Instala dependências de produção
RUN npm install --production

# Copia o restante do backend
COPY backend ./

# Expõe a porta que o backend usa
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "start"]