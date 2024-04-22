FROM node:20.11.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

ENV PORT 8080

EXPOSE $PORT

CMD ["npm", "run", "start"]
