FROM node:20-alpine AS builder

WORKDIR /app

COPY docker/vite/package*.json ./
COPY docker/vite/vite.config.js ./

RUN npm install

COPY frontend ./frontend

RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine

USER root
RUN apk add --no-cache wget
USER nginx

COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY docker/vite/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]