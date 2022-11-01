'use strict';
import {full_url_for} from 'hexo-util';

export default function(path) {
  return full_url_for.call(this, path);
};
