'use strict';

// Lazy require prismjs
let prismHighlight;

module.exports = function(code, options) {
  const prismjsCfg = this.config.prismjs || {};
  const line_threshold = options.line_threshold || prismjsCfg.line_threshold || 0;
  const shouldUseLineNumbers = typeof options.line_number === 'undefined' ? prismjsCfg.line_number : options.line_number;
  const surpassesLineThreshold = options.lines_length > line_threshold;
  const lineNumber = shouldUseLineNumbers && surpassesLineThreshold;

  const prismjsOptions = {
    caption: options.caption,
    firstLine: options.firstLine,
    isPreprocess: prismjsCfg.preprocess,
    lang: options.lang,
    lineNumber,
    mark: options.mark,
    tab: prismjsCfg.tab_replace
  };

  if (!prismHighlight) prismHighlight = require('hexo-util').prismHighlight;

  return prismHighlight(code, prismjsOptions);
};
