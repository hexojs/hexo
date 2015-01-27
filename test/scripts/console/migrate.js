'use strict';

var should = require('chai').should();
var sinon = require('sinon');

describe('migrate', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname, {silent: true});
  var migrate = require('../../../lib/plugins/console/migrate').bind(hexo);

  it('default', function(){
    var migrator = sinon.spy(function(args){
      args.foo.should.eql(1);
      args.bar.should.eql(2);
    });

    hexo.extend.migrator.register('test', migrator);

    return migrate({_: ['test'], foo: 1, bar: 2}).then(function(){
      migrator.calledOnce.should.be.true;
    });
  });
});