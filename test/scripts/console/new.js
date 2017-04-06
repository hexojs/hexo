var should = require('chai').should(); // eslint-disable-line
var fs = require('hexo-fs');
var moment = require('moment');
var pathFn = require('path');
var Promise = require('bluebird');
var sinon = require('sinon');

describe('new', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'new_test'), {silent: true});
  var n = require('../../../lib/plugins/console/new').bind(hexo);
  var post = hexo.post;
  var now = Date.now();
  var clock;

  before(() => {
    clock = sinon.useFakeTimers(now);

    return fs.mkdirs(hexo.base_dir).then(() => hexo.init()).then(() => hexo.scaffold.set('post', [
      'title: {{ title }}',
      'date: {{ date }}',
      'tags:',
      '---'
    ].join('\n'))).then(() => hexo.scaffold.set('draft', [
      'title: {{ title }}',
      'tags:',
      '---'
    ].join('\n')));
  });

  after(() => {
    clock.restore();
    return fs.rmdir(hexo.base_dir);
  });

  it('title', () => {
    var date = moment(now);
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    var body = [
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    return n({
      _: ['Hello World']
    }).then(() => fs.readFile(path)).then(content => {
      content.should.eql(body);
      return fs.unlink(path);
    });
  });

  it('layout', () => {
    var path = pathFn.join(hexo.source_dir, '_drafts', 'Hello-World.md');
    var body = [
      'title: Hello World',
      'tags:',
      '---'
    ].join('\n') + '\n';

    return n({
      _: ['draft', 'Hello World']
    }).then(() => fs.readFile(path)).then(content => {
      content.should.eql(body);
      return fs.unlink(path);
    });
  });

  it('slug', () => {
    var date = moment(now);
    var path = pathFn.join(hexo.source_dir, '_posts', 'foo.md');
    var body = [
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    return n({
      _: ['Hello World'],
      slug: 'foo'
    }).then(() => fs.readFile(path)).then(content => {
      content.should.eql(body);
      return fs.unlink(path);
    });
  });

  it('path', () => {
    var date = moment(now);
    var path = pathFn.join(hexo.source_dir, '_posts', 'bar.md');
    var body = [
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    return n({
      _: ['Hello World'],
      slug: 'foo',
      path: 'bar'
    }).then(() => fs.readFile(path)).then(content => {
      content.should.eql(body);
      return fs.unlink(path);
    });
  });

  it('rename if target existed', () => {
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World-1.md');

    return post.create({
      title: 'Hello World'
    }).then(() => n({
      _: ['Hello World']
    })).then(() => fs.exists(path)).then(exist => {
      exist.should.be.true;

      return Promise.all([
        fs.unlink(path),
        fs.unlink(pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md'))
      ]);
    });
  });

  it('replace existing files', () => {
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');

    return post.create({
      title: 'Hello World'
    }).then(() => n({
      _: ['Hello World'],
      replace: true
    })).then(() => fs.exists(pathFn.join(hexo.source_dir, '_posts', 'Hello-World-1.md'))).then(exist => {
      exist.should.be.false;
      return fs.unlink(path);
    });
  });

  it('extra data', () => {
    var date = moment(now);
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    var body = [
      'title: Hello World',
      'foo: bar',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    return n({
      _: ['Hello World'],
      foo: 'bar'
    }).then(() => fs.readFile(path)).then(content => {
      content.should.eql(body);
      return fs.unlink(path);
    });
  });
});
