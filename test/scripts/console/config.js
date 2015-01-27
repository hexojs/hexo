'use strict';

var should = require('chai').should();
var fs = require('hexo-fs');
var pathFn = require('path');
var yaml = require('js-yaml');
var _ = require('lodash');

describe('config', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'config_test'), {silent: true});
  var config = require('../../../lib/plugins/console/config').bind(hexo);

  before(function(){
    return fs.mkdirs(hexo.base_dir).then(function(){
      return hexo.init();
    });
  });

  beforeEach(function(){
    return fs.writeFile(hexo.config_path, '');
  });

  after(function(){
    return fs.rmdir(hexo.base_dir);
  });

  it('read all config');

  it('read config');

  function writeConfig(){
    var args = _.toArray(arguments);

    return config({_: args}).then(function(){
      return fs.readFile(hexo.config_path);
    }).then(function(content){
      return yaml.safeLoad(content);
    });
  }

  it('write config', function(){
    return writeConfig('title', 'My Blog').then(function(config){
      config.title.should.eql('My Blog');
    });
  });

  it('write config: number', function(){
    return writeConfig('server.port', '5000').then(function(config){
      config.server.port.should.eql(5000);
    });
  });

  it('write config: false', function(){
    return writeConfig('post_asset_folder', 'false').then(function(config){
      config.post_asset_folder.should.be.false;
    });
  });

  it('write config: true', function(){
    return writeConfig('post_asset_folder', 'true').then(function(config){
      config.post_asset_folder.should.be.true;
    });
  });

  it('write config: null', function(){
    return writeConfig('language', 'null').then(function(config){
      should.not.exist(config.language);
    });
  });

  it('write config: json', function(){
    var configPath = hexo.config_path = pathFn.join(hexo.base_dir, '_config.json');

    return fs.writeFile(configPath, '{}').then(function(){
      return config({_: ['title', 'My Blog']});
    }).then(function(){
      return fs.readFile(configPath);
    }).then(function(content){
      var json = JSON.parse(content);

      json.title.should.eql('My Blog');

      hexo.config_path = pathFn.join(hexo.base_dir, '_config.yml');
      return fs.unlink(configPath);
    });
  });

  it('create config if not exist', function(){
    return fs.unlink(hexo.config_path).then(function(){
      return writeConfig('subtitle', 'Hello world');
    }).then(function(config){
      config.subtitle.should.eql('Hello world');
    });
  });
});