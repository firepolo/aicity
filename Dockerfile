FROM node

WORKDIR /app

COPY package*.json .

RUN npm ci

COPY src src
COPY public public

EXPOSE 4000

ENTRYPOINT ["npm", "start"]