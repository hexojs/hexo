'use strict';

const Schema = require('warehouse').Schema;
const pathFn = require('path');

module.exports = ctx => {
  const Asset = new Schema({
    _id: {type: String, required: true},
    path: {type: String, required: true},
    modified: {type: Boolean, default: true},
    renderable: {type: Boolean, default: true}
  });

  Asset.virtual('source').get(function() {
    return pathFn.join(ctx.base_dir, this._id);
  });

  return Asset;
};
