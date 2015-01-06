var should = require('chai').should();
var fs = require('hexo-fs');
var pathFn = require('path');
var Promise = require('bluebird');

describe('Load plugins', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'plugin_test'), {silent: true});
  var loadPlugins = require('../../../lib/hexo/load_plugins');

  var script = [
    'hexo._script_test = {',
    '  filename: __filename,',
    '  dirname: __dirname,',
    '  module: module,',
    '  require: require',
    '}'
  ].join('\n');

  function validate(path){
    var result = hexo._script_test;

    result.filename.should.eql(path);
    result.dirname.should.eql(pathFn.dirname(path));
    result.module.id.should.eql(path);
    result.module.filename.should.eql(path);

    delete hexo._script_test;
  }

  function createPackageFile(){
    var pkg = {
      name: 'hexo-site',
      version: '0.0.0',
      private: true,
      dependencies: {}
    };

    for (var i = 0, len = arguments.length; i < len; i++){
      pkg.dependencies[arguments[i]] = '*';
    }

    return fs.writeFile(pathFn.join(hexo.base_dir, 'package.json'), JSON.stringify(pkg, null, '  '));
  }

  hexo.env.init = true;
  hexo.theme_script_dir = pathFn.join(hexo.base_dir, 'themes', 'test', 'scripts');

  before(function(){
    return fs.mkdir(hexo.base_dir);
  });

  after(function(){
    return fs.rmdir(hexo.base_dir);
  });

  it('load plugins', function(){
    var name = 'hexo-plugin-test';
    var path = pathFn.join(hexo.plugin_dir, name, 'index.js');

    return Promise.all([
      createPackageFile(name),
      fs.writeFile(path, script)
    ]).then(function(){
      return loadPlugins(hexo);
    }).then(function(){
      validate(path);
      return fs.unlink(path);
    });
  });

  it('ignore plugins whose name is not started with "hexo-"', function(){
    var script = 'hexo._script_test = true';
    var name = 'another-plugin';
    var path = pathFn.join(hexo.plugin_dir, name, 'index.js');

    return Promise.all([
      createPackageFile(name),
      fs.writeFile(path, script)
    ]).then(function(){
      return loadPlugins(hexo);
    }).then(function(){
      should.not.exist(hexo._script_test);
      return fs.unlink(path);
    });
  });

  it('ignore plugins which are in package.json but not exist actually', function(){
    return createPackageFile('hexo-plugin-test').then(function(){
      return loadPlugins(hexo);
    });
  });

  it('load scripts', function(){
    var path = pathFn.join(hexo.script_dir, 'test.js');

    return fs.writeFile(path, script).then(function(){
      return loadPlugins(hexo);
    }).then(function(){
      validate(path);
      return fs.unlink(path);
    });
  });

  it('load theme scripts', function(){
    var path = pathFn.join(hexo.theme_script_dir, 'test.js');

    return fs.writeFile(path, script).then(function(){
      return loadPlugins(hexo);
    }).then(function(){
      validate(path);
      return fs.unlink(path);
    });
  });

  it('don\'t load plugins in safe mode', function(){
    var script = 'hexo._script_test = true';
    var path = pathFn.join(hexo.script_dir, 'test.js');

    return fs.writeFile(path, script).then(function(){
      hexo.env.safe = true;
      return loadPlugins(hexo);
    }).then(function(){
      hexo.env.safe = false;
      should.not.exist(hexo._script_test);
      return fs.unlink(path);
    });
  });
});