'use strict';

var should = require('chai').should();
var pathFn = require('path');
var fs = require('hexo-fs');

describe('Update package.json', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname, {silent: true});
  var updatePkg = require('../../../lib/hexo/update_package');
  var packagePath = pathFn.join(hexo.base_dir, 'package.json');

  beforeEach(function(){
    hexo.env.init = false;
  })

  it('package.json does not exist', function(){
    return updatePkg(hexo).then(function(){
      hexo.env.init.should.be.false;
    });
  });

  it('package.json exists, but the version doesn\'t match', function(){
    var pkg = {
      hexo: {
        version: '0.0.1'
      }
    };

    return fs.writeFile(packagePath, JSON.stringify(pkg)).then(function(){
      return updatePkg(hexo);
    }).then(function(){
      return fs.readFile(packagePath);
    }).then(function(content){
      JSON.parse(content).hexo.version.should.eql(hexo.version);
      hexo.env.init.should.be.true;

      return fs.unlink(packagePath);
    });
  });

  it('package.json exists, but don\'t have hexo data', function(){
    var pkg = {
      name: 'hexo',
      version: '0.0.1'
    };

    return fs.writeFile(packagePath, JSON.stringify(pkg)).then(function(){
      return updatePkg(hexo);
    }).then(function(){
      return fs.readFile(packagePath);
    }).then(function(content){
      // Don't change the original package.json
      JSON.parse(content).should.eql(pkg);
      hexo.env.init.should.be.false;

      return fs.unlink(packagePath);
    });
  });

  it('package.json exists and everything is ok', function(){
    var pkg = {
      hexo: {
        version: hexo.version
      }
    };

    return fs.writeFile(packagePath, JSON.stringify(pkg)).then(function(){
      return updatePkg(hexo);
    }).then(function(){
      return fs.readFile(packagePath);
    }).then(function(content){
      JSON.parse(content).should.eql(pkg);
      hexo.env.init.should.be.true;

      return fs.unlink(packagePath);
    });
  });
});