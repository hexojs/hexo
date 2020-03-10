'use strict';

const util = require('hexo-util');
const defaultConfig = require('../../../lib/hexo/default_config');

describe('Indented code block', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo();
  const codeBlock = require('../../../lib/plugins/filter/before_post_render/indented_code_block').bind(hexo);

  const code_raw = [
    'if (tired && night){',
    '  sleep();',
    '}'
  ];
  const code = code_raw.join('\n');

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
      ...code_raw
    ].map(x => `    ${x}`).join('\n');

    const data = {content};

    hexo.config.highlight.enable = false;
    codeBlock(data);
    data.content.should.eql(content);
  });

  it('with no config (disabled)', () => {
    const content = [
      ...code_raw
    ].map(x => `    ${x}`).join('\n');

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
        ...code_raw
      ].map(x => `    ${x}`).join('\n')
    };

    codeBlock(data);
    data.content.should.eql('<!--hexoPostRenderEscape:' + highlight(code, {}) + ':hexoPostRenderEscape-->');
  });

  it('without language name', () => {
    const data = {
      content: [
        ...code_raw
      ].map(x => `    ${x}`).join('\n')
    };

    const expected = highlight(code);

    codeBlock(data);
    data.content.should.eql('<!--hexoPostRenderEscape:' + expected + ':hexoPostRenderEscape-->');
  });

  it('without language name - ignore tab character', () => {
    const data = {
      content: [
        ...code_raw
      ].map(x => `    ${x}`).join('\n')
    };

    const expected = highlight(code);

    codeBlock(data);
    data.content.should.eql('<!--hexoPostRenderEscape:' + expected + ':hexoPostRenderEscape-->');
  });

  it('indent', () => {
    const indentCode = code_raw.map(line => '  ' + line);

    const data = {
      content: [
        ...indentCode
      ].map(x => `    ${x}`).join('\n')
    };

    const expected = highlight(code, {
    });

    codeBlock(data);
    data.content.should.eql('<!--hexoPostRenderEscape:' + expected + ':hexoPostRenderEscape-->');
  });

  it('line number false', () => {
    hexo.config.highlight.line_number = false;

    const data = {
      content: [
        ...code_raw
      ].map(x => `    ${x}`).join('\n')
    };

    const expected = highlight(code, {
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
        ...code_raw
      ].map(x => `    ${x}`).join('\n')
    };

    const expected = highlight(code, {
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
        ...code_raw
      ].map(x => `    ${x}`).join('\n')
    };

    const expected = highlight(code, {
      gutter: false
    });

    codeBlock(data);
    data.content.should.eql('<!--hexoPostRenderEscape:' + expected + ':hexoPostRenderEscape-->');
  });

  it('line number true', () => {
    hexo.config.highlight.line_number = true;

    const data = {
      content: [
        ...code_raw
      ].map(x => `    ${x}`).join('\n')
    };

    const expected = highlight(code, {
      gutter: true
    });

    codeBlock(data);
    data.content.should.eql('<!--hexoPostRenderEscape:' + expected + ':hexoPostRenderEscape-->');
  });

  it('tab replace', () => {
    hexo.config.highlight.tab_replace = '  ';

    const code_raw = [
      'if (tired && night){',
      '\tsleep();',
      '}'
    ];
    const code = code_raw.join('\n');

    const data = {
      content: [
        ...code_raw
      ].map(x => `    ${x}`).join('\n')
    };

    const expected = highlight(code, {
      tab: '  '
    });

    codeBlock(data);
    data.content.should.eql('<!--hexoPostRenderEscape:' + expected + ':hexoPostRenderEscape-->');
  });

  it('wrap', () => {
    hexo.config.highlight.wrap = false;

    const data = {
      content: [
        ...code_raw
      ].map(x => `    ${x}`).join('\n')
    };

    codeBlock(data);
    data.content.should.eql('<!--hexoPostRenderEscape:' + highlight(code, {wrap: false }) + ':hexoPostRenderEscape-->');

    hexo.config.highlight.wrap = true;
  });
});
