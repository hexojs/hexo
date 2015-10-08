'use strict';

var should = require('chai').should(); // eslint-disable-line
var util = require('hexo-util');

describe('code', function() {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var codeTag = require('../../../lib/plugins/tag/code')(hexo);

  var fixture = [
    'if (tired && night){',
    '  sleep();',
    '}'
  ].join('\n');

  function code(args, content) {
    return codeTag(args.split(' '), content);
  }

  function highlight(code, options) {
    return util.highlight(code, options || {})
      .replace(/{/g, '&#123;')
      .replace(/}/g, '&#125;');
  }

  it('default', function() {
    var result = code('', fixture);
    result.should.eql(highlight(fixture));
  });

  it('non standard indent', function() {
    var nonStandardIndent = [
        '  ',
        '  return x;',
        '}',
        '',
        fixture,
        '  '
    ].join('/n');
    var result = code('', nonStandardIndent);
    result.should.eql(highlight(nonStandardIndent));
  });

  it('lang', function() {
    var result = code('lang:js', fixture);
    result.should.eql(highlight(fixture, {lang: 'js'}));
  });

  it('title', function() {
    var result = code('Hello world', fixture);
    result.should.eql(highlight(fixture, {caption: '<span>Hello world</span>'}));
  });

  it('link', function() {
    var result = code('Hello world http://hexo.io/', fixture);
    var expected = highlight(fixture, {
      caption: '<span>Hello world</span><a href="http://hexo.io/">link</a>'
    });

    result.should.eql(expected);
  });

  it('link text', function() {
    var result = code('Hello world http://hexo.io/ Hexo', fixture);
    var expected = highlight(fixture, {
      caption: '<span>Hello world</span><a href="http://hexo.io/">Hexo</a>'
    });

    result.should.eql(expected);
  });

  it('disabled', function() {
    hexo.config.highlight.enable = false;

    var result = code('', fixture);
    result.should.eql('<pre><code>' + fixture + '</code></pre>');

    hexo.config.highlight.enable = true;
  });
});
