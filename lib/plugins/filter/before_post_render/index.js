'use strict';

module.exports = ctx => {
  const { filter } = ctx.extend;

  filter.register('before_post_render', require('./backtick_code_block'));
  filter.register('before_post_render', require('./titlecase'));
};
