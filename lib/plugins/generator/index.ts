import type Hexo from '../../hexo';

const generatorIndex = (ctx: Hexo) => {
  const { generator } = ctx.extend;

  generator.register('asset', require('./asset'));
  generator.register('page', require('./page'));
  generator.register('post', require('./post'));
};

export default generatorIndex;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = generatorIndex;
  module.exports.default = generatorIndex;
}
