import { full_url_for } from 'hexo-util';
import moize from 'moize';
import type { LocalsType } from '../../types';

function fullUrlForHelper(this: LocalsType, path?: string) {
  return full_url_for.call(this, path);
}

export = moize(fullUrlForHelper, {
  maxSize: 100
});
