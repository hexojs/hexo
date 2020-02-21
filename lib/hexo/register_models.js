'use strict';

const models = require('../models');

module.exports = ctx => {
  const db = ctx.database;

  const keys = Object.keys(models);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    db.model(key, models[key](ctx));
  }
};
