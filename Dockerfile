FROM node:20-alpine

ENV NODE_OPTIONS=--use-openssl-ca

# Install build dependencies
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh-client libc6-compat python3 make g++ ca-certificates

# Create app directory
RUN mkdir -p /app/

# Bundle app source
COPY . /app/
WORKDIR /app

# Install dependencies
RUN npm install --unsafe-perm

EXPOSE 3000

ENTRYPOINT [ "npm", "start" ]
