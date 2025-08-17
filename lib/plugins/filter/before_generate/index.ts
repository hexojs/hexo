import type Hexo from '../../../hexo/index.js';
import renderPost from './render_post.js';

const beforeGenerateIndex = (ctx: Hexo) => {
  const { filter } = ctx.extend;

  filter.register('before_generate', renderPost);
};

export default beforeGenerateIndex;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = beforeGenerateIndex;
  module.exports.default = beforeGenerateIndex;
}
