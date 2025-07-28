import { full_url_for } from 'hexo-util';
import type { LocalsType } from '../../types.js';

const fullUrlForHelper = function(this: LocalsType, path?: string) {
  return full_url_for.call(this, path);
};

export default fullUrlForHelper;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = fullUrlForHelper;
  module.exports.default = fullUrlForHelper;
}
