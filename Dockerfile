FROM node:11.15.0-alpine

RUN apk add --no-cache tini

WORKDIR /app

COPY package*.json ./

COPY build/ /app/

RUN npm install

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
