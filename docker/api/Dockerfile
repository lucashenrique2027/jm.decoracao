FROM node:20-alpine

WORKDIR /app/backend

COPY docker/api/package*.json ./

RUN npm install --production && npm cache clean --force

COPY backend ./

EXPOSE 3000

USER node

CMD ["npm", "start"]