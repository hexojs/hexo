import { url_for } from 'hexo-util';
import type { LocalsType } from '../../types';

interface Options {
  relative?: boolean
}

export = function(this: LocalsType, path: string, options: Options = {}) {
  return url_for.call(this, path, options);
}
