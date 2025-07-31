import type Hexo from '../../hexo/index.js';
import asset from './asset.js';
import page from './page.js';
import post from './post.js';

const generatorIndex = (ctx: Hexo) => {
  const { generator } = ctx.extend;

  generator.register('asset', asset);
  generator.register('page', page);
  generator.register('post', post);
};

export default generatorIndex;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = generatorIndex;
  module.exports.default = generatorIndex;
}
