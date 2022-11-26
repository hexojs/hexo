'use strict';

const { Schema } = require('warehouse').default;

module.exports = ctx => {
  const Data = new Schema({
    _id: {type: String, required: true},
    data: Object
  });

  return Data;
};
