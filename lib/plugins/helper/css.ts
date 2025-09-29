import { htmlTag, url_for } from 'hexo-util';
import moize from 'moize';
import type { LocalsType } from '../../types';

let relative_link = true;
function cssHelper(this: LocalsType, ...args: any[]) {
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
      const newItem = {
        rel: 'stylesheet',
        ...item
      };
      // Custom attributes
      newItem.href = url_for.call(this, newItem.href);
      if (!newItem.href.endsWith('.css')) newItem.href += '.css';
      result += htmlTag('link', newItem) + '\n';
    }
  });
  return result;
}

export = moize(cssHelper, {
  maxSize: 10,
  isDeepEqual: true,
  updateCacheForKey() {
    return relative_link;
  }
});
