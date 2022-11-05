'use strict';

// Lazy require prismjs
let prismHighlight;

module.exports = ctx => {
  return function(code, options) {
    const prismjsCfg = ctx.config.prismjs || {};
    const line_threshold = prismjsCfg.line_threshold || 0;
    const { shouldUseLineNumbers = false, surpassesLineThreshold = false } = options;
    const lineNumber = (shouldUseLineNumbers || prismjsCfg.line_number) && (surpassesLineThreshold || options.lines_length > line_threshold);

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
};
