'use strict';

const util = require('hexo-util');
const defaultConfig = require('../../../lib/hexo/default_config');

describe('Backtick code block', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo();
  const codeBlock = require('../../../lib/plugins/filter/before_post_render/backtick_code_block').bind(hexo);

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

  // Used for prismjs related test cases
  function enablePrismjs() {
    hexo.config.highlight.enable = false;
    hexo.config.prismjs.enable = true;
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

    hexo.config.highlight.enable = false;
    hexo.config.prismjs.enable = false;
    codeBlock(data);
    data.content.should.eql(content.replace(/{/g, '&#123;').replace(/}/g, '&#125;'));
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
    data.content.should.eql(content.replace(/{/g, '&#123;').replace(/}/g, '&#125;'));

    hexo.config.highlight = oldHljsCfg;
    hexo.config.prismjs = oldPrismCfg;
  });

  it('shorthand', () => {
    const data = {
      content: 'Hello, world!'
    };

    should.not.exist(codeBlock(data));
  });

  it('highlightjs - default', () => {
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

  it('highlightjs - without language name', () => {
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

  it('highlightjs - without language name - ignore tab character', () => {
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

  it('highlightjs - title', () => {
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

  it('highlightjs - url', () => {
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

  it('highlightjs - link text', () => {
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

  it('highlightjs - indent', () => {
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

  it('highlightjs - line number false', () => {
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

  it('highlightjs - line number false, don`t first_line_number always1', () => {
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

  it('highlightjs - line number false, don`t care first_line_number inilne', () => {
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

  it('highlightjs - line number true', () => {
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

  it('highlightjs - line number, first_line_number always1, js=', () => {
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

  it('highlightjs - line number, first_line_number inline, js', () => {
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

  it('highlightjs - line number, first_line_number inline, js=1', () => {
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

  it('highlightjs - line number, first_line_number inline, js=2', () => {
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

  it('highlightjs - tab replace', () => {
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

  it('highlightjs - wrap', () => {
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

  it('prismjs - default', () => {
    enablePrismjs();

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

  it('prismjs - without language name', () => {
    enablePrismjs();

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


  it('prismjs - without language name - ignore tab character', () => {
    enablePrismjs();

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

  it('prismjs - indent', () => {
    enablePrismjs();

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

  it('prismjs - line number false', () => {
    enablePrismjs();

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

  it('prismjs - tab replace', () => {
    enablePrismjs();

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

  it('prismjs - title', () => {
    enablePrismjs();

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
    data.content.should.eql('<!--hexoPostRenderEscape:' + expected + ':hexoPostRenderEscape-->');
  });
});
