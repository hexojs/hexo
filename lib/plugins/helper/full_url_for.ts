
import { full_url_for } from 'hexo-util';

export = function(path) {
  return full_url_for.call(this, path);
}
