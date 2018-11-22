FROM node:8-slim

WORKDIR /starter
ENV NODE_ENV production \
    MONGODB_URI=mongodb://admin:123456@ds151993.mlab.com:51993/troqueo

COPY package.json /starter/package.json

RUN npm install --production

COPY .env /starter/.env
COPY . /starter

CMD ["npm","start"]

EXPOSE 8080

