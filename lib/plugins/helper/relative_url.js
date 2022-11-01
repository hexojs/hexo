'use strict';

import {relative_url} from 'hexo-util';

export default function(from, to) {
  return relative_url(from, to);
};
