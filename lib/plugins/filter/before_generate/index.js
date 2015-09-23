'use strict';

module.exports = function(ctx) {
  var filter = ctx.extend.filter;

  filter.register('before_generate', require('./render_post'));
};
