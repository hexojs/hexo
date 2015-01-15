var should = require('chai').should();
var pathFn = require('path');
var fs = require('hexo-fs');
var _ = require('lodash');

describe('Load config', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'config_test'), {silent: true});
  var loadConfig = require('../../../lib/hexo/load_config');
  var defaultConfig = require('../../../lib/hexo/default_config');

  function reset(){
    hexo.env.init = false;
    hexo.config = _.clone(defaultConfig);
  }

  before(function(){
    return fs.mkdirs(pathFn.join(hexo.base_dir, 'themes', 'landscape')).then(function(){
      return hexo.init();
    });
  });

  it('config file does not exist', function(){
    return loadConfig(hexo).then(function(){
      hexo.env.init.should.be.false;
    });
  });

  it('_config.yml exists', function(){
    var configPath = pathFn.join(hexo.base_dir, '_config.yml');

    return fs.writeFile(configPath, 'foo: 1').then(function(){
      return loadConfig(hexo);
    }).then(function(){
      hexo.env.init.should.be.true;
      hexo.config.foo.should.eql(1);
      hexo.theme_dir.should.eql(pathFn.resolve(hexo.base_dir, 'themes', 'landscape') + pathFn.sep);
      hexo.theme_script_dir.should.eql(pathFn.resolve(hexo.theme_dir, 'scripts') + pathFn.sep);

      reset();
      return fs.unlink(configPath);
    });
  });

  it('_config.yaml exists', function(){
    var configPath = pathFn.join(hexo.base_dir, '_config.yaml');

    return fs.writeFile(configPath, 'bar: 2').then(function(){
      return loadConfig(hexo);
    }).then(function(){
      hexo.env.init.should.be.true;
      hexo.config.bar.should.eql(2);

      reset();
      return fs.unlink(configPath);
    });
  });

  it('_config.json exists', function(){
    var configPath = pathFn.join(hexo.base_dir, '_config.json');

    return fs.writeFile(configPath, '{"baz": 3}').then(function(){
      return loadConfig(hexo);
    }).then(function(){
      hexo.env.init.should.be.true;
      hexo.config.baz.should.eql(3);

      reset();
      return fs.unlink(configPath);
    });
  });

  it('custom config path', function(){
    var configPath = hexo.config_path = pathFn.join(__dirname, 'werwerwer.yml');

    return fs.writeFile(configPath, 'foo: 1').then(function(){
      return loadConfig(hexo);
    }).then(function(){
      hexo.env.init.should.be.true;
      hexo.config.foo.should.eql(1);

      reset();
      hexo.config_path = pathFn.join(hexo.base_dir, '_config.yml');
      return fs.unlink(configPath);
    });
  });

  it('handle trailing "/" of url', function(){
    var content = [
      'root: foo',
      'url: http://hexo.io/'
    ].join('\n');

    return fs.writeFile(hexo.config_path, content).then(function(){
      return loadConfig(hexo);
    }).then(function(){
      hexo.config.root.should.eql('foo/');
      hexo.config.url.should.eql('http://hexo.io');

      reset();
      return fs.unlink(hexo.config_path);
    });
  });

  it('custom public_dir', function(){
    return fs.writeFile(hexo.config_path, 'public_dir: foo').then(function(){
      return loadConfig(hexo);
    }).then(function(){
      hexo.public_dir.should.eql(pathFn.resolve(hexo.base_dir, 'foo') + pathFn.sep);
      reset();
      return fs.unlink(hexo.config_path);
    });
  });

  it('custom source_dir', function(){
    return fs.writeFile(hexo.config_path, 'source_dir: bar').then(function(){
      return loadConfig(hexo);
    }).then(function(){
      hexo.source_dir.should.eql(pathFn.resolve(hexo.base_dir, 'bar') + pathFn.sep);
      reset();
      return fs.unlink(hexo.config_path);
    });
  });

  after(function(){
    return fs.rmdir(hexo.base_dir);
  });
});