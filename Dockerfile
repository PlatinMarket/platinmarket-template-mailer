FROM node:10.23.0-alpine3.10

# Install Git
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh libc6-compat

# Create app directory
RUN mkdir -p /app/

# Bundle app source
COPY . /app/
WORKDIR /app

# Install depencies
RUN npm --unsafe-perm install

EXPOSE 3000

ENTRYPOINT [ "npm", "start" ]
