import type { HighlightOptions } from '../../extend/syntax_highlight';
import type Hexo from '../../hexo';

// Lazy require highlight.js
let highlight: typeof import('hexo-util').highlight;

module.exports = function highlightFilter(this: Hexo, code: string, options: HighlightOptions) {
  const hljsCfg = this.config.highlight || {} as any;
  const line_threshold = options.line_threshold || hljsCfg.line_threshold || 0;
  const shouldUseLineNumbers = typeof options.line_number === 'undefined' ? hljsCfg.line_number : options.line_number;
  const surpassesLineThreshold = options.lines_length > line_threshold;
  const gutter = shouldUseLineNumbers && surpassesLineThreshold;
  const languageAttr = typeof options.language_attr === 'undefined' ? hljsCfg.language_attr : options.language_attr;

  const hljsOptions = {
    autoDetect: hljsCfg.auto_detect,
    caption: options.caption,
    firstLine: options.firstLine as number,
    gutter,
    hljs: hljsCfg.hljs,
    lang: options.lang,
    languageAttr,
    mark: options.mark as number[],
    tab: hljsCfg.tab_replace,
    wrap: hljsCfg.wrap,
    stripIndent: hljsCfg.strip_indent
  };
  if (hljsCfg.first_line_number === 'inline') {
    if (typeof options.firstLineNumber !== 'undefined') {
      hljsOptions.firstLine = options.firstLineNumber as number;
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
