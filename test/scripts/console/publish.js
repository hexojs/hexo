var should = require('chai').should(); // eslint-disable-line
var fs = require('hexo-fs');
var moment = require('moment');
var pathFn = require('path');
var Promise = require('bluebird');
var sinon = require('sinon');

describe('publish', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'publish_test'), {silent: true});
  var publish = require('../../../lib/plugins/console/publish').bind(hexo);
  var post = hexo.post;
  var now = Date.now();
  var clock;

  before(() => {
    clock = sinon.useFakeTimers(now);

    return fs.mkdirs(hexo.base_dir).then(() => hexo.init()).then(() => hexo.scaffold.set('post', [
      '---',
      'title: {{ title }}',
      'date: {{ date }}',
      'tags:',
      '---'
    ].join('\n'))).then(() => hexo.scaffold.set('draft', [
      '---',
      'title: {{ title }}',
      'tags:',
      '---'
    ].join('\n')));
  });

  after(() => {
    clock.restore();
    return fs.rmdir(hexo.base_dir);
  });

  beforeEach(() => post.create({
    title: 'Hello World',
    layout: 'draft'
  }));

  it('slug', () => {
    var draftPath = pathFn.join(hexo.source_dir, '_drafts', 'Hello-World.md');
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    var date = moment(now);

    var content = [
      '---',
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    return publish({
      _: ['Hello-World']
    }).then(() => Promise.all([
      fs.exists(draftPath),
      fs.readFile(path)
    ])).spread((exist, data) => {
      exist.should.be.false;
      data.should.eql(content);

      return fs.unlink(path);
    });
  });

  it('layout', () => {
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    var date = moment(now);

    var content = [
      '---',
      'layout: photo',
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    return publish({
      _: ['photo', 'Hello-World']
    }).then(() => fs.readFile(path)).then(data => {
      data.should.eql(content);
      return fs.unlink(path);
    });
  });

  it('rename if target existed', () => {
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World-1.md');

    return post.create({
      title: 'Hello World'
    }).then(() => publish({
      _: ['Hello-World']
    })).then(() => fs.exists(path)).then(exist => {
      exist.should.be.true;

      return Promise.all([
        fs.unlink(path),
        fs.unlink(pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md'))
      ]);
    });
  });

  it('replace existing target', () => {
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');

    return post.create({
      title: 'Hello World'
    }).then(() => publish({
      _: ['Hello-World'],
      replace: true
    })).then(() => fs.exists(pathFn.join(hexo.source_dir, '_posts', 'Hello-World-1.md'))).then(exist => {
      exist.should.be.false;

      return fs.unlink(path);
    });
  });
});
