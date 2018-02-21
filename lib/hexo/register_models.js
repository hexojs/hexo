'use strict';

const models = require('../models');

module.exports = ctx => {
  const db = ctx.database;

  const keys = Object.keys(models);
  let key = '';

  for (let i = 0, len = keys.length; i < len; i++) {
    key = keys[i];
    db.model(key, models[key](ctx));
  }
};
