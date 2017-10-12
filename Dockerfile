FROM node:8

COPY package.json .

RUN npm install

ADD . .

CMD ["node", "index.js"]
