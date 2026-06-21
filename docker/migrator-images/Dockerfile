FROM node:alpine

WORKDIR /app

COPY docker/migrator-images/package*.json ./

COPY infra/s3.js ./infra/s3.js

RUN npm install && npm cache clean --force

USER node

CMD ["node", "infra/s3.js"]