'use strict';

module.exports = function(ctx) {
  var filter = ctx.extend.filter;

  filter.register('template_locals', require('./i18n'));
};
