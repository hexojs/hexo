'use strict';

const fs = require('hexo-fs');
const moment = require('moment');
const pathFn = require('path');
const Promise = require('bluebird');
const sinon = require('sinon');

describe('new', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(pathFn.join(__dirname, 'new_test'), {silent: true});
  const n = require('../../../lib/plugins/console/new').bind(hexo);
  const post = hexo.post;
  const now = Date.now();
  let clock;

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
    const date = moment(now);
    const path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    const body = [
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
    const path = pathFn.join(hexo.source_dir, '_drafts', 'Hello-World.md');
    const body = [
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
    const date = moment(now);
    const path = pathFn.join(hexo.source_dir, '_posts', 'foo.md');
    const body = [
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

  it('slug - s', () => {
    const date = moment(now);
    const path = pathFn.join(hexo.source_dir, '_posts', 'foo.md');
    const body = [
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    return n({
      _: ['Hello World'],
      s: 'foo'
    }).then(() => fs.readFile(path)).then(content => {
      content.should.eql(body);
      return fs.unlink(path);
    });
  });

  it('path', () => {
    const date = moment(now);
    const path = pathFn.join(hexo.source_dir, '_posts', 'bar.md');
    const body = [
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

  it('path - p', () => {
    const date = moment(now);
    const path = pathFn.join(hexo.source_dir, '_posts', 'bar.md');
    const body = [
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    return n({
      _: ['Hello World'],
      slug: 'foo',
      p: 'bar'
    }).then(() => fs.readFile(path)).then(content => {
      content.should.eql(body);
      return fs.unlink(path);
    });
  });

  it('rename if target existed', () => {
    const path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World-1.md');

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
    const date = moment(now);
    const path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    const body = [
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    return post.create({
      title: 'Hello World'
    }).then(() => n({
      _: ['Hello World'],
      replace: true
    })).then(() => fs.exists(pathFn.join(hexo.source_dir, '_posts', 'Hello-World-1.md'))).then(exist => {
      exist.should.be.false;
    }).then(() => fs.readFile(path)).then(content => {
      content.should.eql(body);
    }).finally(() => fs.unlink(path));
  });

  it('replace existing files - r', () => {
    const date = moment(now);
    const path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    const body = [
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    return post.create({
      title: 'Hello World'
    }).then(() => n({
      _: ['Hello World'],
      r: true
    })).then(() => fs.exists(pathFn.join(hexo.source_dir, '_posts', 'Hello-World-1.md'))).then(exist => {
      exist.should.be.false;
    }).then(() => fs.readFile(path)).then(content => {
      content.should.eql(body);
    }).finally(() => fs.unlink(path));
  });

  it('extra data', () => {
    const date = moment(now);
    const path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    const body = [
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
