'use strict';

const pathFn = require('path');
const fs = require('hexo-fs');
const { highlight, prismHighlight } = require('hexo-util');
const Promise = require('bluebird');

describe('include_code', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(pathFn.join(__dirname, 'include_code_test'));
  const includeCode = Promise.method(require('../../../lib/plugins/tag/include_code')(hexo));
  const path = pathFn.join(hexo.source_dir, hexo.config.code_dir, 'test.js');

  const fixture = [
    'if (tired && night){',
    '  sleep();',
    '}'
  ].join('\n');

  const code = args => includeCode(args.split(' '));

  before(() => fs.writeFile(path, fixture));

  after(() => fs.rmdir(hexo.base_dir));

  it('highlightjs - default', () => {
    hexo.config.highlight.enable = true;
    hexo.config.prismjs.enable = false;

    const expected = highlight(fixture, {
      lang: 'js',
      caption: '<span>test.js</span><a href="/downloads/code/test.js">view raw</a>'
    });

    return code('test.js').then(result => {
      result.should.eql(expected);
    });
  });

  it('highlightjs - title', () => {
    const expected = highlight(fixture, {
      lang: 'js',
      caption: '<span>Hello world</span><a href="/downloads/code/test.js">view raw</a>'
    });

    return code('Hello world test.js').then(result => {
      result.should.eql(expected);
    });
  });

  it('highlightjs - lang', () => {
    const expected = highlight(fixture, {
      lang: 'js',
      caption: '<span>Hello world</span><a href="/downloads/code/test.js">view raw</a>'
    });

    return code('Hello world lang:js test.js').then(result => {
      result.should.eql(expected);
    });
  });

  it('highlightjs - from', () => {
    const fixture = [
      '}'
    ].join('\n');
    const expected = highlight(fixture, {
      lang: 'js',
      caption: '<span>Hello world</span><a href="/downloads/code/test.js">view raw</a>'
    });

    return code('Hello world lang:js from:3 test.js').then(result => {
      result.should.eql(expected);
    });
  });

  it('highlightjs - to', () => {
    const fixture = [
      'if (tired && night){',
      '  sleep();'
    ].join('\n');
    const expected = highlight(fixture, {
      lang: 'js',
      caption: '<span>Hello world</span><a href="/downloads/code/test.js">view raw</a>'
    });

    return code('Hello world lang:js to:2 test.js').then(result => {
      result.should.eql(expected);
    });
  });

  it('highlightjs - from and to', () => {
    const fixture = [
      'sleep();'
    ].join('\n');
    const expected = highlight(fixture, {
      lang: 'js',
      caption: '<span>Hello world</span><a href="/downloads/code/test.js">view raw</a>'
    });

    return code('Hello world lang:js from:2 to:2 test.js').then(result => {
      result.should.eql(expected);
    });
  });

  it('highlightjs - file not found', () => code('nothing').then(result => {
    should.not.exist(result);
  }));

  it('highlightjs - disabled', () => {
    hexo.config.highlight.enable = false;

    return code('test.js').then(result => {
      result.should.eql('<pre><code>' + fixture + '</code></pre>');
      hexo.config.highlight.enable = true;
    });
  });

  it('prismjs - default', () => {
    hexo.config.highlight.enable = false;
    hexo.config.prismjs.enable = true;

    const expected = prismHighlight(fixture, {
      lang: 'js',
      caption: '<span>test.js</span><a href="/downloads/code/test.js">view raw</a>'
    });

    return code('test.js').then(result => {
      result.should.eql(expected);
    });
  });

  it('prismjs - lang', () => {
    const expected = prismHighlight(fixture, {
      lang: 'js',
      caption: '<span>Hello world</span><a href="/downloads/code/test.js">view raw</a>'
    });

    return code('Hello world lang:js test.js').then(result => {
      result.should.eql(expected);
    });
  });

  it('prismjs - from', () => {
    const fixture = [
      '}'
    ].join('\n');
    const expected = prismHighlight(fixture, {
      lang: 'js',
      caption: '<span>Hello world</span><a href="/downloads/code/test.js">view raw</a>'
    });

    return code('Hello world lang:js from:3 test.js').then(result => {
      result.should.eql(expected);
    });
  });

  it('prismjs - to', () => {
    const fixture = [
      'if (tired && night){',
      '  sleep();'
    ].join('\n');
    const expected = prismHighlight(fixture, {
      lang: 'js',
      caption: '<span>Hello world</span><a href="/downloads/code/test.js">view raw</a>'
    });

    return code('Hello world lang:js to:2 test.js').then(result => {
      result.should.eql(expected);
    });
  });

  it('prismjs - from and to', () => {
    const fixture = [
      'sleep();'
    ].join('\n');
    const expected = prismHighlight(fixture, {
      lang: 'js',
      caption: '<span>Hello world</span><a href="/downloads/code/test.js">view raw</a>'
    });

    return code('Hello world lang:js from:2 to:2 test.js').then(result => {
      result.should.eql(expected);
    });
  });

  it('prismjs - title', async () => {
    const expected = prismHighlight(fixture, {
      lang: 'js',
      caption: '<span>Hello world</span><a href="/downloads/code/test.js">view raw</a>'
    });

    const result = await code('Hello world test.js');
    result.should.eql(expected);
  });

  it('prismjs - file not found', () => code('nothing').then(result => {
    should.not.exist(result);
  }));

  it('prismjs - disabled', () => {
    hexo.config.highlight.enable = false;
    hexo.config.prismjs.enable = false;

    return code('test.js').then(result => {
      result.should.eql('<pre><code>' + fixture + '</code></pre>');
    });
  });
});
