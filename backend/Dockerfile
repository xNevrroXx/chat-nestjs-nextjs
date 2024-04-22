FROM node

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

ENV PORT 3001

EXPOSE $PORT

CMD ["npm", "run", "start:prod"]
