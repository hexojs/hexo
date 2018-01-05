'use strict';

var pathFn = require('path');
var should = require('chai').should(); // eslint-disable-line
var fs = require('hexo-fs');
var highlight = require('hexo-util').highlight;
var Promise = require('bluebird');

describe('include_code', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'include_code_test'));
  var includeCode = Promise.method(require('../../../lib/plugins/tag/include_code')(hexo));
  var path = pathFn.join(hexo.source_dir, hexo.config.code_dir, 'test.js');

  var fixture = [
    'if (tired && night){',
    '  sleep();',
    '}'
  ].join('\n');

  function code(args) {
    return includeCode(args.split(' '));
  }

  before(() => fs.writeFile(path, fixture));

  after(() => fs.rmdir(hexo.base_dir));

  it('default', () => {
    var expected = highlight(fixture, {
      lang: 'js',
      caption: '<span>test.js</span><a href="/downloads/code/test.js">view raw</a>'
    });

    return code('test.js').then(result => {
      result.should.eql(expected);
    });
  });

  it('title', () => {
    var expected = highlight(fixture, {
      lang: 'js',
      caption: '<span>Hello world</span><a href="/downloads/code/test.js">view raw</a>'
    });

    return code('Hello world test.js').then(result => {
      result.should.eql(expected);
    });
  });

  it('lang', () => {
    var expected = highlight(fixture, {
      lang: 'js',
      caption: '<span>Hello world</span><a href="/downloads/code/test.js">view raw</a>'
    });

    return code('Hello world lang:js test.js').then(result => {
      result.should.eql(expected);
    });
  });

  it('file not found', () => code('nothing').then(result => {
    should.not.exist(result);
  }));

  it('disabled', () => {
    hexo.config.highlight.enable = false;

    return code('test.js').then(result => {
      result.should.eql('<pre><code>' + fixture + '</code></pre>');
      hexo.config.highlight.enable = true;
    });
  });
});
