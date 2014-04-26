var should = require('chai').should();

describe('Helper - js', function(){
  var js = require('../../../lib/plugins/helper/js');

  var genResult = function(arr){
    var result = [];

    arr.forEach(function(item){
      result.push('<script type="text/javascript" src="' + item + '.js"></script>');
    });

    return result.join('\n');
  };

  it('a string', function(){
    var result = genResult(['/script']);

    js('script').should.eql(result);
    js('script.js').should.eql(result);

    js('http://code.jquery.com/jquery-2.0.3.min.js').should.eql(genResult(['http://code.jquery.com/jquery-2.0.3.min']));
    js('//code.jquery.com/jquery-2.0.3.min.js').should.eql(genResult(['//code.jquery.com/jquery-2.0.3.min']));
  });

  it('an array', function(){
    var result = genResult(['/foo', '/bar', '/baz']);

    js(['foo', 'bar', 'baz']).should.eql(result);
  });

  it('multiple strings', function(){
    var result = genResult(['/foo', '/bar', '/baz']);

    js('foo', 'bar', 'baz').should.eql(result);
  });

  it('multiple arrays', function(){
    var result = genResult(['/s1', '/s2', '/s3', '/s4', '/s5', '/s6']);

    js(['s1', 's2', 's3'], ['s4', 's5'], ['s6']).should.eql(result);
  });

  it('mixed', function(){
    var result = genResult(['/s1', '/s2', '/s3', '/s4', '/s5', '/s6']);

    js(['s1', 's2'], 's3', 's4', ['s5'], 's6').should.eql(result);
  });
});