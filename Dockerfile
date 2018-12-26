FROM node:10-alpine

ENV NODE_ENV prod
ADD src /app/src
ADD www /app/www
ADD views /app/views
COPY index.js package.json entrypoint.sh /app/
WORKDIR /app
RUN apk add --no-cache --update ca-certificates && \
    adduser --home /home/meetup12ru --disabled-password meetup12ru meetup12ru && \
    npm install

EXPOSE 3000

USER meetup12ru
ENTRYPOINT /app/entrypoint.sh
