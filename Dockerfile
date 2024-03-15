# syntax=docker/dockerfile:1

FROM node:18-alpine
WORKDIR /corehub
COPY . .

# Set the necessary environment variables
ENV WS_CORETIME_CHAIN="ws://127.0.0.1:9910"
ENV WS_RELAY_CHAIN="ws://127.0.0.1:9900"
ENV WS_CONTRACTS_CHAIN="ws://127.0.0.1:9920"

# Given that Coretime-Mock deploys the contract with no salt we can be sure
# this is the address as long as it is not modified. 
ENV CONTRACT_XC_REGIONS="bA3hAXgbErTUWg8uSkcPhuqqHyF1em6AfPbATH9g9QM4HJP"
ENV CONTRACT_MARKET="WdSbRZeLbQm1CqFwWhHoGTvH51Fs1rbQTLHhRDSqDpq4a2b"

RUN apk add --no-cache libc6-compat

# Install dependencies based on the preferred package manager
RUN npm i;

RUN npm run build
CMD ["npm", "start"]
EXPOSE 3000
