var should = require('chai').should();

describe('Helper - css', function(){
  var css = require('../../lib/plugins/helper/css');

  var genResult = function(arr){
    var result = [];

    arr.forEach(function(item){
      result.push('<link rel="stylesheet" href="' + item + '.css" type="text/css">');
    });

    return result.join('\n');
  };

  it('a string', function(){
    var result = genResult(['/style']);

    css('style').should.eql(result);
    css('style.css').should.eql(result);

    css('http://zespia.tw/style.css').should.eql(genResult(['http://zespia.tw/style']));
    css('//zespia.tw/style.css').should.eql(genResult(['//zespia.tw/style']));
  });

  it('an array', function(){
    var result = genResult(['/foo', '/bar', '/baz']);

    css(['foo', 'bar', 'baz']).should.eql(result);
  });

  it('multiple strings', function(){
    var result = genResult(['/foo', '/bar', '/baz']);

    css('foo', 'bar', 'baz').should.eql(result);
  });

  it('multiple arrays', function(){
    var result = genResult(['/s1', '/s2', '/s3', '/s4', '/s5', '/s6']);

    css(['s1', 's2', 's3'], ['s4', 's5'], ['s6']).should.eql(result);
  });

  it('mixed', function(){
    var result = genResult(['/s1', '/s2', '/s3', '/s4', '/s5', '/s6']);

    css(['s1', 's2'], 's3', 's4', ['s5'], 's6').should.eql(result);
  });
});