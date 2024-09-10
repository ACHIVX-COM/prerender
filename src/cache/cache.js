/**
 * @typedef {Object} RenderedPage
 * @prop {Record<string, string>} headers
 * @prop {number} statusCode
 * @prop {string?} html
 */

/**
 * @typedef {RenderedPage & {updatedAt: Date?}} CachedPage
 */

/**
 * @abstract
 */
module.exports.PrerenderCache = class PrerenderCache {
  /**
   * Store/update a cached page.
   *
   * @param {string} _url page URL
   * @param {RenderedPage} _page
   */
  async upsert(_url, _page) {
    throw new Error("not implemented");
  }

  /**
   * Get page from cache.
   *
   * @param {string} _url page URL
   * @returns {Promise<CachedPage?>}
   */
  async get(_url) {
    throw new Error("not implemented");
  }

  /**
   * Close any connections held by this PrerenderCache instance.
   */
  async close() {}
};
