var should = require('chai').should();
var pathFn = require('path');
var Promise = require('bluebird');
var File = require('../../../lib/box/file');
var util = require('../../../lib/util');
var fs = util.fs;

describe('File', function(){
  var target = pathFn.join(__dirname, '../../fixtures/test.yml');
  var body;

  var file = new File({
    source: target,
    path: target,
    type: 'create',
    params: {foo: 'bar'}
  });

  before(function(){
    return fs.readFile(target).then(function(result){
      body = result;
    });
  });

  it('read()', function(){
    return file.read().then(function(content){
      content.should.eql(body);
    });
  });

  it('readSync()', function(){
    file.readSync().should.eql(body);
  });

  it('stat()', function(){
    return Promise.all([
      fs.stat(target),
      file.stat()
    ]).then(function(stats){
      stats[0].should.eql(stats[1]);
    });
  });

  it('statSync()', function(){
    return fs.stat(target).then(function(stats){
      file.statSync().should.eql(stats);
    });
  });

  it.skip('render()');

  it.skip('renderSync()');
});