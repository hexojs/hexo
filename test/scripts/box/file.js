var should = require('chai').should();
var pathFn = require('path');
var Promise = require('bluebird');
var fs = require('hexo-fs');
var yaml = require('js-yaml');

describe('File', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var Box = require('../../../lib/box');
  var box = new Box(hexo, __dirname);
  var target = pathFn.join(__dirname, '../../fixtures/test.yml');
  var body;
  var obj;

  var file = new box.File({
    source: target,
    path: target,
    type: 'create',
    params: {foo: 'bar'}
  });

  before(function(){
    return fs.readFile(target).then(function(result){
      body = result;
      obj = yaml.load(result);
      return hexo.init();
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

  it('render()', function(){
    return file.render().then(function(data){
      data.should.eql(obj);
    });
  });

  it('renderSync()', function(){
    file.renderSync().should.eql(obj);
  });
});