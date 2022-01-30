FROM node:slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENTRYPOINT [ "node", "index.js" ]

EXPOSE 5000