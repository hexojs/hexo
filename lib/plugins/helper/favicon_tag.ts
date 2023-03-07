import { url_for } from 'hexo-util';

function faviconTagHelper(path) {
  return `<link rel="shortcut icon" href="${url_for.call(this, path)}">`;
}

export = faviconTagHelper;
