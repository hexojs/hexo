var should = require('chai').should();
var util = require('../../../lib/util');
var highlight = util.highlight;

describe.skip('Backtick code block', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var codeBlock = require('../../../lib/plugins/filter/before_post_render/backtick_code_block').bind(hexo);

  hexo.config.highlight = {
    enable: true
  };

  it('disabled', function(){
    hexo.config.highlight.enable = false;

    var content = [
      '```',
      'alert("Hello")',
      '```'
    ].join('\n');

    var data = {content: content};

    codeBlock(data);
    data.content.should.eql(content);

    hexo.config.highlight.enable = true;
  });

  it('normal', function(){
    //
  });

  it('specified language', function(){
    //
  });

  it('title', function(){
    //
  });

  it('url', function(){
    //
  });

  it('link text', function(){
    //
  });

  it('indention', function(){
    //
  });

  it('line_number', function(){
    //
  });

  it('tab_replace', function(){
    //
  });
});