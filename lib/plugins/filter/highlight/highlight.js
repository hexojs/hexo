'use strict';

// Lazy require highlight.js
let highlight;

function highlightFilter(code, options) {
  const hljsCfg = this.config.highlight || {};
  const line_threshold = hljsCfg.line_threshold
    ? hljsCfg.line_threshold : 0;

  const hljsOptions = {
    caption: options.caption,
    gutter: hljsCfg.line_number && options.lines_length > line_threshold,
    hljs: hljsCfg.hljs,
    lang: options.lang,
    languageAttr: hljsCfg.language_attr,
    tab: hljsCfg.tab_replace
  };

  if (Array.isArray(hljsCfg.exclude_languages) && hljsCfg.exclude_languages.includes(hljsOptions.lang)) {
    // Only wrap with <pre><code class="lang"></code></pre>
    hljsOptions.wrap = false;
    hljsOptions.gutter = false;
    hljsOptions.autoDetect = false;
  }

  if (!highlight) highlight = require('hexo-util').highlight;

  return highlight(code, hljsOptions);
}

module.exports = highlightFilter;
