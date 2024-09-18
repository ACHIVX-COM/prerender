FROM zenika/alpine-chrome:with-node

WORKDIR /app

COPY ./package*.json .
RUN --mount=type=cache,uid=1000,gid=1000,target=/home/chrome/.npm \
  npm ci --omit=dev

COPY ./src ./src

ENV CHROME_LOCATION=/usr/bin/chromium-browser

ENTRYPOINT ["npm", "run", "prerender"]
