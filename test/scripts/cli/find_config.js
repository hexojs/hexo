var should = require('chai').should();
var fs = require('hexo-fs');
var pathFn = require('path');

describe('Find config', function(){
  var findConfig = require('../../../lib/cli/find_config');

  it('not found', function(){
    return findConfig(__dirname, {}).then(function(path){
      should.not.exist(path);
    });
  });

  ['yaml', 'yml', 'json'].forEach(function(type){
    it('found ' + type, function(){
      var configPath = pathFn.join(__dirname, '_config.' + type);

      return fs.writeFile(configPath, '').then(function(){
        return findConfig(__dirname, {});
      }).then(function(path){
        path.should.eql(__dirname);

        return fs.unlink(configPath);
      });
    });
  });

  it('custom config path', function(){
    return findConfig(__dirname, {config: 'test'}).then(function(path){
      should.not.exist(path);
    });
  });
});