const { Mongoose } = require("mongoose");
const { PrerenderCache } = require("../cache");
const { definePrerenderCacheModel } = require("./PrerenderCacheModel");

module.exports.MongodbPrerenderCache = class MongodbPrerenderCache extends (
  PrerenderCache
) {
  #mongoose;
  #model;

  /**
   * @param {Mongoose} mongoose
   * @param {import('mongoose').Model} model
   */
  constructor(mongoose, model) {
    super();

    this.#mongoose = mongoose;
    this.#model = model;
  }

  /**
   * @param {string} mongodbUri
   * @returns {Promise<MongodbPrerenderCache>}
   */
  static async create(mongodbUri) {
    const mongoose = new Mongoose();
    const cacheModel = definePrerenderCacheModel(mongoose);
    await mongoose.connect(mongodbUri);

    return new MongodbPrerenderCache(mongoose, cacheModel);
  }

  /**
   * @inheritdoc
   */
  async get(url) {
    const entry = await this.#model.findOne({ url }).lean();

    return (
      entry && {
        html: entry.html,
        headers: entry.headers,
        statusCode: entry.statusCode,
        updatedAt: entry.updatedAt,
      }
    );
  }

  /**
   * @inheritdoc
   */
  async upsert(url, page) {
    await this.#model.updateOne(
      { url },
      {
        $set: {
          statusCode: page.statusCode,
          html: page.html ?? null,
          headers: page.headers ?? {},
        },
      },
      { upsert: true }
    );
  }

  /**
   * @inheritdoc
   */
  async close() {
    await this.#mongoose.disconnect();
  }
};
