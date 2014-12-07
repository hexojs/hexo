var should = require('chai').should();
var pathFn = require('path');
var moment = require('moment');
var Promise = require('bluebird');
var util = require('../../../lib/util');
var fs = util.fs;

var NEW_POST_NAME = ':title.md';

describe('new_post_path', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var newPostPath = require('../../../lib/plugins/filter/new_post_path').bind(hexo);
  var sourceDir = hexo.source_dir;
  var draftDir = pathFn.join(sourceDir, '_drafts');
  var postDir = pathFn.join(sourceDir, '_posts');

  before(function(){
    hexo.config.new_post_name = NEW_POST_NAME;
    return hexo.init();
  });

  it('page layout + path', function(){
    return newPostPath({
      path: 'foo',
      layout: 'page'
    }).then(function(target){
      target.should.eql(pathFn.join(sourceDir, 'foo.md'));
    });
  });

  it('draft layout + path', function(){
    return newPostPath({
      path: 'foo',
      layout: 'draft'
    }).then(function(target){
      target.should.eql(pathFn.join(draftDir, 'foo.md'));
    });
  });

  it('default layout + path', function(){
    return newPostPath({
      path: 'foo'
    }).then(function(target){
      target.should.eql(pathFn.join(postDir, 'foo.md'));
    });
  });

  it('page layout + slug', function(){
    return newPostPath({
      slug: 'foo',
      layout: 'page'
    }).then(function(target){
      target.should.eql(pathFn.join(sourceDir, 'foo', 'index.md'));
    });
  });

  it('draft layout + slug', function(){
    return newPostPath({
      slug: 'foo',
      layout: 'draft'
    }).then(function(target){
      target.should.eql(pathFn.join(draftDir, 'foo.md'));
    })
  });

  it('default layout + slug', function(){
    var now = moment();
    hexo.config.new_post_name = ':year-:month-:day-:title.md';

    return newPostPath({
      slug: 'foo'
    }).then(function(target){
      target.should.eql(pathFn.join(postDir, now.format('YYYY-MM-DD') + '-foo.md'));
      hexo.config.new_post_name = NEW_POST_NAME;
    });
  });

  it('date', function(){
    var date = moment([2014, 0, 1]);
    hexo.config.new_post_name = ':year-:i_month-:i_day-:title.md';

    return newPostPath({
      slug: 'foo',
      date: date.toDate()
    }).then(function(target){
      target.should.eql(pathFn.join(postDir, date.format('YYYY-M-D') + '-foo.md'));
      hexo.config.new_post_name = NEW_POST_NAME;
    })
  });

  it('extra data', function(){
    hexo.config.new_post_name = ':foo-:bar-:title.md';

    return newPostPath({
      slug: 'foo',
      foo: 'oh',
      bar: 'ya'
    }).then(function(target){
      target.should.eql(pathFn.join(postDir, 'oh-ya-foo.md'));
      hexo.config.new_post_name = NEW_POST_NAME;
    });
  });

  it('append extension name if not existed', function(){
    hexo.config.new_post_name = ':title';

    return newPostPath({
      slug: 'foo'
    }).then(function(target){
      target.should.eql(pathFn.join(postDir, 'foo.md'));
      hexo.config.new_post_name = NEW_POST_NAME;
    });
  });

  it('don\'t append extension name if existed', function(){
    return newPostPath({
      path: 'foo.markdown'
    }).then(function(target){
      target.should.eql(pathFn.join(postDir, 'foo.markdown'));
    });
  });

  it('replace existing files', function(){
    var filename = 'test.md';
    var path = pathFn.join(postDir, filename);

    return fs.writeFile(path, '').then(function(){
      return newPostPath({
        path: filename
      }, true);
    }).then(function(target){
      target.should.eql(path);
      return fs.unlink(path);
    });
  });

  it('rename if target existed', function(){
    var filename = [
      'test.md',
      'test-1.md',
      'test-2.md',
      'test-foo.md'
    ];

    var path = filename.map(function(item){
      return pathFn.join(postDir, item);
    });

    return Promise.map(path, function(item){
      return fs.writeFile(item, '');
    }).then(function(){
      return newPostPath({
        path: filename[0]
      });
    }).then(function(target){
      target.should.eql(pathFn.join(postDir, 'test-3.md'));
      return path;
    }).map(function(item){
      return fs.unlink(item);
    });
  });

  it('data is required', function(){
    return newPostPath().catch(function(err){
      err.should.have.property('message', 'Either data.path or data.slug is required!');
    });
  });
});