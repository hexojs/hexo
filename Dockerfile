FROM node:current-alpine

RUN apk update && apk add bash git
RUN npm install -g hexo-cli


CMD ["/bin/bash"]