'use strict';

const util = require('hexo-util');
const defaultConfig = require('../../../lib/hexo/default_config');

describe('Backtick code block', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo();
  const codeBlock = require('../../../lib/plugins/filter/before_post_render/backtick_code_block').bind(hexo);

  const code = [
    'if (tired && night){',
    '  sleep();',
    '}'
  ].join('\n');

  function highlight(code, options) {
    return util.highlight(code, options || {})
      .replace(/{/g, '&#123;')
      .replace(/}/g, '&#125;');
  }

  beforeEach(() => {
    // Reset config
    hexo.config.highlight = Object.assign({}, defaultConfig.highlight);
  });

  it('disabled', () => {
    const content = [
      '``` js',
      code,
      '```'
    ].join('\n');

    const data = {content};

    hexo.config.highlight.enable = false;
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

    const oldConfig = hexo.config.highlight;
    delete hexo.config.highlight;

    codeBlock(data);
    data.content.should.eql(content);

    hexo.config.highlight = oldConfig;
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
    data.content.should.eql('<!--hexoPostRenderEscape:' + highlight(code, {lang: 'js'}) + ':hexoPostRenderEscape-->');
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
    data.content.should.eql('<!--hexoPostRenderEscape:' + expected + ':hexoPostRenderEscape-->');
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
    data.content.should.eql('<!--hexoPostRenderEscape:' + expected + ':hexoPostRenderEscape-->');
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
    data.content.should.eql('<!--hexoPostRenderEscape:' + expected + ':hexoPostRenderEscape-->');
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
    data.content.should.eql('<!--hexoPostRenderEscape:' + expected + ':hexoPostRenderEscape-->');
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
    data.content.should.eql('<!--hexoPostRenderEscape:' + expected + ':hexoPostRenderEscape-->');
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
    data.content.should.eql('<!--hexoPostRenderEscape:' + expected + ':hexoPostRenderEscape-->');
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
    data.content.should.eql('<!--hexoPostRenderEscape:' + expected + ':hexoPostRenderEscape-->');
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
    data.content.should.eql('<!--hexoPostRenderEscape:' + expected + ':hexoPostRenderEscape-->');
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
    data.content.should.eql('<!--hexoPostRenderEscape:' + expected + ':hexoPostRenderEscape-->');
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
    data.content.should.eql('<!--hexoPostRenderEscape:' + expected + ':hexoPostRenderEscape-->');
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
    data.content.should.eql('<!--hexoPostRenderEscape:' + expected + ':hexoPostRenderEscape-->');
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
    data.content.should.eql('<!--hexoPostRenderEscape:' + expected + ':hexoPostRenderEscape-->');
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
    data.content.should.eql('<!--hexoPostRenderEscape:' + expected + ':hexoPostRenderEscape-->');
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
    data.content.should.eql('<!--hexoPostRenderEscape:' + expected + ':hexoPostRenderEscape-->');
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
    data.content.should.eql('<!--hexoPostRenderEscape:' + expected + ':hexoPostRenderEscape-->');
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
    data.content.should.eql('<!--hexoPostRenderEscape:' + highlight(code, { lang: 'js', wrap: false }) + ':hexoPostRenderEscape-->');

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
    data.content.should.eql('```foo```\n\n<!--hexoPostRenderEscape:' + highlight(code, {}) + ':hexoPostRenderEscape-->');
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
    data.content.should.eql('<!--hexoPostRenderEscape:' + highlight(code + '\nfoo```\n\nbar```\nbaz', {}) + ':hexoPostRenderEscape-->');
  });
});
