ARG IMAGE=node:18.12.1-alpine

FROM ${IMAGE} as build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm i

COPY . .

CMD ["npm", "start"]