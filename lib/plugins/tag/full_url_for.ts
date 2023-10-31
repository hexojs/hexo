import { full_url_for, htmlTag } from 'hexo-util';
import type Hexo from '../../hexo';

/**
 * Full url for tag
 *
 * Syntax:
 *   {% full_url_for text path %}
 */
export = (ctx: Hexo) => {
  return function fullUrlForTag([text, path]) {
    const url = full_url_for.call(ctx, path);
    const attrs = {
      href: url
    };
    return htmlTag('a', attrs, text);
  };
};
