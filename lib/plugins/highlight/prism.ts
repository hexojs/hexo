import type { HighlightOptions } from '../../extend/syntax_highlight';
import type Hexo from '../../hexo';

// Lazy require prismjs
let prismHighlight: typeof import('hexo-util').prismHighlight;

module.exports = function(this: Hexo, code: string, options: HighlightOptions) {
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

  if (!prismHighlight) prismHighlight = require('hexo-util').prismHighlight;

  if (Array.isArray(prismjsCfg.exclude_languages) && prismjsCfg.exclude_languages.includes(prismjsOptions.lang)) {
    // Only wrap with <pre><code class="lang"></code></pre>
    return `<pre><code class="${prismjsOptions.lang}">${require('hexo-util').escapeHTML(code)}</code></pre>`;
  }
  return prismHighlight(code, prismjsOptions);
};
