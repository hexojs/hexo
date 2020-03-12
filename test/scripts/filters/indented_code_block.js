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
  const code = code_raw.join('\n') + '\n';
  const code_cooked = code_raw.map(x => `    ${x}`);
  const code_trimmed = code.trim();

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
      ].map(x => `    ${x}`).join('\n') + '\n'
    };

    codeBlock(data);
    data.content.should.eql('<!--hexoPostRenderEscape:' + wrap(code) + ':hexoPostRenderEscape-->\n');
  });

  it('indent in paragraph (not target)', () => {
    const code_raw = [
      'test test test',
      '    hello world',
      'test test',
      '    hello',
      '    world',
      'test test test'
    ];
    const code = code_raw.join('\n') + '\n';

    const data = {
      content: code
    };

    codeBlock(data);
    data.content.should.eql(code);
  });

  it('nested list items (not target)', () => {
    const code_raw = [
      '- aaa',
      '  - bbb',
      '    - ccc',
      '      - ddd'
    ];
    const code = code_raw.join('\n') + '\n';

    const data = {
      content: code
    };

    codeBlock(data);
    data.content.should.eql(code);
  });

  it('single tab indent', () => {
    const data = {
      content: [
        ...code_raw
      ].map(x => `\t${x}`).join('\n') + '\n'
    };

    codeBlock(data);
    data.content.should.eql('<!--hexoPostRenderEscape:' + wrap(code) + ':hexoPostRenderEscape-->\n');
  });

  it('extra indent', () => {
    const indentCode = code_raw.map(line => '  ' + line);

    const data = {
      content: [
        ...indentCode
      ].map(x => `    ${x}`).join('\n') + '\n'
    };

    codeBlock(data);
    data.content.should.eql('<!--hexoPostRenderEscape:' + wrap(code) + ':hexoPostRenderEscape-->\n');
  });

  it('include tab', () => {
    const code_raw = [
      'if (tired && night){',
      '\tsleep();',
      '}'
    ];
    const code = code_raw.join('\n') + '\n';

    const data = {
      content: [
        ...code_raw
      ].map(x => `    ${x}`).join('\n') + '\n'
    };

    codeBlock(data);
    data.content.should.eql('<!--hexoPostRenderEscape:' + wrap(code) + ':hexoPostRenderEscape-->\n');
  });

  it('include blank line', () => {
    const code_raw = [
      'if (tired && night){',
      '',
      '  sleep();',
      '',
      '}'
    ];
    const code = code_raw.join('\n') + '\n';

    const data = {
      content: [
        ...code_raw
      ].map(x => `    ${x}`).join('\n') + '\n'
    };

    codeBlock(data);
    data.content.should.eql('<!--hexoPostRenderEscape:' + wrap(code) + ':hexoPostRenderEscape-->\n');
  });

  it('include quote mark as content', () => {
    const code_raw = [
      '> if (tired && night){',
      '>   sleep();',
      '> }'
    ];
    const code = code_raw.join('\n') + '\n';

    const data = {
      content: [
        ...code_raw
      ].map(x => `    ${x}`).join('\n') + '\n'
    };

    codeBlock(data);
    data.content.should.eql('<!--hexoPostRenderEscape:' + wrap(code) + ':hexoPostRenderEscape-->\n');
  });

  it('included by blockquote (target, only itself)', () => {
    const data = {
      content: [
        ...code_cooked
      ].map(x => `> ${x}`).join('\n') + '\n'
    };

    const expected = [
      '> <!--hexoPostRenderEscape:' + wrap(code_trimmed).replace(/^/mg, '> ') + ':hexoPostRenderEscape-->'
    ].join('\n') + '\n';

    codeBlock(data);
    data.content.should.eql(expected);
  });

  it('included by blockquote (target)', () => {
    const data = {
      content: [
        'aaa',
        '',
        ...code_cooked,
        '',
        'bbb'
      ].map(x => `> ${x}`).join('\n') + '\n'
    };

    const expected = [
      '> aaa',
      '> ',
      '> <!--hexoPostRenderEscape:' + wrap(code_trimmed).replace(/^/mg, '> ') + ':hexoPostRenderEscape-->',
      '> ',
      '> bbb'
    ].join('\n') + '\n';

    codeBlock(data);
    data.content.should.eql(expected);
  });

  it('included by blockquote (target, vague notation)', () => {
    const data = {
      content: [
        '> aaa',
        '> ',
        ...code_cooked,
        '> ',
        '> bbb'
      ].join('\n') + '\n'
    };

    const expected = [
      '> aaa',
      '> ',
      '<!--hexoPostRenderEscape:' + wrap(code) + ':hexoPostRenderEscape-->',
      '> ',
      '> bbb'
    ].join('\n') + '\n';

    codeBlock(data);
    data.content.should.eql(expected);
  });
});
