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

  it('single tab indent', () => {
    const data = {
      content: [
        ...code_raw
      ].map(x => `\t${x}`).join('\n')
    };

    codeBlock(data);
    data.content.should.eql('<!--hexoPostRenderEscape:' + wrap(code) + ':hexoPostRenderEscape-->');
  });

  it('extra indent', () => {
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

  it('include quote mark as content', () => {
    const code_raw = [
      '> if (tired && night){',
      '>   sleep();',
      '> }'
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

  it('included by blockquote', () => {
    const code_raw = [
      'if (tired && night){',
      '  sleep();',
      '}'
    ];
    const code = code_raw.join('\n');

    const code_cooked = [
      ...code_raw
    ].map(x => `    ${x}`);

    const data = {
      content: [
        'aaa',
        '',
        ...code_cooked,
        '',
        'bbb'
      ].map(x => `> ${x}`).join('\n')
    };

    const expected = [
      '> aaa',
      '> ',
      '> <!--hexoPostRenderEscape:' + wrap(code) + ':hexoPostRenderEscape-->',
      '> ',
      '> bbb'
    ].join('\n');

    codeBlock(data);
    data.content.should.eql(expected);
  });
});
