'use strict';

var should = require('chai').should();
var fs = require('hexo-fs');
var moment = require('moment');
var pathFn = require('path');
var Promise = require('bluebird');
var sinon = require('sinon');

describe('new', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'new_test'), {silent: true});
  var n = require('../../../lib/plugins/console/new').bind(hexo);
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

  it('title', function(){
    var date = moment(now);
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    var body = [
      'title: "Hello World"',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    return n({
      _: ['Hello World']
    }).then(function(){
      return fs.readFile(path);
    }).then(function(content){
      content.should.eql(body);
      return fs.unlink(path);
    });
  });

  it('layout', function(){
    var path = pathFn.join(hexo.source_dir, '_drafts', 'Hello-World.md');
    var body = [
      'title: "Hello World"',
      'tags:',
      '---',
    ].join('\n') + '\n';

    return n({
      _: ['draft', 'Hello World']
    }).then(function(){
      return fs.readFile(path);
    }).then(function(content){
      content.should.eql(body);
      return fs.unlink(path);
    });
  });

  it('slug', function(){
    var date = moment(now);
    var path = pathFn.join(hexo.source_dir, '_posts', 'foo.md');
    var body = [
      'title: "Hello World"',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    return n({
      _: ['Hello World'],
      slug: 'foo'
    }).then(function(){
      return fs.readFile(path);
    }).then(function(content){
      content.should.eql(body);
      return fs.unlink(path);
    });
  });

  it('path', function(){
    var date = moment(now);
    var path = pathFn.join(hexo.source_dir, '_posts', 'bar.md');
    var body = [
      'title: "Hello World"',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    return n({
      _: ['Hello World'],
      slug: 'foo',
      path: 'bar'
    }).then(function(){
      return fs.readFile(path);
    }).then(function(content){
      content.should.eql(body);
      return fs.unlink(path);
    });
  });

  it('rename if target existed', function(){
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World-1.md');

    return post.create({
      title: 'Hello World'
    }).then(function(){
      return n({
        _: ['Hello World']
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

  it('replace existing files', function(){
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');

    return post.create({
      title: 'Hello World'
    }).then(function(){
      return n({
        _: ['Hello World'],
        replace: true
      });
    }).then(function(){
      return fs.exists(pathFn.join(hexo.source_dir, '_posts', 'Hello-World-1.md'));
    }).then(function(exist){
      exist.should.be.false;
      return fs.unlink(path);
    });
  });

  it('extra data', function(){
    var date = moment(now);
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    var body = [
      'title: "Hello World"',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      'foo: bar',
      '---'
    ].join('\n') + '\n';

    return n({
      _: ['Hello World'],
      foo: 'bar'
    }).then(function(){
      return fs.readFile(path);
    }).then(function(content){
      content.should.eql(body);
      return fs.unlink(path);
    });
  });
});