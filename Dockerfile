FROM zenika/alpine-chrome:with-node

WORKDIR /app

COPY ./package*.json .
RUN --mount=type=cache,target=/root/.npm \
  npm ci --only=production

COPY ./src ./src

ENV CHROME_LOCATION=/usr/bin/chromium-browser

ENTRYPOINT ["npm", "run", "prerender"]
