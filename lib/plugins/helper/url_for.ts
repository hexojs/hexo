import { url_for } from 'hexo-util';
import moize from 'moize';
import type { LocalsType } from '../../types';

interface Options {
  relative?: boolean
}

function urlForHelper(this: LocalsType, path: string, options: Options = {}) {
  return url_for.call(this, path, options);
}

export = moize(urlForHelper, {
  maxSize: 100
});
