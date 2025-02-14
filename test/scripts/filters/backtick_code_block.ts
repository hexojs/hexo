import { highlight as highlightJs, prismHighlight, escapeHTML } from 'hexo-util';
import defaultConfig from '../../../lib/hexo/default_config';
import Hexo from '../../../lib/hexo';
import defaultCodeBlock from '../../../lib/plugins/filter/before_post_render/backtick_code_block';
import chai from 'chai';
const should = chai.should();

describe('Backtick code block', () => {
  const hexo = new Hexo();
  require('../../../lib/plugins/highlight/')(hexo);
  const codeBlock = defaultCodeBlock(hexo);

  const code = [
    'if (tired && night) {',
    '  sleep();',
    '}'
  ].join('\n');

  const escapeSwigTag = (str: string) => str.replace(/{/g, '&#123;').replace(/}/g, '&#125;');

  function highlight(code: string, options?) {
    return highlightJs(code, options || {})
      .replace(/{/g, '&#123;')
      .replace(/}/g, '&#125;');
  }

  function prism(code: string, options?) {
    return prismHighlight(code, options || {})
      .replace(/{/g, '&#123;')
      .replace(/}/g, '&#125;');
  }

  function createCodeWithOptions(options: string, source = code) {
    return [
      '```' + options,
      source,
      '```'
    ].join('\n');
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
    delete(hexo.config as any).highlight;
    delete(hexo.config as any).prismjs;

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

    it('line number false, don`t care first_line_number inline', () => {
      hexo.config.highlight.line_number = false;
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

    it('highlight disable', () => {
      const data = {
        content: createCodeWithOptions('js highlight:false')
      };
      const expected = escapeSwigTag(data.content);
      codeBlock(data);
      data.content.should.eql(expected);
    });

    it('line_number', () => {
      let data = {
        content: createCodeWithOptions('js line_number:false')
      };
      let expected = highlight(code, {
        lang: 'js',
        gutter: false
      });
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');

      data = {
        content: createCodeWithOptions('js line_number:true')
      };
      expected = highlight(code, {
        lang: 'js',
        gutter: true
      });
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('line_threshold', () => {
      let data = {
        content: createCodeWithOptions('js line_number:false line_threshold:1')
      };
      let expected = highlight(code, {
        lang: 'js',
        gutter: false
      });
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');

      data = {
        content: createCodeWithOptions('js line_number:true line_threshold:1')
      };
      expected = highlight(code, {
        lang: 'js',
        gutter: true
      });
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');

      data = {
        content: createCodeWithOptions('js line_number:true line_threshold:3')
      };
      expected = highlight(code, {
        lang: 'js',
        gutter: false
      });
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('first_line', () => {
      let data = {
        content: createCodeWithOptions('js first_line:1234')
      };
      let expected = highlight(code, {
        lang: 'js',
        firstLine: 1234
      });
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');

      data = {
        content: createCodeWithOptions('js')
      };
      expected = highlight(code, {
        lang: 'js',
        firstLine: 1
      });
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('mark', () => {
      const source = [
        'const http = require(\'http\');',
        '',
        'const hostname = \'127.0.0.1\';',
        'const port = 1337;',
        '',
        'http.createServer((req, res) => {',
        '  res.writeHead(200, { \'Content-Type\': \'text/plain\' });',
        '  res.end(\'Hello World\n\');',
        '}).listen(port, hostname, () => {',
        '  console.log(`Server running at http://${hostname}:${port}/`);',
        '});'
      ].join('\n');

      let data = {
        content: createCodeWithOptions('js mark:1,7-9,11', source)
      };
      let expected = highlight(source, {
        lang: 'js',
        mark: [1, 7, 8, 9, 11]
      });
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');

      data = {
        content: createCodeWithOptions('js mark:11,9-7,1', source)
      };
      expected = highlight(source, {
        lang: 'js',
        mark: [1, 7, 8, 9, 11]
      });
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('wrap', () => {
      let data = {
        content: createCodeWithOptions('js wrap:false')
      };
      let expected = highlight(code, {
        lang: 'js',
        wrap: false
      });
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');

      data = {
        content: createCodeWithOptions('js wrap:true')
      };
      expected = highlight(code, {
        lang: 'js',
        wrap: true
      });
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('language_attr', () => {
      const data = {
        content: createCodeWithOptions('js language_attr:true')
      };
      const expected = highlight(code, {
        lang: 'js',
        languageAttr: true
      });
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('hybrid', () => {
      let data = {
        content: createCodeWithOptions('js Hello world https://hexo.io/ Hexo line_number:true line_threshold:1')
      };
      const expected = highlight(code, {
        lang: 'js',
        caption: '<span>Hello world</span><a href="https://hexo.io/">Hexo</a>',
        gutter: true
      });
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
      data = {
        content: createCodeWithOptions('js line_number:true line_threshold:1 Hello world https://hexo.io/ Hexo')
      };
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
      data = {
        content: createCodeWithOptions('js Hello world line_number:true line_threshold:1 https://hexo.io/ Hexo')
      };
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    // https://github.com/hexojs/hexo/issues/5423
    it('with ordered list', () => {
      const data = {
        content: [
          '1. ``` js',
          code,
          '```',
          '2. ``` js',
          code,
          '```'
        ].join('\n')
      };

      codeBlock(data);
      data.content.should.eql([
        '1. <hexoPostRenderCodeBlock>' + highlight(code, { lang: 'js' }) + '</hexoPostRenderCodeBlock>',
        '2. <hexoPostRenderCodeBlock>' + highlight(code, { lang: 'js' }) + '</hexoPostRenderCodeBlock>'
      ].join('\n'));
    });

    // https://github.com/hexojs/hexo/issues/5423
    it('with unordered list', () => {
      let data = {
        content: [
          '- ``` js',
          code,
          '```',
          '- ``` js',
          code,
          '```'
        ].join('\n')
      };

      codeBlock(data);
      data.content.should.eql([
        '- <hexoPostRenderCodeBlock>' + highlight(code, { lang: 'js' }) + '</hexoPostRenderCodeBlock>',
        '- <hexoPostRenderCodeBlock>' + highlight(code, { lang: 'js' }) + '</hexoPostRenderCodeBlock>'
      ].join('\n'));

      data = {
        content: [
          '* ``` js',
          code,
          '```',
          '* ``` js',
          code,
          '```'
        ].join('\n')
      };

      codeBlock(data);
      data.content.should.eql([
        '* <hexoPostRenderCodeBlock>' + highlight(code, { lang: 'js' }) + '</hexoPostRenderCodeBlock>',
        '* <hexoPostRenderCodeBlock>' + highlight(code, { lang: 'js' }) + '</hexoPostRenderCodeBlock>'
      ].join('\n'));

      data = {
        content: [
          '+ ``` js',
          code,
          '```',
          '+ ``` js',
          code,
          '```'
        ].join('\n')
      };

      codeBlock(data);
      data.content.should.eql([
        '+ <hexoPostRenderCodeBlock>' + highlight(code, { lang: 'js' }) + '</hexoPostRenderCodeBlock>',
        '+ <hexoPostRenderCodeBlock>' + highlight(code, { lang: 'js' }) + '</hexoPostRenderCodeBlock>'
      ].join('\n'));
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
      const expected = `<pre><code class="js">${escapeSwigTag(escapeHTML(code))}</code></pre>`;
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
      hexo.config.prismjs.exclude_languages = [];
    });

    it('highlight disable', () => {
      const data = {
        content: createCodeWithOptions('js highlight:false')
      };
      const expected = escapeSwigTag(data.content);
      codeBlock(data);
      data.content.should.eql(expected);
    });

    it('line_number', () => {
      let data = {
        content: createCodeWithOptions('js line_number:false')
      };
      let expected = prism(code, {
        lang: 'js',
        lineNumber: false
      });
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');

      data = {
        content: createCodeWithOptions('js line_number:true')
      };
      expected = prism(code, {
        lang: 'js',
        lineNumber: true
      });
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('line_threshold', () => {
      let data = {
        content: createCodeWithOptions('js line_number:false line_threshold:1')
      };
      let expected = prism(code, {
        lang: 'js',
        lineNumber: false
      });
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');

      data = {
        content: createCodeWithOptions('js line_number:true line_threshold:1')
      };
      expected = prism(code, {
        lang: 'js',
        lineNumber: true
      });
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');

      data = {
        content: createCodeWithOptions('js line_number:true line_threshold:3')
      };
      expected = prism(code, {
        lang: 'js',
        lineNumber: false
      });
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('first_line', () => {
      let data = {
        content: createCodeWithOptions('js first_line:1234')
      };
      let expected = prism(code, {
        lang: 'js',
        firstLine: 1234
      });
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');

      data = {
        content: createCodeWithOptions('js')
      };
      expected = prism(code, {
        lang: 'js',
        firstLine: 1
      });
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('mark', () => {
      const source = [
        'const http = require(\'http\');',
        '',
        'const hostname = \'127.0.0.1\';',
        'const port = 1337;',
        '',
        'http.createServer((req, res) => {',
        '  res.writeHead(200, { \'Content-Type\': \'text/plain\' });',
        '  res.end(\'Hello World\n\');',
        '}).listen(port, hostname, () => {',
        '  console.log(`Server running at http://${hostname}:${port}/`);',
        '});'
      ].join('\n');

      let data = {
        content: createCodeWithOptions('js mark:1,7-9,11', source)
      };
      let expected = prism(source, {
        lang: 'js',
        mark: [1, 7, 8, 9, 11]
      });
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');

      data = {
        content: createCodeWithOptions('js mark:11,9-7,1', source)
      };
      expected = prism(source, {
        lang: 'js',
        mark: [1, 7, 8, 9, 11]
      });
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('wrap', () => {
      let data = {
        content: createCodeWithOptions('js wrap:false')
      };
      let expected = prism(code, {
        lang: 'js',
        wrap: false
      });
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');

      data = {
        content: createCodeWithOptions('js wrap:true')
      };
      expected = prism(code, {
        lang: 'js',
        wrap: true
      });
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('language_attr', () => {
      const data = {
        content: createCodeWithOptions('js language_attr:true')
      };
      const expected = prism(code, {
        lang: 'js',
        languageAttr: true
      });
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });

    it('hybrid', () => {
      let data = {
        content: createCodeWithOptions('js Hello world https://hexo.io/ Hexo line_number:true line_threshold:1')
      };
      const expected = prism(code, {
        lang: 'js',
        caption: '<span>Hello world</span><a href="https://hexo.io/">Hexo</a>',
        lineNumber: true
      });
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
      data = {
        content: createCodeWithOptions('js line_number:true line_threshold:1 Hello world https://hexo.io/ Hexo')
      };
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
      data = {
        content: createCodeWithOptions('js Hello world line_number:true line_threshold:1 https://hexo.io/ Hexo')
      };
      codeBlock(data);
      data.content.should.eql('<hexoPostRenderCodeBlock>' + expected + '</hexoPostRenderCodeBlock>');
    });
  });
});
