var should = require('chai').should();

describe.skip('render', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname, {silent: true});
  var render = require('../../../lib/plugins/console/render').bind(hexo);

  before(function(){
    return hexo.init();
  });

  it('relative path', function(){
    //
  });

  it('absolute path', function(){
    //
  });

  it('multiple files', function(){
    //
  });

  it('output', function(){
    //
  });

  it('engine', function(){
    //
  });

  it('pretty', function(){
    //
  });
});