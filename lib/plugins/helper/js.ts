import { htmlTag, url_for } from 'hexo-util';
import moize from 'moize';
import type { LocalsType } from '../../types';

let relative_link = true;
function jsHelper(this: LocalsType, ...args: any[]) {
  let result = '\n';

  relative_link = this.config.relative_link;

  args.flat(Infinity).forEach(item => {
    if (typeof item === 'string' || item instanceof String) {
      let path = item;
      if (!path.endsWith('.js')) {
        path += '.js';
      }
      result += `<script src="${url_for.call(this, path)}"></script>\n`;
    } else {
      const newItem = { ...item };
      // Custom attributes
      newItem.src = url_for.call(this, newItem.src);
      if (!newItem.src.endsWith('.js')) newItem.src += '.js';
      result += htmlTag('script', newItem, '') + '\n';
    }
  });
  return result;
}

export = moize(jsHelper, {
  maxSize: 10,
  isDeepEqual: true,
  updateCacheForKey() {
    return relative_link;
  }
});
