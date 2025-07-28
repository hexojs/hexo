import { url_for, htmlTag } from 'hexo-util';
import type Hexo from '../../hexo';

/**
 * Url for tag
 *
 * Syntax:
 *   {% url_for text path [relative] %}
 */
const urlFor = (ctx: Hexo) => {
  return function urlForTag([text, path, relative]) {
    const url = url_for.call(ctx, path, relative ? { relative: relative !== 'false' } : undefined);
    const attrs = {
      href: url
    };
    return htmlTag('a', attrs, text);
  };
};

// For ESM compatibility
export default urlFor;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = urlFor;
  // For ESM compatibility
  module.exports.default = urlFor;
}
