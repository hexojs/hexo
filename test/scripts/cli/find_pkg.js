'use strict';

var should = require('chai').should();
var fs = require('hexo-fs');
var pathFn = require('path');

describe('find package', function(){
  var findPkg = require('../../../lib/cli/find_pkg');

  it('not found', function(){
    return findPkg(__dirname, {}).then(function(path){
      should.not.exist(path);
    });
  });

  it('found', function(){
    var pkgPath = pathFn.join(__dirname, 'package.json');

    return fs.writeFile(pkgPath, '{"name": "hexo-site"}').then(function(){
      return findPkg(__dirname, {});
    }).then(function(path){
      path.should.eql(__dirname);
    }).finally(function(){
      return fs.unlink(pkgPath);
    });
  });

  it('name not match', function(){
    var pkgPath = pathFn.join(__dirname, 'package.json');

    return fs.writeFile(pkgPath, '{"name": "hexo"}').then(function(){
      return findPkg(__dirname, {});
    }).then(function(path){
      should.not.exist(path);
    }).finally(function(){
      return fs.unlink(pkgPath);
    });
  });

  it('custom config path', function(){
    return findPkg(__dirname, {config: 'test'}).then(function(path){
      should.not.exist(path);
    });
  });
});