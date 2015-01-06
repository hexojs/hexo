var should = require('chai').should();
var Pattern = require('hexo-util').Pattern;

describe('Processor', function(){
  var Processor = require('../../../lib/extend/processor');

  it('register()', function(){
    var p = new Processor();

    // pattern, fn
    p.register('test', function(){});
    p.list()[0].should.exist;

    // fn
    p.register(function(){});
    p.list()[1].should.exist;

    // no fn
    try {
      p.register();
    } catch (err){
      err.should.be
        .instanceOf(TypeError)
        .property('message', 'fn must be a function');
    }
  });

  it('list()', function(){
    var p = new Processor();

    p.register('test', function(){});
    p.list().length.should.eql(1);
  });
});