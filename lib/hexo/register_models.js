'use strict';

const models = require('../models');

module.exports = ctx => {
  const db = ctx.database;

  const keys = Object.keys(models);

  for (const key of keys) {
    db.model(key, models[key](ctx));
  }
};
