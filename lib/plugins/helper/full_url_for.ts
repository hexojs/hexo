
import { full_url_for } from 'hexo-util';
import type { LocalsType } from '../../types';

export = function(this: LocalsType, path?: string) {
  return full_url_for.call(this, path);
}
