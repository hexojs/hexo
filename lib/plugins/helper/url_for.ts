import { url_for } from 'hexo-util';
import type { LocalsType } from '../../types.js';

interface Options {
  relative?: boolean
}

const urlForHelper = function(this: LocalsType, path: string, options: Options = {}) {
  return url_for.call(this, path, options);
};

export default urlForHelper;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = urlForHelper;
  module.exports.default = urlForHelper;
}
