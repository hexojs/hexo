var should = require('chai').should();
var pathFn = require('path');
var fs = require('hexo-fs');
var Promise = require('bluebird');

describe('init', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'init_test'), {silent: true});
  var init = require('../../../lib/plugins/console/init').bind(hexo);
  var assetDir = pathFn.join(hexo.core_dir, 'assets');
  var assets = [];

  before(function(){
    return fs.listDir(assetDir).then(function(files){
      assets = files.map(function(item){
        return item === 'gitignore' ? '.gitignore' : item;
      });
    });
  });

  function check(baseDir){
    return Promise.map(assets, function(item){
      return Promise.all([
        fs.readFile(pathFn.join(assetDir, item === '.gitignore' ? 'gitignore' : item)),
        fs.readFile(pathFn.join(baseDir, item))
      ]).spread(function(asset, target){
        target.should.eql(asset);
      });
    }).then(function(){
      return fs.rmdir(baseDir);
    })
  }

  it('current path', function(){
    return init({
      _: []
    }).then(function(){
      return check(hexo.base_dir);
    });
  });

  it('relative path', function(){
    return init({
      _: ['foo']
    }).then(function(){
      return check(pathFn.join(hexo.base_dir, 'foo'));
    });
  });

  it('absolute path', function(){
    return init({
      _: [hexo.base_dir]
    }).then(function(){
      return check(hexo.base_dir);
    });
  });
});