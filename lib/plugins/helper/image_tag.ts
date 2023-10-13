import { htmlTag, url_for } from 'hexo-util';

interface Options {
  src?: string;
  class?: string | string[];
}

interface Attrs {
  src?: string;
  class?: string;
  [key: string]: string | undefined;
}

function imageTagHelper(path: string, options: Options = {}) {
  const attrs = Object.assign({
    src: url_for.call(this, path) as string
  }, options);

  if (attrs.class && Array.isArray(attrs.class)) {
    attrs.class = attrs.class.join(' ');
  }

  return htmlTag('img', attrs as Attrs);
}

export = imageTagHelper;
