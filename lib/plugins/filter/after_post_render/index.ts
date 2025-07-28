import type Hexo from '../../../hexo';

const afterPostRenderIndex = (ctx: Hexo) => {
  const { filter } = ctx.extend;

  filter.register('after_post_render', require('./external_link'));
  filter.register('after_post_render', require('./excerpt'));
};

export default afterPostRenderIndex;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = afterPostRenderIndex;
  module.exports.default = afterPostRenderIndex;
}
