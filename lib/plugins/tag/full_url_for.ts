import { full_url_for, htmlTag } from 'hexo-util';

/**
 * Full url for tag
 *
 * Syntax:
 *   {% full_url_for text path %}
 */
export = ctx => {
  return function fullUrlForTag([text, path]) {
    const url = full_url_for.call(ctx, path);
    const attrs = {
      href: url
    };
    return htmlTag('a', attrs, text);
  };
};
