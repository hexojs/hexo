import { htmlTag, url_for } from 'hexo-util';
import moize from 'moize';

let relative_link = true;
function cssHelper(...args: any[]) {
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

export = moize(cssHelper, {
  maxSize: 10,
  isDeepEqual: true,
  updateCacheForKey() {
    return relative_link;
  }
});
