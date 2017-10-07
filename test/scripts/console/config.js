var should = require('chai').should(); // eslint-disable-line
var fs = require('hexo-fs');
var pathFn = require('path');
var yaml = require('js-yaml');
var _ = require('lodash');
var rewire = require('rewire');
var sinon = require('sinon');

describe('config', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'config_test'), {silent: true});
  var config = require('../../../lib/plugins/console/config').bind(hexo);
  var configModule = rewire('../../../lib/plugins/console/config');

  before(() => fs.mkdirs(hexo.base_dir).then(() => hexo.init()));

  beforeEach(() => fs.writeFile(hexo.config_path, ''));

  after(() => fs.rmdir(hexo.base_dir));

  it('read all config', () => {
    var spy = sinon.spy();

    return configModule.__with__({
      console: {
        log: spy
      }
    })(() => configModule.call(hexo, {_: []})).then(() => {
      spy.args[0][0].should.eql(hexo.config);
    });
  });

  it('read config', () => {
    var spy = sinon.spy();

    return configModule.__with__({
      console: {
        log: spy
      }
    })(() => configModule.call(hexo, {_: ['title']})).then(() => {
      spy.args[0][0].should.eql(hexo.config.title);
    });
  });

  it('read nested config', () => {
    var spy = sinon.spy();

    hexo.config.server = {
      port: 12345
    };

    return configModule.__with__({
      console: {
        log: spy
      }
    })(() => configModule.call(hexo, {_: ['server.port']})).then(() => {
      spy.args[0][0].should.eql(hexo.config.server.port);
    }).finally(() => {
      delete hexo.config.server;
    });
  });

  function writeConfig() {
    var args = _.toArray(arguments);

    return config({_: args}).then(() => fs.readFile(hexo.config_path)).then(content => yaml.load(content));
  }

  it('write config', () => writeConfig('title', 'My Blog').then(config => {
    config.title.should.eql('My Blog');
  }));

  it('write config: number', () => writeConfig('server.port', '5000').then(config => {
    config.server.port.should.eql(5000);
  }));

  it('write config: false', () => writeConfig('post_asset_folder', 'false').then(config => {
    config.post_asset_folder.should.be.false;
  }));

  it('write config: true', () => writeConfig('post_asset_folder', 'true').then(config => {
    config.post_asset_folder.should.be.true;
  }));

  it('write config: null', () => writeConfig('language', 'null').then(config => {
    should.not.exist(config.language);
  }));

  it('write config: regex', () => writeConfig('include', /^pattern$/gim).then(config => {
    config.include.should.eql(/^pattern$/gim);
  }));

  it('write config: json', () => {
    var configPath = hexo.config_path = pathFn.join(hexo.base_dir, '_config.json');

    return fs.writeFile(configPath, '{}').then(() => config({_: ['title', 'My Blog']})).then(() => fs.readFile(configPath)).then(content => {
      var json = JSON.parse(content);

      json.title.should.eql('My Blog');

      hexo.config_path = pathFn.join(hexo.base_dir, '_config.yml');
      return fs.unlink(configPath);
    });
  });

  it('create config if not exist', () => fs.unlink(hexo.config_path).then(() => writeConfig('subtitle', 'Hello world')).then(config => {
    config.subtitle.should.eql('Hello world');
  }));
});
