'use strict';

var should = require('chai').should();
var util = require('hexo-util');
var _ = require('lodash');
var highlight = util.highlight;
var defaultConfig = require('../../../lib/hexo/default_config');

describe('Backtick code block', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var codeBlock = require('../../../lib/plugins/filter/before_post_render/backtick_code_block').bind(hexo);

  var code = [
    'if (tired && night){',
    '  sleep();',
    '}'
  ].join('\n');

  beforeEach(function(){
    // Reset config
    hexo.config.highlight = _.clone(defaultConfig.highlight);
  });

  it('disabled', function(){
    var content = [
      '``` js',
      code,
      '```'
    ].join('\n');

    var data = {content: content};

    hexo.config.highlight.enable = false;
    codeBlock(data);
    data.content.should.eql(content);
  });

  it('default', function(){
    var data = {
      content: [
        '``` js',
        code,
        '```'
      ].join('\n')
    };

    codeBlock(data);
    data.content.should.eql('<escape>' + highlight(code, {lang: 'js'}) + '</escape>');
  });

  it('title', function(){
    var data = {
      content: [
        '``` js Hello world',
        code,
        '```'
      ].join('\n')
    };

    var expected = highlight(code, {
      lang: 'js',
      caption: '<span>Hello world</span>'
    });

    codeBlock(data);
    data.content.should.eql('<escape>' + expected + '</escape>');
  });

  it('url', function(){
    var data = {
      content: [
        '``` js Hello world http://hexo.io/',
        code,
        '```'
      ].join('\n')
    };

    var expected = highlight(code, {
      lang: 'js',
      caption: '<span>Hello world</span><a href="http://hexo.io/">link</a>'
    });

    codeBlock(data);
    data.content.should.eql('<escape>' + expected + '</escape>');
  });

  it('link text', function(){
    var data = {
      content: [
        '``` js Hello world http://hexo.io/ Hexo',
        code,
        '```'
      ].join('\n')
    };

    var expected = highlight(code, {
      lang: 'js',
      caption: '<span>Hello world</span><a href="http://hexo.io/">Hexo</a>'
    });

    codeBlock(data);
    data.content.should.eql('<escape>' + expected + '</escape>');
  });

  it('indent', function(){
    var indentCode = code.split('\n').map(function(line){
      return '  ' + line;
    }).join('\n');

    var data = {
      content: [
        '``` js Hello world http://hexo.io/',
        indentCode,
        '```'
      ].join('\n')
    };

    var expected = highlight(code, {
      lang: 'js',
      caption: '<span>Hello world</span><a href="http://hexo.io/">link</a>'
    });

    codeBlock(data);
    data.content.should.eql('<escape>' + expected + '</escape>');
  });

  it('line number', function(){
    hexo.config.highlight.line_number = false;

    var data = {
      content: [
        '``` js',
        code,
        '```'
      ].join('\n')
    };

    var expected = highlight(code, {
      lang: 'js',
      gutter: false
    });

    codeBlock(data);
    data.content.should.eql('<escape>' + expected + '</escape>');
  });

  it('tab replace', function(){
    hexo.config.highlight.tab_replace = '  ';

    var code = [
      'if (tired && night){',
      '\tsleep();',
      '}'
    ].join('\n');

    var data = {
      content: [
        '``` js',
        code,
        '```'
      ].join('\n')
    };

    var expected = highlight(code, {
      lang: 'js',
      tab: '  '
    });

    codeBlock(data);
    data.content.should.eql('<escape>' + expected + '</escape>');
  });
});