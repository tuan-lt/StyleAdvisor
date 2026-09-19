FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi


COPY . .

ENV NODE_ENV=development
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "dev"]
