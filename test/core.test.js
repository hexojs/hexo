var path = require('path'),
  should = require('chai').should();

describe('Core', function(){
  var baseDir = path.join(__dirname, 'blog') + path.sep,
    coreDir = path.dirname(__dirname) + path.sep;

  it('core_dir', function(){
    hexo.core_dir.should.eql(coreDir);
  });

  it('lib_dir', function(){
    hexo.lib_dir.should.eql(path.join(coreDir, 'lib') + path.sep);
  });

  it('version', function(){
    hexo.version.should.eql(require('../package.json').version);
  });

  it('base_dir', function(){
    hexo.base_dir.should.eql(baseDir);
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

  it('env', function(){
    hexo.env.debug.should.be.true;
    hexo.env.safe.should.be.false;
    hexo.env.silent.should.be.true;
    hexo.env.env.should.eql('development');
    hexo.env.version.should.eql(require('../package.json').version);
    hexo.env.init.should.be.true;
  });
});