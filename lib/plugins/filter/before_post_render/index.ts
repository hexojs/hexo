import type Hexo from '../../../hexo';

const beforePostRenderIndex = (ctx: Hexo) => {
  const { filter } = ctx.extend;

  filter.register('before_post_render', require('./backtick_code_block')(ctx));
  filter.register('before_post_render', require('./titlecase'));
};

export default beforePostRenderIndex;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = beforePostRenderIndex;
  module.exports.default = beforePostRenderIndex;
}
