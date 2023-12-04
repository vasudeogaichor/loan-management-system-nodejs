FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run sequelize:migrate

EXPOSE 3000

CMD ["npm", "dev"]