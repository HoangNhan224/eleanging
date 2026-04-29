FROM node:alpine

# Create app directory
RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

# Bundle app source
COPY . /usr/src/app

RUN npm install -g selenium-side-runner
RUN npm install -g chromedriver

# EXPOSE 8000

# CMD [ "yarn", "start" ]