import { full_url_for, htmlTag } from 'hexo-util';
import type Hexo from '../../hexo';

/**
 * Full url for tag
 *
 * Syntax:
 *   {% full_url_for text path %}
 */
const fullUrlFor = (ctx: Hexo) => {
  return function fullUrlForTag([text, path]) {
    const url = full_url_for.call(ctx, path);
    const attrs = {
      href: url
    };
    return htmlTag('a', attrs, text);
  };
};

// For ESM compatibility
export default fullUrlFor;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = fullUrlFor;
  // For ESM compatibility
  module.exports.default = fullUrlFor;
}
