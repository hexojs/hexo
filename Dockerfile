FROM node:20-slim AS base

WORKDIR /usr/src/hexo

COPY package*.json ./

COPY . .

RUN npm run clean && npm run build

CMD ["npm", "test"]
