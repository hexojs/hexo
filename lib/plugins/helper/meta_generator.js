'use strict';

module.exports = ctx => {
  return () => {
    if (!ctx.extend.helper.getProp('meta_generator')) ctx.extend.helper.setProp('meta_generator', true);
    return `<meta name="generator" content="Hexo ${ctx.version}">`;
  };
};
