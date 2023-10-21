FROM node:18

WORKDIR /usr/src/app

COPY . .

RUN npm install

RUN npm build

EXPOSE 5000

CMD ["node", "server/dist/bundle.js"]
