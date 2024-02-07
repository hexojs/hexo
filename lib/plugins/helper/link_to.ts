import { htmlTag, url_for } from 'hexo-util';
import type { LocalsType } from '../../types';

interface Options {
  id?: string;
  href?: string;
  title?: string;
  external?: boolean | null;
  class?: string | string[];
  target?: string;
  rel?: string;
}

interface Attrs {
  href: string;
  title: string;
  external?: boolean | null;
  class?: string;
  target?: string;
  rel?: string;
  [key: string]: string | boolean | null | undefined;
}

function linkToHelper(this: LocalsType, path: string, text?: string, options: Options | boolean = {}) {
  if (typeof options === 'boolean') options = {external: options};

  if (!text) text = path.replace(/^https?:\/\/|\/$/g, '');

  const attrs = Object.assign({
    href: url_for.call(this, path) as string,
    title: text
  }, options);

  if (attrs.external) {
    attrs.target = '_blank';
    attrs.rel = 'noopener';
    attrs.external = null;
  }

  if (attrs.class && Array.isArray(attrs.class)) {
    attrs.class = attrs.class.join(' ');
  }

  return htmlTag('a', attrs as Attrs, text);
}

export = linkToHelper;
