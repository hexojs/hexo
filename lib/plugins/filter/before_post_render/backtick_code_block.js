'use strict';

const rBacktick = /^((?:[^\S\r\n]*>){0,3}[^\S\r\n]*)(`{3,}|~{3,})[^\S\r\n]*((?:.*?[^`\s])?)[^\S\r\n]*\n((?:[\s\S]*?\n)?)(?:(?:[^\S\r\n]*>){0,3}[^\S\r\n]*)\2[^\S\r\n]?(\n+|$)/gm;
const rCaptionUrlTitle = /(\S[\S\s]*)\s+(https?:\/\/\S+)\s+(.+)/i;
const rCaptionUrl = /(\S[\S\s]*)\s+(https?:\/\/\S+)/i;
const rCaption = /\S[\S\s]*/;

const escapeSwigTag = str => str.replace(/{/g, '&#123;').replace(/}/g, '&#125;');

module.exports = ctx => {
  return function backtickCodeBlock(data) {
    const dataContent = data.content;

    if ((!dataContent.includes('```') && !dataContent.includes('~~~')) || !ctx.extend.highlight.query(ctx.config.syntax_highlighter)) return;

    data.content = dataContent.replace(rBacktick, ($0, start, $2, _args, _content, end) => {
      let content = _content.replace(/\n$/, '');

      // neither highlight or prismjs is enabled, return escaped content directly.
      if (!ctx.extend.highlight.query(ctx.config.syntax_highlighter)) return escapeSwigTag($0);

      // Extract language and caption of code blocks
      const shiftedArgs = _args.split('=').shift();
      const args = shiftedArgs.split(/\s+/);
      const len = args.length;

      const _else = [];

      let language_attr, line_number, line_threshold, mark, wrap,
        match, caption;
      let firstLine = 1;

      for (let i = 0; i < len; i++) {
        const colon = args[i].indexOf(':');

        if (colon === -1) {
          _else.push(args[i]);
          continue;
        }

        const key = args[i].slice(0, colon);
        const value = args[i].slice(colon + 1);

        switch (key) {
          case 'line_number':
            line_number = value === 'true';
            break;
          case 'line_threshold':
            if (!isNaN(value)) line_threshold = +value;
            break;
          case 'language_attr':
            language_attr = value === 'true';
            break;
          case 'first_line':
            if (!isNaN(value)) firstLine = +value;
            break;
          case 'mark':
            mark = value;
            break;
          case 'wrap':
            wrap = value === 'true';
            break;
          default: {
            _else.push(args[i]);
          }
        }
      }

      // probably '' but hexo-util.PrismUtil need undefined in order to be assigned to 'none'
      const lang = _else[0] || undefined;
      _else.shift(0);
      const arg = _else.join(' ');

      if ((match = arg.match(rCaptionUrlTitle)) != null) {
        caption = `<span>${match[1]}</span><a href="${match[2]}">${match[3]}</a>`;
      } else if ((match = arg.match(rCaptionUrl)) != null) {
        caption = `<span>${match[1]}</span><a href="${match[2]}">link</a>`;
      } else if ((match = arg.match(rCaption)) != null) {
        caption = `<span>${match[0]}</span>`;
      }

      // PR #3765
      if (start.includes('>')) {
        // heading of last line is already removed by the top RegExp "rBacktick"
        const depth = start.split('>').length - 1;
        const regexp = new RegExp(`^([^\\S\\r\\n]*>){0,${depth}}([^\\S\\r\\n]|$)`, 'mg');
        content = content.replace(regexp, '');
      }

      const options = {
        lang,
        caption,
        lines_length: content.split('\n').length,
        line_number,
        line_threshold,
        language_attr,
        firstLine,
        mark,
        wrap
      };
      // setup line number by inline
      _args = _args.replace('=+', '=');

      // setup firstLineNumber;
      if (_args.includes('=')) {
        options.firstLineNumber = _args.split('=')[1] || 1;
      }
      content = ctx.extend.highlight.exec(ctx.config.syntax_highlighter, {
        context: ctx,
        args: [content, options]
      });

      return start
        + '<hexoPostRenderCodeBlock>'
        + escapeSwigTag(content)
        + '</hexoPostRenderCodeBlock>'
        + end;
    });
  };
};
