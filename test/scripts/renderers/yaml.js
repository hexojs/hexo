var should = require('chai').should();

describe('yaml', function(){
  var r = require('../../../lib/plugins/renderer/yaml');

  it('normal', function(){
    r({text: 'foo: 1'}).should.eql({foo: 1});
  });

  it('escape', function(){
    var body = [
      'foo: 1',
      'bar:',
      '\tbaz: 3'
    ].join('\n');

    r({text: body}).should.eql({
      foo: 1,
      bar: {
        baz: 3
      }
    });
  });
});