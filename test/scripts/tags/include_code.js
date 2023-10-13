'use strict';

const { join } = require('path');
const { rmdir, writeFile } = require('hexo-fs');
const { highlight, prismHighlight } = require('hexo-util');
const Promise = require('bluebird');

describe('include_code', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(join(__dirname, 'include_code_test'));
  require('../../../dist/plugins/highlight/')(hexo);
  const includeCode = Promise.method(require('../../../dist/plugins/tag/include_code')(hexo));
  const path = join(hexo.source_dir, hexo.config.code_dir, 'test.js');
  const defaultCfg = JSON.parse(JSON.stringify(hexo.config));

  const fixture = [
    'if (tired && night){',
    '  sleep();',
    '}'
  ].join('\n');

  const code = args => includeCode(args.split(' '));

  before(() => writeFile(path, fixture));

  beforeEach(() => {
    hexo.config = JSON.parse(JSON.stringify(defaultCfg));
  });

  after(() => rmdir(hexo.base_dir));

  describe('highlightjs', () => {
    it('default', async () => {
      hexo.config.syntax_highlighter = 'highlight.js';

      const expected = highlight(fixture, {
        lang: 'js',
        caption: '<span>test.js</span><a href="/downloads/code/test.js">view raw</a>'
      });

      const result = await code('test.js');
      result.should.eql(expected);
    });

    it('title', async () => {
      const expected = highlight(fixture, {
        lang: 'js',
        caption: '<span>Hello world</span><a href="/downloads/code/test.js">view raw</a>'
      });

      const result = await code('Hello world test.js');
      result.should.eql(expected);
    });

    it('lang', async () => {
      const expected = highlight(fixture, {
        lang: 'js',
        caption: '<span>Hello world</span><a href="/downloads/code/test.js">view raw</a>'
      });

      const result = await code('Hello world lang:js test.js');
      result.should.eql(expected);
    });

    it('language_attr', async () => {
      const original = hexo.config.highlight.language_attr;
      hexo.config.highlight.language_attr = true;

      const expected = highlight(fixture, {
        lang: 'js',
        caption: '<span>Hello world</span><a href="/downloads/code/test.js">view raw</a>',
        languageAttr: true
      });

      const result = await code('Hello world lang:js test.js');
      result.should.eql(expected);

      hexo.config.highlight.language_attr = original;
    });

    it('from', async () => {
      const fixture = [
        '}'
      ].join('\n');
      const expected = highlight(fixture, {
        lang: 'js',
        caption: '<span>Hello world</span><a href="/downloads/code/test.js">view raw</a>'
      });

      const result = await code('Hello world lang:js from:3 test.js');
      result.should.eql(expected);
    });

    it('to', async () => {
      const fixture = [
        'if (tired && night){',
        '  sleep();'
      ].join('\n');
      const expected = highlight(fixture, {
        lang: 'js',
        caption: '<span>Hello world</span><a href="/downloads/code/test.js">view raw</a>'
      });

      const result = await code('Hello world lang:js to:2 test.js');
      result.should.eql(expected);
    });

    it('from and to', async () => {
      const fixture = [
        'sleep();'
      ].join('\n');
      const expected = highlight(fixture, {
        lang: 'js',
        caption: '<span>Hello world</span><a href="/downloads/code/test.js">view raw</a>'
      });

      const result = await code('Hello world lang:js from:2 to:2 test.js');
      result.should.eql(expected);
    });

    it('file not found', async () => {
      const result = await code('nothing');
      should.not.exist(result);
    });

    it('disabled', async () => {
      hexo.config.syntax_highlighter = '';

      const result = await code('test.js');
      result.should.eql('<pre><code>' + fixture + '</code></pre>');
    });
  });

  describe('prismjs', () => {
    beforeEach(() => {
      hexo.config.syntax_highlighter = 'prismjs';
    });

    it('default', async () => {
      const expected = prismHighlight(fixture, {
        lang: 'js',
        caption: '<span>test.js</span><a href="/downloads/code/test.js">view raw</a>'
      });

      const result = await code('test.js');
      result.should.eql(expected);
    });

    it('lang', async () => {
      const expected = prismHighlight(fixture, {
        lang: 'js',
        caption: '<span>Hello world</span><a href="/downloads/code/test.js">view raw</a>'
      });

      const result = await code('Hello world lang:js test.js');
      result.should.eql(expected);
    });

    it('from', async () => {
      const fixture = [
        '}'
      ].join('\n');
      const expected = prismHighlight(fixture, {
        lang: 'js',
        caption: '<span>Hello world</span><a href="/downloads/code/test.js">view raw</a>'
      });

      const result = await code('Hello world lang:js from:3 test.js');
      result.should.eql(expected);
    });

    it('to', async () => {
      const fixture = [
        'if (tired && night){',
        '  sleep();'
      ].join('\n');
      const expected = prismHighlight(fixture, {
        lang: 'js',
        caption: '<span>Hello world</span><a href="/downloads/code/test.js">view raw</a>'
      });

      const result = await code('Hello world lang:js to:2 test.js');
      result.should.eql(expected);
    });

    it('from and to', async () => {
      const fixture = [
        'sleep();'
      ].join('\n');
      const expected = prismHighlight(fixture, {
        lang: 'js',
        caption: '<span>Hello world</span><a href="/downloads/code/test.js">view raw</a>'
      });

      const result = await code('Hello world lang:js from:2 to:2 test.js');
      result.should.eql(expected);
    });

    it('title', async () => {
      const expected = prismHighlight(fixture, {
        lang: 'js',
        caption: '<span>Hello world</span><a href="/downloads/code/test.js">view raw</a>'
      });

      const result = await code('Hello world test.js');
      result.should.eql(expected);
    });

    it('file not found', async () => {
      const result = await code('nothing');
      should.not.exist(result);
    });

    it('disabled', async () => {
      hexo.config.syntax_highlighter = '';

      const result = await code('test.js');
      result.should.eql('<pre><code>' + fixture + '</code></pre>');
    });
  });
});
