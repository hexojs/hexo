'use strict';

module.exports = function(ctx) {
  var filter = ctx.extend.filter;

  filter.register('before_post_render', require('./backtick_code_block'));
  filter.register('before_post_render', require('./titlecase'));
};
