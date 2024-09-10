const prerender = require("prerender");
const { MongodbPrerenderCache } = require("./cache/mongodb/mongodbCache");
const { cachePlugin } = require("./cache/cachePlugin");

async function startServer() {
  const mongodbUri = process.env.MONGODB_URI;
  const cache = await MongodbPrerenderCache.create(mongodbUri);

  const server = prerender({
    chromeFlags: [
      "--headless",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--remote-debugging-port=9222",
      "--hide-scrollbars",
      "--no-sandbox",
    ],
    chromeLocation: process.env.CHROME_LOCATION,
  });

  server.use(prerender.sendPrerenderHeader());
  server.use(prerender.browserForceRestart());
  server.use(prerender.addMetaTags());
  server.use(prerender.removeScriptTags());
  server.use(prerender.httpHeaders());
  server.use(cachePlugin(cache));

  server.start();

  async function stop() {
    console.log("Closing cache...");
    await cache.close();
  }

  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
