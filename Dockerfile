FROM node:current-alpine

RUN apk update && apk --no-cache add git
RUN npm install -g hexo-cli


CMD ["/bin/ash"]