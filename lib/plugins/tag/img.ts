import { htmlTag, url_for } from 'hexo-util';
import type Hexo from '../../hexo/index.js';

const rUrl = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\w]*))?)/;
const rMetaDoubleQuote = /"?([^"]+)?"?/;
const rMetaSingleQuote = /'?([^']+)?'?/;

/**
* Image tag
*
* Syntax:
*   {% img [class names] /path/to/image [width] [height] [title text [alt text]] %}
*/
const img = (ctx: Hexo) => {

  return function imgTag(args: string[]) {
    const classes = [];
    let src, width, height, title, alt;

    // Find image URL and class name
    while (args.length > 0) {
      const item = args.shift();
      if (rUrl.test(item) || item.startsWith('/')) {
        src = url_for.call(ctx, item);
        break;
      } else {
        classes.push(item);
      }
    }

    // Find image width and height
    if (args && args.length) {
      if (!/\D+/.test(args[0])) {
        width = args.shift();

        if (args.length && !/\D+/.test(args[0])) {
          height = args.shift();
        }
      }

      const meta = args.join(' ');
      const rMetaTitle = meta.startsWith('"') ? rMetaDoubleQuote : rMetaSingleQuote;
      const rMetaAlt = meta.endsWith('"') ? rMetaDoubleQuote : rMetaSingleQuote;
      const match = new RegExp(`${rMetaTitle.source}\\s*${rMetaAlt.source}`).exec(meta);

      // Find image title and alt
      if (match != null) {
        title = match[1];
        alt = match[2];
      }
    }

    const attrs = {
      src,
      class: classes.join(' '),
      width,
      height,
      title,
      alt
    };

    return htmlTag('img', attrs);
  };
};

// For ESM compatibility
export default img;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = img;
  // For ESM compatibility
  module.exports.default = img;
}
