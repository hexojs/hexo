'use strict';

// Lazy require prismjs
let prismHighlight;

function prismFilter(code, options) {
  const prismjsCfg = this.config.prismjs || {};
  const line_threshold = prismjsCfg.line_threshold
    ? prismjsCfg.line_threshold : 0;

  const prismjsOptions = {
    caption: options.caption,
    isPreprocess: prismjsCfg.preprocess,
    lang: options.lang,
    lineNumber: prismjsCfg.line_number && options.lines_length > line_threshold,
    tab: prismjsCfg.tab_replace
  };

  if (!prismHighlight) prismHighlight = require('hexo-util').prismHighlight;

  return prismHighlight(code, prismjsOptions);
}

module.exports = prismFilter;
