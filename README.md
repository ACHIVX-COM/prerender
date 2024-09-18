# ACHIVX Prerender

A [prerender](https://github.com/prerender/prerender) with rendered pages cache, available as a [Docker image](https://hub.docker.com/r/achivx/prerender).

The cache is stored in a MongoDB collection.

## Running

The included [docker compose file](./docker-compose.yaml) provides an easy way to start both prerender server and MongoDB instance:

```sh
# Run a prebuilt image from DockerHub
docker compose --profile prebuilt up

# Build image from sources and run (the last --build option can be omitted if the code was not changed)
docker compose --profile build up --build
```

Alternatively, you can run the server from sources:

```sh
# Install JS dependencies
npm ci

# Run the server
MONGODB_URI=mongodb://localhost/prerender CHROME_LOCATION=$(which chromium-browser) CHROME_SANDBOX=true npm run prerender
```

## Managing cache

In addition to Prerender's standard functionality, the ACHIVX Prerender server exposes additional methods to manage the cache.

### Re-rendering a page

The ACHIVX Prerender server uses an aggressive caching strategy - if the requested page is present in the cache, it will be returned from the cache and will not be re-rendered.
Cache-control header returned by the origin server will not be respected.

The intent behind this strategy is to minimize the latency of responses to search engine bots at any cost while also avoiding any extra re-renders.

To update the cache in case of page change you should send a specially formatted request to the ACHIVX Prerender server.
The request should include additional `X-AXPR-Force-Rerender` header set to `true`, e.g.:

```sh
curl -H 'X-AXPR-Force-Rerender: true' http://localhost:3000/https://google.com/
```

### Deleting a page

In case a page is deleted from your site, you may also want to remove it from prerender cache.
It can be done by sending a `DELETE` request to the same endpoint as one that was used to render a page using a `GET` request:

```sh
curl -X DELETE http://localhost:3000/https://google.com/
```

Note that `/render?url=...` path won't work for `DELETE` method.
