var should = require('chai').should();
var pathFn = require('path');
var sep = pathFn.sep;

describe('Hexo', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var coreDir = pathFn.join(__dirname, '../../..');
  var version = require('../../../package.json').version;

  hexo.extend.console.register('test', function(args){
    return args;
  });

  it('constructor', function(){
    hexo.core_dir.should.eql(coreDir + sep);
    hexo.lib_dir.should.eql(pathFn.join(coreDir, 'lib') + sep);
    hexo.version.should.eql(version);
    hexo.base_dir.should.eql(__dirname + sep);
    hexo.public_dir.should.eql(pathFn.join(__dirname, 'public') + sep);
    hexo.source_dir.should.eql(pathFn.join(__dirname, 'source') + sep);
    hexo.plugin_dir.should.eql(pathFn.join(__dirname, 'node_modules') + sep);
    hexo.script_dir.should.eql(pathFn.join(__dirname, 'scripts') + sep);
    hexo.scaffold_dir.should.eql(pathFn.join(__dirname, 'scaffolds') + sep);
    hexo.env.should.eql({
      args: {},
      debug: false,
      safe: false,
      silent: false,
      env: 'development',
      version: version,
      init: false
    });
    hexo.config_path.should.eql(pathFn.join(__dirname, '_config.yml'));
  });

  it('call()', function(){
    return hexo.call('test', {foo: 'bar'}).then(function(data){
      data.should.eql({foo: 'bar'});
    });
  });

  it('call() - callback', function(callback){
    hexo.call('test', {foo: 'bar'}, function(err, data){
      should.not.exist(err);
      data.should.eql({foo: 'bar'});

      callback();
    });
  });

  it('call() - console not registered', function(){
    return hexo.call('nothing').catch(function(err){
      err.should.have.property('message', 'Console `nothing` has not been registered yet!');
    });
  });

  it('init()');

  it('model()');
});