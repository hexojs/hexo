import type Hexo from '../../hexo';

const injectorIndex = (ctx: Hexo) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { injector } = ctx.extend;
};

export default injectorIndex;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = injectorIndex;
  module.exports.default = injectorIndex;
}
