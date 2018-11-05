'use strict';

const { Schema } = require('warehouse');

module.exports = ctx => {
  const Data = new Schema({
    _id: {type: String, required: true},
    data: Object
  });

  return Data;
};
