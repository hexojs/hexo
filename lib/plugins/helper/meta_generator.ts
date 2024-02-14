import type { LocalsType } from '../../types';

function metaGeneratorHelper(this: LocalsType) {
  return `<meta name="generator" content="Hexo ${this.env.version}">`;
}

export = metaGeneratorHelper;
