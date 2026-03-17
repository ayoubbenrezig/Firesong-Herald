FROM node:24
WORKDIR /usr/src/app
COPY package.json ./
RUN npm i --omit=dev
COPY . .
CMD ["node", "index.js"]
