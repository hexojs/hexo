FROM node:latest
WORKDIR /app
COPY . .
RUN yarn && npx hexo init blog 
ENTRYPOINT cd blog && npx hexo server