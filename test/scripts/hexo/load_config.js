'use strict';

var should = require('chai').should(); // eslint-disable-line
var pathFn = require('path');
var fs = require('hexo-fs');
var _ = require('lodash');

describe('Load config', function() {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'config_test'), {silent: true});
  var loadConfig = require('../../../lib/hexo/load_config');
  var defaultConfig = require('../../../lib/hexo/default_config');

  hexo.env.init = true;

  before(function() {
    return fs.mkdirs(hexo.base_dir).then(function() {
      return hexo.init();
    });
  });

  after(function() {
    return fs.rmdir(hexo.base_dir);
  });

  beforeEach(function() {
    hexo.config = _.cloneDeep(defaultConfig);
  });

  it('config file does not exist', function() {
    return loadConfig(hexo).then(function() {
      hexo.config.should.eql(defaultConfig);
    });
  });

  it('_config.yml exists', function() {
    var configPath = pathFn.join(hexo.base_dir, '_config.yml');

    return fs.writeFile(configPath, 'foo: 1').then(function() {
      return loadConfig(hexo);
    }).then(function() {
      hexo.config.foo.should.eql(1);
    }).finally(function() {
      return fs.unlink(configPath);
    });
  });

  it('_config.json exists', function() {
    var configPath = pathFn.join(hexo.base_dir, '_config.json');

    return fs.writeFile(configPath, '{"baz": 3}').then(function() {
      return loadConfig(hexo);
    }).then(function() {
      hexo.config.baz.should.eql(3);
    }).finally(function() {
      return fs.unlink(configPath);
    });
  });

  it('_config.txt exists', function() {
    var configPath = pathFn.join(hexo.base_dir, '_config.txt');

    return fs.writeFile(configPath, 'foo: 1').then(function() {
      return loadConfig(hexo);
    }).then(function() {
      hexo.config.should.eql(defaultConfig);
    }).finally(function() {
      return fs.unlink(configPath);
    });
  });

  it('custom config path', function() {
    var configPath = hexo.config_path = pathFn.join(__dirname, 'werwerwer.yml');

    return fs.writeFile(configPath, 'foo: 1').then(function() {
      return loadConfig(hexo);
    }).then(function() {
      hexo.config.foo.should.eql(1);
    }).finally(function() {
      hexo.config_path = pathFn.join(hexo.base_dir, '_config.yml');
      return fs.unlink(configPath);
    });
  });

  it('custom config path with different extension name', function() {
    var realPath = pathFn.join(__dirname, 'werwerwer.json');
    hexo.config_path = pathFn.join(__dirname, 'werwerwer.yml');

    return fs.writeFile(realPath, '{"foo": 2}').then(function() {
      return loadConfig(hexo);
    }).then(function() {
      hexo.config.foo.should.eql(2);
      hexo.config_path.should.eql(realPath);
    }).finally(function() {
      hexo.config_path = pathFn.join(hexo.base_dir, '_config.yml');
      return fs.unlink(realPath);
    });
  });

  it('handle trailing "/" of url', function() {
    var content = [
      'root: foo',
      'url: http://hexo.io/'
    ].join('\n');

    return fs.writeFile(hexo.config_path, content).then(function() {
      return loadConfig(hexo);
    }).then(function() {
      hexo.config.root.should.eql('foo/');
      hexo.config.url.should.eql('http://hexo.io');
    }).finally(function() {
      return fs.unlink(hexo.config_path);
    });
  });

  it('custom public_dir', function() {
    return fs.writeFile(hexo.config_path, 'public_dir: foo').then(function() {
      return loadConfig(hexo);
    }).then(function() {
      hexo.public_dir.should.eql(pathFn.resolve(hexo.base_dir, 'foo') + pathFn.sep);
    }).finally(function() {
      return fs.unlink(hexo.config_path);
    });
  });

  it('custom source_dir', function() {
    return fs.writeFile(hexo.config_path, 'source_dir: bar').then(function() {
      return loadConfig(hexo);
    }).then(function() {
      hexo.source_dir.should.eql(pathFn.resolve(hexo.base_dir, 'bar') + pathFn.sep);
    }).finally(function() {
      return fs.unlink(hexo.config_path);
    });
  });

  it('custom theme', function() {
    return fs.writeFile(hexo.config_path, 'theme: test').then(function() {
      return loadConfig(hexo);
    }).then(function() {
      hexo.config.theme.should.eql('test');
      hexo.theme_dir.should.eql(pathFn.join(hexo.base_dir, 'themes', 'test') + pathFn.sep);
      hexo.theme_script_dir.should.eql(pathFn.join(hexo.theme_dir, 'scripts') + pathFn.sep);
      hexo.theme.base.should.eql(hexo.theme_dir);
    }).finally(function() {
      return fs.unlink(hexo.config_path);
    });
  });

  it('merge config', function() {
    var content = [
      'highlight:',
      '  tab_replace: yoooo'
    ].join('\n');

    return fs.writeFile(hexo.config_path, content).then(function() {
      return loadConfig(hexo);
    }).then(function() {
      hexo.config.highlight.enable.should.be.true;
      hexo.config.highlight.tab_replace.should.eql('yoooo');
    }).finally(function() {
      return fs.unlink(hexo.config_path);
    });
  });
});
