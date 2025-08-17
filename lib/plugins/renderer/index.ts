import type Hexo from '../../hexo/index.js';
import plain from './plain.js';
import json from './json.js';
import yaml from './yaml.js';
import nunjucks from './nunjucks.js';

const rendererIndex = (ctx: Hexo) => {
  const { renderer } = ctx.extend;

  renderer.register('htm', 'html', plain, true);
  renderer.register('html', 'html', plain, true);
  renderer.register('css', 'css', plain, true);
  renderer.register('js', 'js', plain, true);

  renderer.register('json', 'json', json, true);

  renderer.register('yml', 'json', yaml, true);
  renderer.register('yaml', 'json', yaml, true);

  renderer.register('njk', 'html', nunjucks, true);
  renderer.register('j2', 'html', nunjucks, true);
};

export default rendererIndex;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = rendererIndex;
  module.exports.default = rendererIndex;
}
