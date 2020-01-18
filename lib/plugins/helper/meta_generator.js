'use strict';

let metaGeneratorTag = '';

module.exports = ctx => {
  return () => {
    if (!ctx.extend.helper.getProp('meta_generator_used')) ctx.extend.helper.setProp('meta_generator_used', true);
    metaGeneratorTag = metaGeneratorTag || `<meta name="generator" content="Hexo ${ctx.version}">`;
    return metaGeneratorTag;
  };
};
