import type Hexo from '../../../hexo/index.js';

const afterRenderIndex = (ctx: Hexo) => {
  const { filter } = ctx.extend;

  filter.register('after_render:html', require('./external_link'));
  filter.register('after_render:html', require('./meta_generator'));
};

export default afterRenderIndex;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = afterRenderIndex;
  module.exports.default = afterRenderIndex;
}
