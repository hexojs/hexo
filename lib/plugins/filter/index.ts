import type Hexo from '../../hexo/index.js';

const filter = (ctx: Hexo) => {
  const { filter } = ctx.extend;

  require('./after_render')(ctx);
  require('./after_post_render')(ctx);
  require('./before_post_render')(ctx);
  require('./before_exit')(ctx);
  require('./before_generate')(ctx);
  require('./template_locals')(ctx);

  filter.register('new_post_path', require('./new_post_path'));
  filter.register('post_permalink', require('./post_permalink'));
};

// For ESM compatibility
export default filter;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = filter;
  // For ESM compatibility
  module.exports.default = filter;
}
