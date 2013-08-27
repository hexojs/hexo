var path = require('path'),
  Core = require('../lib/core'),
  Router = require('../lib/router'),
  Extend = require('../lib/extend'),
  Logger = require('../lib/logger');

describe('core', function(){
  var baseDir = path.join(__dirname, 'blog');

  it('constructor', function(){
    hexo.should.be.instanceof(Core);
  });

  it('core_dir', function(){
    hexo.core_dir.should.eql(path.dirname(__dirname) + path.sep);
  });

  it('lib_dir', function(){
    hexo.lib_dir.should.eql(path.resolve(__dirname, '../lib') + path.sep);
  });

  it('version', function(){
    hexo.version.should.eql(require('../package.json').version);
  });

  it('util', function(){
    hexo.util.should.eql(require('../lib/util'));
  });

  it('base_dir', function(){
    hexo.base_dir.should.eql(baseDir + path.sep);
  });

  it('public_dir', function(){
    hexo.public_dir.should.eql(path.join(baseDir, 'public') + path.sep);
  });

  it('source_dir', function(){
    hexo.source_dir.should.eql(path.join(baseDir, 'source') + path.sep);
  });

  it('plugin_dir', function(){
    hexo.plugin_dir.should.eql(path.join(baseDir, 'node_modules') + path.sep);
  });

  it('script_dir', function(){
    hexo.script_dir.should.eql(path.join(baseDir, 'scripts') + path.sep);
  });

  it('scaffold_dir', function(){
    hexo.scaffold_dir.should.eql(path.join(baseDir, 'scaffolds') + path.sep);
  });

  it('route', function(){
    hexo.route.should.be.instanceof(Router);
  });

  it('extend', function(){
    hexo.extend.should.be.instanceof(Extend);

    [
      'console',
      'deployer',
      'filter',
      'generator',
      'helper',
      'migrator',
      'processor',
      'renderer',
      'swig',
      'tag'
    ].forEach(function(item){
      hexo.extend[item].should.be.instanceof(require('../lib/extend/' + item));
    });
  });

  it('log', function(){
    hexo.log.should.be.instanceof(Logger);
  });
});