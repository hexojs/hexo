import { htmlTag } from 'hexo-util';
import * as moizeModule from 'moize';

// ESM compatibility
const moize = (moizeModule.default || moizeModule) as unknown as moizeModule.Moize;

interface Options {
  href?: string;
  title?: string;
  class?: string | string[];
  subject?: string;
  cc?: string | string[];
  bcc?: string | string[];
  id?: string;
  body?: string;
}

interface Attrs {
  href: string;
  title: string;
  class?: string;
  subject?: string;
  cc?: string;
  bcc?: string;
  id?: string;
  body?: string;
  [key: string]: any;
}

function mailToHelperImpl(path: string | string[], text?: string, options: Options = {}) {
  if (Array.isArray(path)) path = path.join(',');
  if (!text) text = path;

  const attrs = Object.assign({
    href: `mailto:${path}`,
    title: text
  }, options);

  if (attrs.class && Array.isArray(attrs.class)) {
    attrs.class = attrs.class.join(' ');
  }

  const data = {};

  ['subject', 'cc', 'bcc', 'body'].forEach(i => {
    const item = attrs[i];

    if (item) {
      data[i] = Array.isArray(item) ? item.join(',') : item;
      attrs[i] = null;
    }
  });

  const querystring = new URLSearchParams(data).toString();
  if (querystring) attrs.href += `?${querystring}`;

  return htmlTag('a', attrs as Attrs, text);
}

const mailToHelper = moize(mailToHelperImpl, {
  maxSize: 10,
  isDeepEqual: true
});

export default mailToHelper;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = mailToHelper;
  module.exports.default = mailToHelper;
}
