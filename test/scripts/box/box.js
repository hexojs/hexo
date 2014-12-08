var should = require('chai').should();
var pathFn = require('path');
var Hexo = require('../../../lib/hexo');
var Box = require('../../../lib/box');
var fs = require('hexo-fs');

describe('Box', function(){
  var hexo = new Hexo(__dirname, {});
  var base = pathFn.join(__dirname, 'tmp');
  var box = new Box(hexo, base);

  before(function(){
    return fs.mkdir(base);
  });

  it.skip('addProcessor()');

  it.skip('process()');

  it.skip('watch()');

  it.skip('unwatch()');

  after(function(){
    return fs.rmdir(base);
  });
});