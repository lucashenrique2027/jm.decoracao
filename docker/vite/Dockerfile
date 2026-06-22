FROM node:20-alpine


WORKDIR /app/frontend

COPY /frontend/package*.json /app/frontend
COPY /frontend/vite.config.js /app/frontend

RUN npm install

COPY frontend /app/frontend

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]