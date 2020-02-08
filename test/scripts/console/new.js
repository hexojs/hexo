'use strict';

const { exists, mkdirs, readFile, rmdir, unlink } = require('hexo-fs');
const moment = require('moment');
const { join } = require('path');
const Promise = require('bluebird');
const { useFakeTimers } = require('sinon');

describe('new', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(join(__dirname, 'new_test'), {silent: true});
  const n = require('../../../lib/plugins/console/new').bind(hexo);
  const post = hexo.post;
  const now = Date.now();
  let clock;

  before(async () => {
    clock = useFakeTimers(now);

    await mkdirs(hexo.base_dir);
    await hexo.init();
    await Promise.all([
      hexo.scaffold.set('post', [
        'title: {{ title }}',
        'date: {{ date }}',
        'tags:',
        '---'
      ].join('\n')),
      hexo.scaffold.set('draft', [
        'title: {{ title }}',
        'tags:',
        '---'
      ].join('\n'))
    ]);
  });

  after(() => {
    clock.restore();
    return rmdir(hexo.base_dir);
  });

  it('title', async () => {
    const date = moment(now);
    const path = join(hexo.source_dir, '_posts', 'Hello-World.md');
    const body = [
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    await n({
      _: ['Hello World']
    });
    const content = await readFile(path);
    content.should.eql(body);

    await unlink(path);
  });

  it('layout', async () => {
    const path = join(hexo.source_dir, '_drafts', 'Hello-World.md');
    const body = [
      'title: Hello World',
      'tags:',
      '---'
    ].join('\n') + '\n';

    await n({
      _: ['draft', 'Hello World']
    });
    const content = await readFile(path);
    content.should.eql(body);

    await unlink(path);
  });

  it('slug', async () => {
    const date = moment(now);
    const path = join(hexo.source_dir, '_posts', 'foo.md');
    const body = [
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    await n({
      _: ['Hello World'],
      slug: 'foo'
    });
    const content = await readFile(path);
    content.should.eql(body);

    await unlink(path);
  });

  it('slug - s', async () => {
    const date = moment(now);
    const path = join(hexo.source_dir, '_posts', 'foo.md');
    const body = [
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    await n({
      _: ['Hello World'],
      s: 'foo'
    });
    const content = await readFile(path);
    content.should.eql(body);

    await unlink(path);
  });

  it('path', async () => {
    const date = moment(now);
    const path = join(hexo.source_dir, '_posts', 'bar.md');
    const body = [
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    await n({
      _: ['Hello World'],
      slug: 'foo',
      path: 'bar'
    });
    const content = await readFile(path);
    content.should.eql(body);

    await unlink(path);
  });

  it('path - p', async () => {
    const date = moment(now);
    const path = join(hexo.source_dir, '_posts', 'bar.md');
    const body = [
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    await n({
      _: ['Hello World'],
      slug: 'foo',
      p: 'bar'
    });
    const content = await readFile(path);
    content.should.eql(body);

    await unlink(path);
  });

  it('rename if target existed', async () => {
    const path = join(hexo.source_dir, '_posts', 'Hello-World-1.md');

    await post.create({
      title: 'Hello World'
    });
    await n({
      _: ['Hello World']
    });
    const exist = await exists(path);
    exist.should.to.be.true;

    await Promise.all([
      unlink(path),
      unlink(join(hexo.source_dir, '_posts', 'Hello-World.md'))
    ]);
  });

  it('replace existing files', async () => {
    const date = moment(now);
    const path = join(hexo.source_dir, '_posts', 'Hello-World.md');
    const body = [
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    await post.create({
      title: 'Hello World'
    });
    await n({
      _: ['Hello World'],
      replace: true
    });
    const exist = await exists(join(hexo.source_dir, '_posts', 'Hello-World-1.md'));
    exist.should.to.be.false;

    const content = await readFile(path);
    content.should.eql(body);

    await unlink(path);
  });

  it('replace existing files - r', async () => {
    const date = moment(now);
    const path = join(hexo.source_dir, '_posts', 'Hello-World.md');
    const body = [
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    await post.create({
      title: 'Hello World'
    });
    await n({
      _: ['Hello World'],
      r: true
    });
    const exist = await exists(join(hexo.source_dir, '_posts', 'Hello-World-1.md'));
    exist.should.to.be.false;

    const content = await readFile(path);
    content.should.eql(body);

    await unlink(path);
  });

  it('extra data', async () => {
    const date = moment(now);
    const path = join(hexo.source_dir, '_posts', 'Hello-World.md');
    const body = [
      'title: Hello World',
      'foo: bar',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    await n({
      _: ['Hello World'],
      foo: 'bar'
    });
    const content = await readFile(path);
    content.should.eql(body);

    await unlink(path);
  });
});
