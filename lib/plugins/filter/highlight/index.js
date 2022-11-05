'use strict';

module.exports = ctx => {
  const { filter } = ctx.extend;
  const hljsCfg = ctx.config.highlight || {};
  const prismCfg = ctx.config.prismjs || {};

  // Since prismjs have better performance, so prismjs should have higher priority.
  if (prismCfg.enable) {
    filter.register('highlight', require('./prism')(ctx));
  } else if (hljsCfg.enable) {
    filter.register('highlight', require('./highlight')(ctx));
  }
};
