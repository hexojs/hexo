import type Hexo from '../../hexo/index.js';

const renderHelper = (ctx: Hexo) => function render(text: string, engine: string, options:object = {}) {
  return ctx.render.renderSync({
    text,
    engine
  }, options);
};

export default renderHelper;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = renderHelper;
  module.exports.default = renderHelper;
}
