var should = require('chai').should();

describe('migrate', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname, {silent: true});
  var migrate = require('../../../lib/plugins/console/migrate').bind(hexo);

  it('default', function(){
    var executed = 0;

    hexo.extend.migrator.register('test', function(args){
      args.foo.should.eql(1);
      args.bar.should.eql(2);
      executed++;
    });

    return migrate({_: ['test'], foo: 1, bar: 2}).then(function(){
      executed.should.eql(1);
    });
  });
});