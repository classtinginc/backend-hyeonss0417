FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

# copy exclude node_modules
COPY ./prisma/schema.prisma ./prisma/schema.prisma
COPY ./src ./src
COPY ./test ./test
COPY ./.eslintrc.js ./.eslintrc.js
COPY ./tsconfig.json ./tsconfig.json
COPY ./tsconfig.build.json ./tsconfig.build.json
COPY ./tspec.config.json ./tspec.config.json

# Migrate
RUN yarn migrate --name init

# Test
RUN yarn test:e2e

# Build
RUN yarn build

# Expose port
EXPOSE 80

CMD [ "yarn", "start" ]
