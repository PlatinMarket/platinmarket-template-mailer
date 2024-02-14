FROM node:8.9.0-alpine

ENV NODE_OPTIONS=--use-openssl-ca

# Install Git
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh libc6-compat python make g++ ca-certificates

# Create app directory
RUN mkdir -p /app/

# Bundle app source
COPY . /app/
WORKDIR /app

# Install depencies
RUN npm --unsafe-perm install

EXPOSE 3000

ENTRYPOINT [ "npm", "start" ]
