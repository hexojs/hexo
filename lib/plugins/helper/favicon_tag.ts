import { url_for } from 'hexo-util';
import type { LocalsType } from '../../types';

function faviconTagHelper(this: LocalsType, path: string) {
  return `<link rel="shortcut icon" href="${url_for.call(this, path)}">`;
}

export = faviconTagHelper;
