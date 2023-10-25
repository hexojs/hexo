'use strict';

// Lazy require highlight.js
let highlight;

module.exports = function highlightFilter(code, options) {
  const hljsCfg = this.config.highlight || {};
  const line_threshold = options.line_threshold || hljsCfg.line_threshold || 0;
  const shouldUseLineNumbers = typeof options.line_number === 'undefined' ? hljsCfg.line_number : options.line_number;
  const surpassesLineThreshold = options.lines_length > line_threshold;
  const gutter = shouldUseLineNumbers && surpassesLineThreshold;
  const languageAttr = typeof options.language_attr === 'undefined' ? hljsCfg.language_attr : options.language_attr;

  let _mark;
  if (options.mark) {
    _mark = [];

    for (const cur of options.mark.split(',')) {
      const hyphen = cur.indexOf('-');
      if (hyphen !== -1) {
        let a = +cur.slice(0, hyphen);
        let b = +cur.slice(hyphen + 1);
        if (Number.isNaN(a) || Number.isNaN(b)) continue;
        if (b < a) { // switch a & b
          const temp = a;
          a = b;
          b = temp;
        }

        for (; a <= b; a++) {
          _mark.push(a);
        }
      }
      if (!isNaN(cur)) _mark.push(+cur);
    }
  }

  const hljsOptions = {
    autoDetect: hljsCfg.auto_detect,
    caption: options.caption,
    firstLine: options.firstLine,
    gutter,
    hljs: hljsCfg.hljs,
    lang: options.lang,
    languageAttr,
    mark: _mark,
    tab: hljsCfg.tab_replace,
    wrap: hljsCfg.wrap
  };
  if (hljsCfg.first_line_number === 'inline') {
    if (typeof options.firstLineNumber !== 'undefined') {
      hljsOptions.firstLine = options.firstLineNumber;
    } else {
      hljsOptions.gutter = false;
    }
  }

  if (Array.isArray(hljsCfg.exclude_languages) && hljsCfg.exclude_languages.includes(hljsOptions.lang)) {
    // Only wrap with <pre><code class="lang"></code></pre>
    hljsOptions.wrap = false;
    hljsOptions.gutter = false;
    hljsOptions.autoDetect = false;
  }

  if (!highlight) highlight = require('hexo-util').highlight;

  return highlight(code, hljsOptions);
};
