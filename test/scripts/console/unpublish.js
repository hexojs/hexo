'use strict';

const { exists, mkdirs, readFile, rmdir, unlink } = require('hexo-fs');
const moment = require('moment');
const { join } = require('path');
const Promise = require('bluebird');
const { useFakeTimers, spy } = require('sinon');

describe('unpublish', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(join(__dirname, 'unpublish_test'), {silent: true});
  const unpublish = require('../../../lib/plugins/console/unpublish').bind(hexo);
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
    layout: 'post',
    date: moment(now).format('YYYY-MM-DD HH:mm:ss')
  }));

  it('slug', async () => {
    const postPath = join(hexo.source_dir, '_posts', 'Hello-World.md');
    const path = join(hexo.source_dir, '_drafts', 'Hello-World.md');

    const content = [
      '---',
      'title: Hello World',
      'tags:',
      '---'
    ].join('\n') + '\n';

    await unpublish({
      _: ['Hello-World']
    });

    const exist = await exists(postPath);
    const data = await readFile(path);

    exist.should.be.false;
    data.should.eql(content);

    await unlink(path);
  });

  it('no args', async () => {
    const hexo = new Hexo(join(__dirname, 'unpublish_test'), {silent: true});
    hexo.call = spy();
    const unpublish = require('../../../lib/plugins/console/unpublish').bind(hexo);

    await unpublish({_: []});

    hexo.call.calledOnce.should.be.true;
    hexo.call.args[0][0].should.eql('help');
    hexo.call.args[0][1]._[0].should.eql('unpublish');
  });

  it('layout', async () => {
    const path = join(hexo.source_dir, '_posts', 'Hello-World.md');
    const date = moment(now);

    const content = [
      '---',
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    await unpublish({
      _: ['photo', 'Hello-World']
    });
    const data = await readFile(path);
    data.should.eql(content);

    await unlink(path);
  });

  it('rename if target existed', async () => {
    const path = join(hexo.source_dir, '_posts', 'Hello-World.md');

    await post.create({
      title: 'Hello World'
    });
    await unpublish({
      _: ['Hello-World']
    });

    const exist = await exists(path);
    exist.should.be.true;

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
    await unpublish({
      _: ['Hello-World'],
      replace: true
    });
    const exist = await exists(join(hexo.source_dir, '_drafts', 'Hello-World-1.md'));
    exist.should.be.false;

    await unlink(path);
  });
});
