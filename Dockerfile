# syntax=docker/dockerfile:1

FROM node:18-alpine
WORKDIR /corehub
COPY . .

# Set the necessary environment variables
ENV WS_CORETIME_CHAIN="ws://127.0.0.1:9910"
ENV WS_RELAY_CHAIN="ws://127.0.0.1:9900"

RUN apk add --no-cache libc6-compat

# Install dependencies based on the preferred package manager
RUN npm i;

RUN npm run build
CMD ["npm", "start"]
EXPOSE 3000
