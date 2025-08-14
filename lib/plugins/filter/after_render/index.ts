import type Hexo from '../../../hexo/index.js';
import externalLink from './external_link.js';
import metaGenerator from './meta_generator.js';

const afterRenderIndex = (ctx: Hexo) => {
  const { filter } = ctx.extend;

  filter.register('after_render:html', externalLink);
  filter.register('after_render:html', metaGenerator);
};

export default afterRenderIndex;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = afterRenderIndex;
  module.exports.default = afterRenderIndex;
}
