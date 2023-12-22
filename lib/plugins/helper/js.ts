import { htmlTag, url_for } from 'hexo-util';
import moize from 'moize';

let relative_link = true;
function jsHelper(...args: any[]) {
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
      // Custom attributes
      item.src = url_for.call(this, item.src);
      if (!item.src.endsWith('.js')) item.src += '.js';
      result += htmlTag('script', { ...item }, '') + '\n';
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
