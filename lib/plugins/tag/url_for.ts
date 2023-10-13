import { url_for, htmlTag } from 'hexo-util';

/**
 * Url for tag
 *
 * Syntax:
 *   {% url_for text path [relative] %}
 */
export = ctx => {
  return function urlForTag([text, path, relative]) {
    const url = url_for.call(ctx, path, relative ? { relative: relative !== 'false' } : undefined);
    const attrs = {
      href: url
    };
    return htmlTag('a', attrs, text);
  };
};
