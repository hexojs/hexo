'use strict';

const Schema = require('warehouse').Schema;

module.exports = ctx => {
  const Data = new Schema({
    _id: {type: String, required: true},
    data: Object
  });

  return Data;
};
