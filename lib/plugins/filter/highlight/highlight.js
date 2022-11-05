'use strict';

// Lazy require highlight.js
let highlight;

module.exports = ctx => {
  return function highlightFilter(code, options) {
    const hljsCfg = ctx.config.highlight || {};
    const line_threshold = hljsCfg.line_threshold || 0;
    const { shouldUseLineNumbers, surpassesLineThreshold } = options;
    const gutter = (shouldUseLineNumbers || hljsCfg.line_number) && (surpassesLineThreshold || options.lines_length > line_threshold);

    const hljsOptions = {
      autoDetect: hljsCfg.auto_detect,
      caption: options.caption,
      firstLine: options.firstLine,
      gutter,
      hljs: hljsCfg.hljs,
      lang: options.lang,
      languageAttr: hljsCfg.language_attr,
      mark: options.mark,
      tab: hljsCfg.tab_replace,
      wrap: hljsCfg.wrap
    };

    if (Array.isArray(hljsCfg.exclude_languages) && hljsCfg.exclude_languages.includes(hljsOptions.lang)) {
      // Only wrap with <pre><code class="lang"></code></pre>
      hljsOptions.wrap = false;
      hljsOptions.gutter = false;
      hljsOptions.autoDetect = false;
    }

    if (!highlight) highlight = require('hexo-util').highlight;

    return highlight(code, hljsOptions);
  };
};
