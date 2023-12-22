'use strict';

const util = require('hexo-util');
const defaultConfig = require('../../../dist/hexo/default_config');

describe('Backtick code block', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo();
  require('../../../dist/plugins/highlight/')(hexo);
  const codeBlock = require('../../../dist/plugins/filter/before_post_render/backtick_code_block')(hexo);

  const code = [
    'if (tired && night) {',
    '  sleep();',
    '}'
  ].join('\n');

  function highlight(code, options) {
    return util.highlight(code, options || {})
      .replace(/{/g, '&#123;')
      .replace(/}/g, '&#125;');
  }

  function prism(code, options) {
    return util.prismHighlight(code, options || {})
      .replace(/{/g, '&#123;')
      .replace(/}/g, '&#125;');
  }

  beforeEach(() => {
    // Reset config
    hexo.config.highlight = Object.assign({}, defaultConfig.highlight);
    hexo.config.prismjs = Object.assign({}, defaultConfig.prismjs);
  });

  after(() => {
    // Reset config for further test
    hexo.config.highlight = defaultConfig.highlight;
    hexo.config.prismjs = defaultConfig.prismjs;
  });

  it('disabled', () => {
    const content = [
      '``` js',
      code,
      '```'
    ].join('\n');

    const data = {content};

    hexo.config.syntax_highlighter = '';
    codeBlock(data);
    data.content.should.eql(content);
  });

  it('with no config (disabled)', () => {
    const content = [
      '``` js',
      code,
      '```'
    ].join('\n');

    const data = {content};

    const oldHljsCfg = hexo.config.highlight;
    const oldPrismCfg = hexo.config.prismjs;
    delete hexo.config.highlight;
    delete hexo.config.prismjs;

    codeBlock(data);
    data.content.should.eql(content);

    hexo.config.highlight = oldHljsCfg;
    hexo.config.prismjs = oldPrismCfg;
  });

  describe('highlightjs', () => {
    beforeEach(() => {
      hexo.config.syntax_highlighter = 'highlight.js';
    });

    it('shorthand', () => {
      const data = {
        content: 'Hello, world!'
      };

      should.not.exist(codeBlock(data));
    });

    it('default', () => {
      const data = {
        content: [
          '``` js',
          code,
          '```'
        ].join('\n')
      };

      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + highlight(code, {lang: 'js'}) + '</hexoPostRenderCodeBlock>');
    });

    it('without language name', () => {
      const data = {
        content: [
          '```',
          code,
          '```'
        ].join('\n')
      };

      const expected = highlight(code);

      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('without language name - ignore tab character', () => {
      const data = {
        content: [
          '``` \t',
          code,
          '```'
        ].join('\n')
      };

      const expected = highlight(code);

      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('title', () => {
      const data = {
        content: [
          '``` js Hello world',
          code,
          '```'
        ].join('\n')
      };

      const expected = highlight(code, {
        lang: 'js',
        caption: '<span>Hello world</span>'
      });

      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('url', () => {
      const data = {
        content: [
          '``` js Hello world https://hexo.io/',
          code,
          '```'
        ].join('\n')
      };

      const expected = highlight(code, {
        lang: 'js',
        caption: '<span>Hello world</span><a href="https://hexo.io/">link</a>'
      });

      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('link text', () => {
      const data = {
        content: [
          '``` js Hello world https://hexo.io/ Hexo',
          code,
          '```'
        ].join('\n')
      };

      const expected = highlight(code, {
        lang: 'js',
        caption: '<span>Hello world</span><a href="https://hexo.io/">Hexo</a>'
      });

      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('indent', () => {
      const indentCode = code.split('\n').map(line => '  ' + line).join('\n');

      const data = {
        content: [
          '``` js Hello world https://hexo.io/',
          indentCode,
          '```'
        ].join('\n')
      };

      const expected = highlight(code, {
        lang: 'js',
        caption: '<span>Hello world</span><a href="https://hexo.io/">link</a>'
      });

      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('line number false', () => {
      hexo.config.highlight.line_number = false;

      const data = {
        content: [
          '``` js',
          code,
          '```'
        ].join('\n')
      };

      const expected = highlight(code, {
        lang: 'js',
        gutter: false
      });

      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('line number false, don`t first_line_number always1', () => {
      hexo.config.highlight.line_number = false;
      hexo.config.highlight.first_line_number = 'always1';

      const data = {
        content: [
          '``` js',
          code,
          '```'
        ].join('\n')
      };

      const expected = highlight(code, {
        lang: 'js',
        gutter: false
      });

      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('only wrap with pre and code', () => {
      hexo.config.highlight.exclude_languages = ['js'];
      hexo.config.highlight.hljs = true;
      const data = {
        content: [
          '``` js',
          code,
          '```'
        ].join('\n')
      };
      const expected = highlight(code, {
        lang: 'js',
        gutter: false,
        hljs: true,
        wrap: false
      });
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('line number false, don`t care first_line_number inilne', () => {
      hexo.config.highlight.line_number = false;
      hexo.config.highlight.first_line_number = 'inilne';

      const data = {
        content: [
          '``` js',
          code,
          '```'
        ].join('\n')
      };

      const expected = highlight(code, {
        lang: 'js',
        gutter: false
      });

      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('line number true', () => {
      hexo.config.highlight.line_number = true;

      const data = {
        content: [
          '``` js',
          code,
          '```'
        ].join('\n')
      };

      const expected = highlight(code, {
        lang: 'js',
        gutter: true
      });

      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('line number, first_line_number always1, js=', () => {
      hexo.config.highlight.line_number = true;
      hexo.config.highlight.first_line_number = 'always1';

      const data = {
        content: [
          '``` js=',
          code,
          '```'
        ].join('\n')
      };

      const expected = highlight(code, {
        lang: 'js',
        gutter: true,
        firstLine: 1
      });

      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('line number, first_line_number inline, js', () => {
      hexo.config.highlight.line_number = true;
      hexo.config.highlight.first_line_number = 'inline';

      const data = {
        content: [
          '``` js',
          code,
          '```'
        ].join('\n')
      };

      const expected = highlight(code, {
        lang: 'js',
        gutter: false,
        firstLine: 0
      });

      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('line number, first_line_number inline, js=1', () => {
      hexo.config.highlight.line_number = true;
      hexo.config.highlight.first_line_number = 'inline';

      const data = {
        content: [
          '``` js=1',
          code,
          '```'
        ].join('\n')
      };

      const expected = highlight(code, {
        lang: 'js',
        gutter: true,
        firstLine: 1
      });

      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('line number, first_line_number inline, js=2', () => {
      hexo.config.highlight.line_number = true;
      hexo.config.highlight.first_line_number = 'inline';

      const data = {
        content: [
          '``` js=2',
          code,
          '```'
        ].join('\n')
      };

      const expected = highlight(code, {
        lang: 'js',
        gutter: true,
        firstLine: 2
      });

      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('tab replace', () => {
      hexo.config.highlight.tab_replace = '  ';

      const code = [
        'if (tired && night){',
        '\tsleep();',
        '}'
      ].join('\n');

      const data = {
        content: [
          '``` js',
          code,
          '```'
        ].join('\n')
      };

      const expected = highlight(code, {
        lang: 'js',
        tab: '  '
      });

      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('wrap', () => {
      hexo.config.highlight.wrap = false;

      const data = {
        content: [
          '``` js',
          code,
          '```'
        ].join('\n')
      };

      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + highlight(code, { lang: 'js', wrap: false }) + '</hexoPostRenderCodeBlock>');

      hexo.config.highlight.wrap = true;
    });

    // test for Issue #4220
    it('skip a Swig template', () => {
      const data = {
        content: [
          '```foo```',
          '',
          '```',
          code,
          '```'
        ].join('\n')
      };
      codeBlock(data);

      data.content.should.eql('```foo```\n\n<hexoPostRenderCodeBlock>' + highlight(code, {}) + '</hexoPostRenderCodeBlock>');
    });

    // test for Issue #4190
    it('ignore triple backticks at the line which is started by extra characters', () => {
      const data = {
        content: [
          '```',
          code,
          'foo```',
          '',
          'bar```',
          'baz',
          '```'
        ].join('\n')
      };

      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + highlight(code + '\nfoo```\n\nbar```\nbaz', {}) + '</hexoPostRenderCodeBlock>');
    });

    // test for Issue #4573
    it('ignore trailing spaces', () => {
      const data = {
        content: [
          '``` js',
          code,
          '``` ',
          '``` js',
          code,
          '```'
        ].join('\n')
      };

      codeBlock(data);
      data.content.should.not.contain('`');
    });

    // test for Issue #4573
    it('ignore trailing spaces but not newlines', () => {
      const data = {
        content: [
          '``` js',
          code,
          '```',
          '',
          '# New line'
        ].join('\n')
      };

      codeBlock(data);
      data.content.should.contain('\n\n# New line');
    });
  });

  describe('prismjs', () => {
    beforeEach(() => {
      hexo.config.syntax_highlighter = 'prismjs';
    });

    it('default', () => {
      const data = {
        content: [
          '``` js',
          code,
          '```'
        ].join('\n')
      };

      codeBlock(data);

      data.content.should.eql('<hexoPostRenderCodeBlock>' + prism(code, {lang: 'js'}) + '</hexoPostRenderCodeBlock>');
    });

    it('without language name', () => {
      const data = {
        content: [
          '```',
          code,
          '```'
        ].join('\n')
      };

      const expected = prism(code);

      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });


    it('without language name - ignore tab character', () => {
      const data = {
        content: [
          '``` \t',
          code,
          '```'
        ].join('\n')
      };

      const expected = prism(code);

      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('indent', () => {
      const indentCode = code.split('\n').map(line => '  ' + line).join('\n');

      const data = {
        content: [
          '``` js',
          indentCode,
          '```'
        ].join('\n')
      };

      const expected = prism(code, { lang: 'js' });

      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('line number false', () => {
      hexo.config.prismjs.line_number = false;

      const data = {
        content: [
          '``` js',
          code,
          '```'
        ].join('\n')
      };

      const expected = prism(code, {
        lang: 'js',
        lineNumber: false
      });

      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('tab replace', () => {
      hexo.config.prismjs.tab_replace = '  ';

      const code = [
        'if (tired && night){',
        '\tsleep();',
        '}'
      ].join('\n');

      const data = {
        content: [
          '``` js',
          code,
          '```'
        ].join('\n')
      };

      const expected = prism(code, {
        lang: 'js',
        tab: '  '
      });

      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('title', () => {
      const data = {
        content: [
          '``` js Hello world',
          code,
          '```'
        ].join('\n')
      };

      const expected = prism(code, {
        lang: 'js',
        caption: '<span>Hello world</span>'
      });

      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('prism only wrap with pre and code', () => {
      hexo.config.prismjs.exclude_languages = ['js'];
      const data = {
        content: [
          '``` js',
          code,
          '```'
        ].join('\n')
      };
      const escapeSwigTag = str => str.replace(/{/g, '&#123;').replace(/}/g, '&#125;');
      const expected = `<pre><code class="js">${escapeSwigTag(util.escapeHTML(code))}</code></pre>`;
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });
  });
});
