'use strict';

module.exports = ctx => {
  const { filter } = ctx.extend;

  filter.register('before_generate', require('./render_post'));
};
