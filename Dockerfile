FROM node:10-alpine

RUN apk add --no-cache --update ca-certificates && \
    adduser --home /home/meetup12ru --disabled-password meetup12ru meetup12ru

ENV NODE_ENV prod
ADD dist /app
COPY package.json package-lock.json /app/
WORKDIR /app
RUN npm install

EXPOSE 3000

USER meetup12ru
ENTRYPOINT /app/entrypoint.sh
