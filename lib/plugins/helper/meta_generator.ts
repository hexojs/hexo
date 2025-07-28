import type { LocalsType } from '../../types.js';

function metaGeneratorHelper(this: LocalsType) {
  return `<meta name="generator" content="Hexo ${this.env.version}">`;
}

export default metaGeneratorHelper;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = metaGeneratorHelper;
  module.exports.default = metaGeneratorHelper;
}
