import { url_for } from 'hexo-util';
import type { LocalsType } from '../../types';

function faviconTagHelper(this: LocalsType, path: string) {
  return `<link rel="shortcut icon" href="${url_for.call(this, path)}">`;
}

export default faviconTagHelper;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = faviconTagHelper;
  module.exports.default = faviconTagHelper;
}
