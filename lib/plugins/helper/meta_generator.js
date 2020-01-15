'use strict';

let metaGeneratorTag = '';

module.exports = ctx => {
  return () => {
    if (!ctx.extend.helper.getProp('meta_generator')) ctx.extend.helper.setProp('meta_generator', true);
    metaGeneratorTag = metaGeneratorTag || `<meta name="generator" content="Hexo ${ctx.version}">`;
    return metaGeneratorTag;
  };
};
