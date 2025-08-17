import type { LocalsType } from '../../types.js';

function markdownHelper(this: LocalsType, text: string, options?: any) {
  return this.render(text, 'markdown', options);
}

export default markdownHelper;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = markdownHelper;
  module.exports.default = markdownHelper;
}
