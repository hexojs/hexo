'use strict';

module.exports = function(ctx){
  var filter = ctx.extend.filter;

  require('./after_post_render')(ctx);
  require('./before_post_render')(ctx);
  require('./before_exit')(ctx);
  require('./before_generate')(ctx);
  require('./template_locals')(ctx);

  filter.register('new_post_path', require('./new_post_path'));
  filter.register('post_permalink', require('./post_permalink'));
};