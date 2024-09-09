const prerender = require("prerender");

var server = prerender({
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

server.start();
