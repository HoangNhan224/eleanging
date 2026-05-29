#FROM node:18-alpine
#
## Create app directory
#RUN mkdir -p /usr/src/app
#
#WORKDIR /usr/src/app
#
## Bundle app source
#COPY . /usr/src/app
#
##RUN yarn install
#RUN npm install -g yarn
#
#EXPOSE 8000
#
#CMD [ "yarn", "start" ]
# CMD [ "yarn", "dev" ]

FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]