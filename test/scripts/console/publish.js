'use strict';

const { exists, mkdirs, readFile, rmdir, unlink } = require('hexo-fs');
const moment = require('moment');
const { join } = require('path');
const Promise = require('bluebird');
const { useFakeTimers } = require('sinon');

describe('publish', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(join(__dirname, 'publish_test'), {silent: true});
  const publish = require('../../../lib/plugins/console/publish').bind(hexo);
  const post = hexo.post;
  const now = Date.now();
  let clock;

  before(async () => {
    clock = useFakeTimers(now);

    await mkdirs(hexo.base_dir);
    await hexo.init();
    await hexo.scaffold.set('post', [
      '---',
      'title: {{ title }}',
      'date: {{ date }}',
      'tags:',
      '---'
    ].join('\n'));
    await hexo.scaffold.set('draft', [
      '---',
      'title: {{ title }}',
      'tags:',
      '---'
    ].join('\n'));
  });

  after(() => {
    clock.restore();
    return rmdir(hexo.base_dir);
  });

  beforeEach(() => post.create({
    title: 'Hello World',
    layout: 'draft'
  }));

  it('slug', async () => {
    const draftPath = join(hexo.source_dir, '_drafts', 'Hello-World.md');
    const path = join(hexo.source_dir, '_posts', 'Hello-World.md');
    const date = moment(now);

    const content = [
      '---',
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    await publish({
      _: ['Hello-World']
    });

    const exist = await exists(draftPath);
    const data = await readFile(path);

    exist.should.to.be.false;
    data.should.eql(content);

    await unlink(path);
  });

  it('layout', async () => {
    const path = join(hexo.source_dir, '_posts', 'Hello-World.md');
    const date = moment(now);

    const content = [
      '---',
      'layout: photo',
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    await publish({
      _: ['photo', 'Hello-World']
    });
    const data = await readFile(path);
    data.should.eql(content);

    await unlink(path);
  });

  it('rename if target existed', async () => {
    const path = join(hexo.source_dir, '_posts', 'Hello-World-1.md');

    await post.create({
      title: 'Hello World'
    });
    await publish({
      _: ['Hello-World']
    });

    const exist = await exists(path);
    exist.should.to.be.true;

    await Promise.all([
      unlink(path),
      unlink(join(hexo.source_dir, '_posts', 'Hello-World.md'))
    ]);
  });

  it('replace existing target', async () => {
    const path = join(hexo.source_dir, '_posts', 'Hello-World.md');

    await post.create({
      title: 'Hello World'
    });
    await publish({
      _: ['Hello-World'],
      replace: true
    });
    const exist = await exists(join(hexo.source_dir, '_posts', 'Hello-World-1.md'));
    exist.should.to.be.false;

    await unlink(path);
  });
});
