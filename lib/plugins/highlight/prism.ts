import type { HighlightOptions } from '../../extend/syntax_highlight.js';
import type Hexo from '../../hexo/index.js';
import * as hexoUtil from 'hexo-util';

// Lazy require prismjs
let prismHighlight: typeof hexoUtil.prismHighlight;

const prismFilter = function(this: Hexo, code: string, options: HighlightOptions) {
  const prismjsCfg = this.config.prismjs || {} as any;
  const line_threshold = options.line_threshold || prismjsCfg.line_threshold || 0;
  const shouldUseLineNumbers = typeof options.line_number === 'undefined' ? prismjsCfg.line_number : options.line_number;
  const surpassesLineThreshold = options.lines_length > line_threshold;
  const lineNumber = shouldUseLineNumbers && surpassesLineThreshold;

  const prismjsOptions = {
    caption: options.caption,
    firstLine: options.firstLine as number,
    isPreprocess: prismjsCfg.preprocess,
    lang: options.lang,
    lineNumber,
    mark: Array.isArray(options.mark) ? String(options.mark) : options.mark,
    tab: prismjsCfg.tab_replace,
    stripIndent: prismjsCfg.strip_indent
  };

  if (!prismHighlight) prismHighlight = hexoUtil.prismHighlight;

  if (Array.isArray(prismjsCfg.exclude_languages) && prismjsCfg.exclude_languages.includes(prismjsOptions.lang)) {
    // Only wrap with <pre><code class="lang"></code></pre>
    return `<pre><code class="${prismjsOptions.lang}">${hexoUtil.escapeHTML(code)}</code></pre>`;
  }
  return prismHighlight(code, prismjsOptions);
};

// Support both ESM and CommonJS
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = prismFilter;
  module.exports.default = prismFilter;
}

export default prismFilter;
