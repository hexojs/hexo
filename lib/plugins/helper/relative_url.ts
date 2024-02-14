import { relative_url } from 'hexo-util';

export = function(from: string, to: string) {
  return relative_url(from, to);
}
