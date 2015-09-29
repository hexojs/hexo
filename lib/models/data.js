'use strict';

var Schema = require('warehouse').Schema;

module.exports = function(ctx) {
  var Data = new Schema({
    _id: {type: String, required: true},
    data: Object
  });

  return Data;
};
