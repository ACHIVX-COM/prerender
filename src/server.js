const prerender = require("prerender");
const prerenderServer = require("prerender/lib/server");
const prerenderUtil = require("prerender/lib/util");
const express = require("express");
const compression = require("compression");
const bodyParser = require("body-parser");
const { MongodbPrerenderCache } = require("./cache/mongodb/mongodbCache");
const { cachePlugin } = require("./cache/cachePlugin");

const createMongodbCache = (module.createMongodbCache =
  async function createMongodbCache() {
    const mongodbUri = process.env.MONGODB_URI;
    return await MongodbPrerenderCache.create(mongodbUri);
  });

const startServerWithCache = (module.startServerWithCache =
  /**
   * Starts a prerender http server with a cache plugin using given cache instance.
   *
   * Registers SIGTERM and SIGINT handlers that will stop the server and close cache.
   *
   * @param {import('./cache/cache').PrerenderCache} cache
   * @returns {{
   *  app: express.Application,
   *  httpServer: import('http').Server,
   *  prerenderServer: typeof prerenderServer
   * }}
   */
  async function startServerWithCache(cache) {
    // Part of prerender's code copied here in order to add DELETE handlers to the app
    prerenderServer.init({
      chromeFlags: [
        "--headless",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--remote-debugging-port=9222",
        "--hide-scrollbars",
        ...(process.env.CHROME_SANDBOX === "true" ? [] : ["--no-sandbox"]),
      ],
      chromeLocation: process.env.CHROME_BIN,
      logRequests: process.env.PRERENDER_LOG_REQUESTS === "true",
    });

    prerenderServer.use(prerender.sendPrerenderHeader());
    prerenderServer.use(prerender.browserForceRestart());
    prerenderServer.use(prerender.addMetaTags());
    prerenderServer.use(prerender.removeScriptTags());
    prerenderServer.use(prerender.httpHeaders());
    prerenderServer.use(cachePlugin(cache));

    prerenderServer.start();

    const app = express();

    app.disable("x-powered-by");
    app.use(compression());

    app.get("*", (...args) => prerenderServer.onRequest(...args));

    app.post("*", bodyParser.json({ type: () => true }), (...args) =>
      prerenderServer.onRequest(...args),
    );

    app.delete("*", async (req, res, next) => {
      try {
        const url = prerenderUtil.getUrl(req.url);
        await cache.delete(url);
        res.sendStatus(204);
      } catch (e) {
        next(e);
      }
    });

    const port = process.env.PORT || 3000;

    const httpServer = app.listen(port, () =>
      console.log("Prerender server accepting requests on port", port),
    );

    async function stop() {
      console.log("Closing HTTP server...");
      await new Promise((res) => httpServer.close(res));
      console.log("Closing cache...");
      await cache.close();
    }

    process.on("SIGINT", stop);
    process.on("SIGTERM", stop);

    return { app, prerenderServer, httpServer };
  });

if (require.main === module) {
  createMongodbCache()
    .then((cache) => startServerWithCache(cache))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
