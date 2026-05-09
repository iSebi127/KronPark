FROM node:20-alpine AS builder

WORKDIR /app

ARG REACT_APP_API_URL=http://localhost:8080
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage pentru teste
FROM node:20-alpine AS tester
WORKDIR /app
COPY --from=builder /app /app
CMD ["npm", "run", "test", "--", "--run"]

FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/build ./build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]