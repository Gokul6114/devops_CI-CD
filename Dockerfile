FROM node:18

WORKDIR /app

COPY . .

RUN npm install
RUN cd server && npm install
RUN cd client && npm install

RUN npm install -g nodemon
RUN npm install -g vite

EXPOSE 3000

CMD ["npm","start"]
