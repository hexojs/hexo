
import { full_url_for } from 'hexo-util';

export = function(path: string) {
  return full_url_for.call(this, path);
}
