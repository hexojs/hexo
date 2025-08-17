import type Hexo from '../../../hexo/index.js';
import externalLink from './external_link.js';
import excerpt from './excerpt.js';

const afterPostRenderIndex = (ctx: Hexo) => {
  const { filter } = ctx.extend;

  filter.register('after_post_render', externalLink);
  filter.register('after_post_render', excerpt);
};

export default afterPostRenderIndex;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = afterPostRenderIndex;
  module.exports.default = afterPostRenderIndex;
}
