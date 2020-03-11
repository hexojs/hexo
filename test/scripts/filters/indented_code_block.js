'use strict';

const util = require('hexo-util');

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

  function wrap(code) {
    const content = util.escapeHTML(code)
      .replace(/{/g, '&#123;')
      .replace(/}/g, '&#125;');
    return '<pre><code>' + content + '</code></pre>';
  }

  beforeEach(() => {
  });

  it('default', () => {
    const data = {
      content: [
        ...code_raw
      ].map(x => `    ${x}`).join('\n')
    };

    codeBlock(data);
    data.content.should.eql('<!--hexoPostRenderEscape:' + wrap(code) + ':hexoPostRenderEscape-->');
  });

  it('indent', () => {
    const indentCode = code_raw.map(line => '  ' + line);

    const data = {
      content: [
        ...indentCode
      ].map(x => `    ${x}`).join('\n')
    };

    codeBlock(data);
    data.content.should.eql('<!--hexoPostRenderEscape:' + wrap(code) + ':hexoPostRenderEscape-->');
  });

  it('include tab', () => {
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

    codeBlock(data);
    data.content.should.eql('<!--hexoPostRenderEscape:' + wrap(code) + ':hexoPostRenderEscape-->');
  });
});
