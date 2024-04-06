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
