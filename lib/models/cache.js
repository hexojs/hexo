'use strict';

var Schema = require('warehouse').Schema;

module.exports = function(ctx){
  var Cache = new Schema({
    _id: {type: String, required: true},
    shasum: {type: String},
    modified: {type: Number, default: Date.now}
  });

  return Cache;
};