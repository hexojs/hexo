'use strict';

var should = require('chai').should();
var fs = require('hexo-fs');
var moment = require('moment');
var pathFn = require('path');
var Promise = require('bluebird');
var sinon = require('sinon');

describe('publish', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'publish_test'), {silent: true});
  var publish = require('../../../lib/plugins/console/publish').bind(hexo);
  var post = hexo.post;
  var now = Date.now();
  var clock;

  before(function(){
    clock = sinon.useFakeTimers(now);

    return fs.mkdirs(hexo.base_dir).then(function(){
      return hexo.init();
    }).then(function(){
      return hexo.scaffold.set('post', [
        'title: {{ title }}',
        'date: {{ date }}',
        'tags:',
        '---'
      ].join('\n'));
    }).then(function(){
      return hexo.scaffold.set('draft', [
        'title: {{ title }}',
        'tags:',
        '---'
      ].join('\n'));
    });
  });

  after(function(){
    clock.restore();
    return fs.rmdir(hexo.base_dir);
  });

  beforeEach(function(){
    return post.create({
      title: 'Hello World',
      layout: 'draft'
    });
  });

  it('slug', function(){
    var draftPath = pathFn.join(hexo.source_dir, '_drafts', 'Hello-World.md');
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    var date = moment(now);

    var content = [
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    return publish({
      _: ['Hello-World']
    }).then(function(){
      return Promise.all([
        fs.exists(draftPath),
        fs.readFile(path)
      ]);
    }).spread(function(exist, data){
      exist.should.be.false;
      data.should.eql(content);

      return fs.unlink(path);
    });
  });

  it('layout', function(){
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    var date = moment(now);

    var content = [
      'layout: photo',
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    return publish({
      _: ['photo', 'Hello-World']
    }).then(function(){
      return fs.readFile(path);
    }).then(function(data){
      data.should.eql(content);
      return fs.unlink(path);
    })
  });

  it('rename if target existed', function(){
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World-1.md');

    return post.create({
      title: 'Hello World'
    }).then(function(){
      return publish({
        _: ['Hello-World']
      });
    }).then(function(){
      return fs.exists(path);
    }).then(function(exist){
      exist.should.be.true;

      return Promise.all([
        fs.unlink(path),
        fs.unlink(pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md'))
      ]);
    });
  });

  it('replace existing target', function(){
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');

    return post.create({
      title: 'Hello World'
    }).then(function(){
      return publish({
        _: ['Hello-World'],
        replace: true
      });
    }).then(function(){
      return fs.exists(pathFn.join(hexo.source_dir, '_posts', 'Hello-World-1.md'));
    }).then(function(exist){
      exist.should.be.false;

      return fs.unlink(path);
    });
  });
});