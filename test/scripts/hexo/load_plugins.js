var should = require('chai').should();
var fs = require('hexo-fs');
var pathFn = require('path');

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

    result.filename = path;
    result.dirname = pathFn.dirname(path);
    result.module.id = path;
    result.module.filename = path;

    delete hexo._script_test;
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
    var path = pathFn.join(hexo.plugin_dir, 'hexo-plugin-test', 'index.js');

    return fs.writeFile(path, script).then(function(){
      return loadPlugins(hexo);
    }).then(function(){
      validate(path);
      return fs.unlink(path);
    });
  });

  it('ignore plugins whose name is not started with "hexo-"', function(){
    var script = 'hexo._script_test = true';
    var path = pathFn.join(hexo.plugin_dir, 'another-plugin', 'index.js');

    return fs.writeFile(path, script).then(function(){
      return loadPlugins(hexo);
    }).then(function(){
      should.not.exist(hexo._script_test);
      return fs.unlink(path);
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