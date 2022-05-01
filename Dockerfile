FROM node:16-alpine3.14
WORKDIR /
COPY package.json /
RUN npm install && npm cache clean --force
COPY . /
CMD node src/App.js
EXPOSE 8081