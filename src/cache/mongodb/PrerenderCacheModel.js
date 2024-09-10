const mongoose = require("mongoose");

const prerenderCacheSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      unique: true,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    headers: {
      type: Object,
      required: true,
    },
    html: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports.definePrerenderCacheModel = (mongoose) =>
  mongoose.model("PrerenderCache", prerenderCacheSchema);
