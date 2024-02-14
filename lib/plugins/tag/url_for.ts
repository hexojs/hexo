import { url_for, htmlTag } from 'hexo-util';
import type Hexo from '../../hexo';

/**
 * Url for tag
 *
 * Syntax:
 *   {% url_for text path [relative] %}
 */
export = (ctx: Hexo) => {
  return function urlForTag([text, path, relative]) {
    const url = url_for.call(ctx, path, relative ? { relative: relative !== 'false' } : undefined);
    const attrs = {
      href: url
    };
    return htmlTag('a', attrs, text);
  };
};
