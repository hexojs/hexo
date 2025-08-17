import type Hexo from '../../../hexo/index.js';
import backtickCodeBlock from './backtick_code_block.js';
import titlecase from './titlecase.js';

const beforePostRenderIndex = (ctx: Hexo) => {
  const { filter } = ctx.extend;

  filter.register('before_post_render', backtickCodeBlock(ctx));
  filter.register('before_post_render', titlecase);
};

export default beforePostRenderIndex;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = beforePostRenderIndex;
  module.exports.default = beforePostRenderIndex;
}
