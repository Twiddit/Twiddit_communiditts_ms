FROM node:18

RUN npm i -g nodemon
RUN mkdir -p /home/app

WORKDIR /home/app

COPY package*.json /home/app

RUN npm install


EXPOSE 3001

CMD ["npm", "start"]
