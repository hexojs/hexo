import { relative_url } from 'hexo-util';

export = function(from, to) {
  return relative_url(from, to);
}
