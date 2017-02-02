'use strict';

var Schema = require('warehouse').Schema;
var pathFn = require('path');

module.exports = function(ctx) {
  var Asset = new Schema({
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
