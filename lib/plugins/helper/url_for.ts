import { url_for } from 'hexo-util';

export = function(path, options) {
  return url_for.call(this, path, options);
}
