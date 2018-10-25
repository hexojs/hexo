'use strict';

const { Schema } = require('warehouse');
const { join } = require('path');

module.exports = ctx => {
  const Asset = new Schema({
    _id: {type: String, required: true},
    path: {type: String, required: true},
    modified: {type: Boolean, default: true},
    renderable: {type: Boolean, default: true}
  });

  Asset.virtual('source').get(function() {
    return join(ctx.base_dir, this._id);
  });

  return Asset;
};
