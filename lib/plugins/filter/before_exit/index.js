'use strict';

module.exports = ctx => {
  const { filter } = ctx.extend;

  filter.register('before_exit', require('./save_database'));
};
