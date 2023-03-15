import { htmlTag, url_for } from 'hexo-util';
import moize from 'moize';

function cssHelper(...args) {
  let result = '\n';

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
  isDeepEqual: true
});
