import { htmlTag, url_for } from 'hexo-util';
import * as moizeModule from 'moize';
import type { LocalsType } from '../../types.js';

// ESM compatibility
const moize = (moizeModule.default || moizeModule) as unknown as moizeModule.Moize;
let relative_link = true;

function cssHelperImpl(this: LocalsType, ...args: any[]) {
  let result = '\n';

  relative_link = this.config.relative_link;

  args.flat(Infinity).forEach(item => {
    if (typeof item === 'string' || item instanceof String) {
      let path = item;
      if (!path.endsWith('.css')) {
        path += '.css';
      }
      result += `<link rel="stylesheet" href="${url_for.call(this, path)}">\n`;
    } else {
      // Custom attributes
      item.href = url_for.call(this, item.href);
      if (!item.href.endsWith('.css')) item.href += '.css';
      result += htmlTag('link', { rel: 'stylesheet', ...item }) + '\n';
    }
  });
  return result;
}

const cssHelper = moize(cssHelperImpl, {
  maxSize: 10,
  isDeepEqual: true,
  updateCacheForKey() {
    return relative_link;
  }
});

export default cssHelper;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = cssHelper;
  module.exports.default = cssHelper;
}
