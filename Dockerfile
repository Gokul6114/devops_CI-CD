FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN cd server && npm install
RUN cd client && npm install

EXPOSE 3000

CMD ["npm","start"]
