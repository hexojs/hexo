import { url_for } from 'hexo-util';

interface Options {
  relative?: boolean
}

export = function(path: string, options: Options = {}) {
  return url_for.call(this, path, options);
}
