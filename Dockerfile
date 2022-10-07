
# define build stage and create gzipped files
FROM node:16 as build-stage
WORKDIR /build
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npx gzipper compress ./dist

# define run stage and serve application
FROM node:16-alpine as run-stage
WORKDIR /app
COPY --from=build-stage /build/dist/ ./dist
RUN npm install -g http-server
EXPOSE 8080
CMD [ "http-server", "dist", "--gzip", "--proxy", "https://pwaboy.lmarschall.com?" ]