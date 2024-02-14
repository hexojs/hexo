import type Hexo from '../../../hexo';

let NEED_INJECT = true;
let META_GENERATOR_TAG;

function hexoMetaGeneratorInject(this: Hexo, data: string): string {
  if (!NEED_INJECT) return;

  if (!this.config.meta_generator
    || data.match(/<meta\s+(?:[^<>/]+\s)?name=['"]generator['"]/i)) {
    NEED_INJECT = false;
    return;
  }

  META_GENERATOR_TAG = META_GENERATOR_TAG || `<meta name="generator" content="Hexo ${this.version}">`;

  return data.replace('</head>', `${META_GENERATOR_TAG}</head>`);
}

export = hexoMetaGeneratorInject;
