var should = require('chai').should();
var pathFn = require('path');
var sep = pathFn.sep;

describe('Hexo', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var coreDir = pathFn.join(__dirname, '../../..');
  var version = require('../../../package.json').version;
  var Post = hexo.model('Post');

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

  it('_showDrafts()', function(){
    hexo._showDrafts().should.be.false;

    hexo.env.args.draft = true;
    hexo._showDrafts().should.be.true;
    hexo.env.args.draft = false;

    hexo.env.args.drafts = true;
    hexo._showDrafts().should.be.true;
    hexo.env.args.drafts = false;

    hexo.config.render_drafts = true;
    hexo._showDrafts().should.be.true;
    hexo.config.render_drafts = false;
  });

  it('draft visibility', function(){
    return Post.insert([
      {source: 'foo', slug: 'foo', published: true},
      {source: 'bar', slug: 'bar', published: false}
    ]).then(function(posts){
      hexo.locals.posts.toArray().should.eql(posts.slice(0, 1));

      // draft visible
      hexo.config.render_drafts = true;
      hexo.locals.posts.toArray().should.eql(posts);
      hexo.config.render_drafts = false;

      return posts;
    }).map(function(post){
      return Post.removeById(post._id);
    });
  });
});