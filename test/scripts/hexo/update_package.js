var should = require('chai').should();
var pathFn = require('path');
var fs = require('hexo-fs');

describe('Update package.json', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname, {silent: true});
  var updatePkg = require('../../../lib/hexo/update_package');
  var packagePath = pathFn.join(hexo.base_dir, 'package.json');

  hexo.env.init = true;

  before(function(){
    return hexo.init();
  });

  afterEach(function(){
    return fs.exists(packagePath).then(function(exist){
      if (exist) return fs.unlink(packagePath);
    });
  });

  it('package.json does not exist', function(){
    var pkg = require('../../../assets/package.json');

    return updatePkg(hexo).then(function(){
      return fs.readFile(packagePath);
    }).then(function(raw){
      var content = JSON.parse(raw);
      pkg.version = hexo.version;
      content.should.eql(pkg);
    });
  });

  it('package.json exists, but the version does not match', function(){
    var pkg = {
      name: 'hexo-site',
      version: '0.0.1'
    };

    return fs.writeFile(packagePath, JSON.stringify(pkg)).then(function(){
      return updatePkg(hexo);
    }).then(function(){
      return fs.readFile(packagePath);
    }).then(function(raw){
      var content = JSON.parse(raw);
      pkg.version = hexo.version;
      content.should.eql(pkg);
    });
  });

  it('package.json exists and everything is ok', function(){
    var pkg = {
      name: 'hexo-site',
      version: hexo.version
    };

    return fs.writeFile(packagePath, JSON.stringify(pkg)).then(function(){
      return updatePkg(hexo);
    }).then(function(){
      return fs.readFile(packagePath);
    }).then(function(raw){
      var content = JSON.parse(raw);
      content.should.eql(pkg);
    });
  });
});