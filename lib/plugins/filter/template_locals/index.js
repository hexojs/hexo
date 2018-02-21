'use strict';

module.exports = ctx => {
  const filter = ctx.extend.filter;

  filter.register('template_locals', require('./i18n'));
};
