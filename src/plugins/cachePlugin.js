const httpStatus = require("statuses");

/**
 * @typedef {Object} CacheUpsertRequest
 * @prop {{[string]: string}} headers
 * @prop {number} statusCode
 * @prop {string?} html
 */

/**
 * @callback CacheUpsertCb
 * @param {string} url
 * @param {CacheUpsertRequest} req
 * @returns {Promise<void>}
 */

/**
 * @typedef {Object} CacheReadResponse
 * @prop {{[string]: string}} headers
 * @prop {number} statusCode
 * @prop {string?} html
 * @prop {Date} updatedAt
 */

/**
 * @callback CacheReadCallback
 * @param {string} url
 * @returns {Promise<CacheReadResponse?>}
 */

/**
 * @typedef {Object} Cache
 * @prop {CacheUpsertCb} upsert
 * @prop {CacheReadCallback} get
 */

/**
 * @param {Cache} cache 
 * @returns {import('prerender').}
 */
module.exports.cachePlugin = (cache) => {
  const requestReceived = async (req, res, next) => {
    if (req.query.recache) {
      next();

      return;
    }

    const doc = await cache.get(req.prerender.url);

    if (doc) {
      req.prerender.cacheHit = true;

      res.setHeader("X-AXPR-Cache", "hit");
      res.setHeader("X-AXPR-Cached-Since", doc?.updatedAt?.toISOString?.());

      for (const [header, value] of Object.entries(doc.headers)) {
        res.setHeader(header, value);
      }

      let content;

      try {
        content = doc.html || httpStatus(doc.statusCode);
      } catch (_) {
        content = "Unknown";
      }

      res.send(doc.statusCode, content);
    } else {
      res.setHeader("X-AXPR-Cache", "miss");

      next();
    }
  };

  const beforeSend = async (req, res, next) => {
    if (!req.prerender.cacheHit && req.prerender.statusCode < 500) {
      try {
        const html =
          req.prerender.domContentEventFired && req.prerender.statusCode < 300
            ? req.prerender.content.toString()
            : undefined;

        await cache.upsert(req.prerender.url, {
          headers: req.prerender.headers,
          statusCode: req.prerender.statusCode,
          html,
        });
      } catch (err) {
        logger.error(err);
      }
    }

    next();
  };

  const pageLoaded = (req, res, next) => {
    if (!req.prerender.content || req.prerender.renderType !== "html") {
      next();

      return;
    }
    next();
  };

  return {
    requestReceived,
    beforeSend,
    pageLoaded,
  };
};
