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

  function wrap(code) {
    const content = util.escapeHTML(util.stripIndent(code))
      .replace(/{/g, '&#123;')
      .replace(/}/g, '&#125;')
      .replace(/\n$/, '');
    return '<pre><code>' + content + '</code></pre>';
  }

  function wrapWithHack(code) {
    const content = util.escapeHTML(util.stripIndent(code))
      .replace(/{/g, '&#123;')
      .replace(/}/g, '&#125;')
      .replace(/^/mg, '> ')
      .replace(/^> /, '')
      .replace(/> $/, '')
      .replace(/\n$/, '');
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

  it('include indented blank line', () => {
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

  it('include non-indented blank line', () => {
    const code_raw = [
      'if (tired && night){',
      '  sleep();',
      '',
      '}'
    ];
    const code_cooked = code_raw.map(x => `    ${x}`).map(x => x.replace(/^ {4}$/, ''));

    const data = {
      content: [
        ...code_cooked
      ].join('\n') + '\n'
    };

    const expected = [
      '<!--hexoPostRenderEscape:' + wrap(code_cooked.slice(0, 2).join('\n') + '\n') + ':hexoPostRenderEscape-->',
      '',
      '<!--hexoPostRenderEscape:' + wrap(code_cooked.slice(3, 4).join('\n') + '\n') + ':hexoPostRenderEscape-->'
    ].join('\n') + '\n';

    codeBlock(data);
    data.content.should.eql(expected);
  });

  it('include blank line (latter half only is target', () => {
    const code_raw = [
      'aaa',
      '    if (tired && night){', // lack of preceding blank line
      '    ',
      '      sleep();',
      '    }'
    ];
    const code = code_raw.slice(3).join('\n') + '\n';

    const data = {
      content: [
        ...code_raw
      ].join('\n') + '\n'
    };

    const expected = [
      'aaa',
      '    if (tired && night){',
      '    ',
      '<!--hexoPostRenderEscape:' + wrap(code) + ':hexoPostRenderEscape-->'
    ].join('\n') + '\n';

    codeBlock(data);
    data.content.should.eql(expected);
  });

  it('include quote mark as content', () => {
    const code_raw = [
      '> if (tired && night){',
      '>   sleep();',
      '> ',
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

  it('include quote mark as content (not target)', () => {
    const code_raw = [
      'aaa',
      '    > if (tired && night){', // lack of preceding blank line
      '    >   sleep();',
      '    > ',
      '    > }'
    ];
    const code = code_raw.join('\n') + '\n';

    const data = {
      content: [
        ...code_raw
      ].join('\n') + '\n'
    };

    codeBlock(data);
    data.content.should.eql(code);
  });

  it('included by blockquote (target, only itself)', () => {
    const data = {
      content: [
        ...code_cooked
      ].map(x => `> ${x}`).join('\n') + '\n'
    };

    const expected = [
      '> <!--hexoPostRenderEscape:' + wrapWithHack(code) + ':hexoPostRenderEscape-->'
    ].join('\n') + '\n';

    codeBlock(data);
    data.content.should.eql(expected);
  });

  it('included by blockquote (intermediate target)', () => {
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
      '> <!--hexoPostRenderEscape:' + wrapWithHack(code) + ':hexoPostRenderEscape-->',
      '> ',
      '> bbb'
    ].join('\n') + '\n';

    codeBlock(data);
    data.content.should.eql(expected);
  });

  it('included by blockquote (not target)', () => {
    const data = {
      content: [
        'aaa',
        ...code_cooked, // lack of preceding blank line
        '',
        'bbb'
      ].map(x => `> ${x}`).join('\n') + '\n'
    };

    const expected = data.content;

    codeBlock(data);
    data.content.should.eql(expected);
  });

  it('included by blockquote (intermediate target, last line is a blank line)', () => {
    const code_raw = [
      'if (tired && night){',
      '  sleep();',
      '}',
      '' // last line is a blank line
    ];
    const code = code_raw.join('\n') + '\n';
    const code_cooked = code_raw.map(x => `    ${x}`);

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
      '> <!--hexoPostRenderEscape:' + wrapWithHack(code) + ':hexoPostRenderEscape-->',
      '> ',
      '> bbb'
    ].join('\n') + '\n';

    codeBlock(data);
    data.content.should.eql(expected);
  });

  it('included by blockquote (vague notation, intermediate target)', () => {
    const data = {
      content: [
        '> aaa',
        '> ',
        ...code_cooked, // lack of quote mark
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

  it('included by blockquote (vague notation, not target)', () => {
    const data = {
      content: [
        '> aaa',
        ...code_cooked, // lack of preceding blank line, lack of quote mark
        '> ',
        '> bbb'
      ].join('\n') + '\n'
    };

    const expected = data.content;

    codeBlock(data);
    data.content.should.eql(expected);
  });

  it('included by blockquote (intermediate blank line, intermediate target)', () => {
    const code_raw = [
      'if (tired && night){',
      '  sleep();',
      '', // intermediate blank line
      '}'
    ];
    const code = code_raw.join('\n') + '\n';
    const code_cooked = code_raw.map(x => `    ${x}`);

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
      '> <!--hexoPostRenderEscape:' + wrapWithHack(code) + ':hexoPostRenderEscape-->',
      '> ',
      '> bbb'
    ].join('\n') + '\n';

    codeBlock(data);
    data.content.should.eql(expected);
  });
});
