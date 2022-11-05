'use strict';

module.exports = ctx => {
  const { filter } = ctx.extend;
  const hljsCfg = this.config.highlight || {};
  const prismCfg = this.config.prismjs || {};

  // Since prismjs have better performance, so prismjs should have higher priority.
  if (prismCfg.enable) {
    filter.register('highlight', require('./prism'));
  } else if (hljsCfg.enable) {
    filter.register('highlight', require('./highlight'));
  }
};
