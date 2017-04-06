var should = require('chai').should(); // eslint-disable-line
var pathFn = require('path');
var fs = require('hexo-fs');
var _ = require('lodash');

describe('Load config', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'config_test'), {silent: true});
  var loadConfig = require('../../../lib/hexo/load_config');
  var defaultConfig = require('../../../lib/hexo/default_config');

  hexo.env.init = true;

  before(() => fs.mkdirs(hexo.base_dir).then(() => hexo.init()));

  after(() => fs.rmdir(hexo.base_dir));

  beforeEach(() => {
    hexo.config = _.cloneDeep(defaultConfig);
  });

  it('config file does not exist', () => loadConfig(hexo).then(() => {
    hexo.config.should.eql(defaultConfig);
  }));

  it('_config.yml exists', () => {
    var configPath = pathFn.join(hexo.base_dir, '_config.yml');

    return fs.writeFile(configPath, 'foo: 1').then(() => loadConfig(hexo)).then(() => {
      hexo.config.foo.should.eql(1);
    }).finally(() => fs.unlink(configPath));
  });

  it('_config.json exists', () => {
    var configPath = pathFn.join(hexo.base_dir, '_config.json');

    return fs.writeFile(configPath, '{"baz": 3}').then(() => loadConfig(hexo)).then(() => {
      hexo.config.baz.should.eql(3);
    }).finally(() => fs.unlink(configPath));
  });

  it('_config.txt exists', () => {
    var configPath = pathFn.join(hexo.base_dir, '_config.txt');

    return fs.writeFile(configPath, 'foo: 1').then(() => loadConfig(hexo)).then(() => {
      hexo.config.should.eql(defaultConfig);
    }).finally(() => fs.unlink(configPath));
  });

  it('custom config path', () => {
    var configPath = hexo.config_path = pathFn.join(__dirname, 'werwerwer.yml');

    return fs.writeFile(configPath, 'foo: 1').then(() => loadConfig(hexo)).then(() => {
      hexo.config.foo.should.eql(1);
    }).finally(() => {
      hexo.config_path = pathFn.join(hexo.base_dir, '_config.yml');
      return fs.unlink(configPath);
    });
  });

  it('custom config path with different extension name', () => {
    var realPath = pathFn.join(__dirname, 'werwerwer.json');
    hexo.config_path = pathFn.join(__dirname, 'werwerwer.yml');

    return fs.writeFile(realPath, '{"foo": 2}').then(() => loadConfig(hexo)).then(() => {
      hexo.config.foo.should.eql(2);
      hexo.config_path.should.eql(realPath);
    }).finally(() => {
      hexo.config_path = pathFn.join(hexo.base_dir, '_config.yml');
      return fs.unlink(realPath);
    });
  });

  it('handle trailing "/" of url', () => {
    var content = [
      'root: foo',
      'url: http://hexo.io/'
    ].join('\n');

    return fs.writeFile(hexo.config_path, content).then(() => loadConfig(hexo)).then(() => {
      hexo.config.root.should.eql('foo/');
      hexo.config.url.should.eql('http://hexo.io');
    }).finally(() => fs.unlink(hexo.config_path));
  });

  it('custom public_dir', () => fs.writeFile(hexo.config_path, 'public_dir: foo').then(() => loadConfig(hexo)).then(() => {
    hexo.public_dir.should.eql(pathFn.resolve(hexo.base_dir, 'foo') + pathFn.sep);
  }).finally(() => fs.unlink(hexo.config_path)));

  it('custom source_dir', () => fs.writeFile(hexo.config_path, 'source_dir: bar').then(() => loadConfig(hexo)).then(() => {
    hexo.source_dir.should.eql(pathFn.resolve(hexo.base_dir, 'bar') + pathFn.sep);
  }).finally(() => fs.unlink(hexo.config_path)));

  it('custom theme', () => fs.writeFile(hexo.config_path, 'theme: test').then(() => loadConfig(hexo)).then(() => {
    hexo.config.theme.should.eql('test');
    hexo.theme_dir.should.eql(pathFn.join(hexo.base_dir, 'themes', 'test') + pathFn.sep);
    hexo.theme_script_dir.should.eql(pathFn.join(hexo.theme_dir, 'scripts') + pathFn.sep);
    hexo.theme.base.should.eql(hexo.theme_dir);
  }).finally(() => fs.unlink(hexo.config_path)));

  it('merge config', () => {
    var content = [
      'highlight:',
      '  tab_replace: yoooo'
    ].join('\n');

    return fs.writeFile(hexo.config_path, content).then(() => loadConfig(hexo)).then(() => {
      hexo.config.highlight.enable.should.be.true;
      hexo.config.highlight.tab_replace.should.eql('yoooo');
    }).finally(() => fs.unlink(hexo.config_path));
  });
});
