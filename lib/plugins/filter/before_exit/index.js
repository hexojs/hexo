'use strict';

module.exports = function(ctx) {
  var filter = ctx.extend.filter;

  filter.register('before_exit', require('./save_database'));
};
