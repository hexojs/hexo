'use strict';

const fs = require('hexo-fs');
const moment = require('moment');
const pathFn = require('path');
const Promise = require('bluebird');
const sinon = require('sinon');

describe('publish', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(pathFn.join(__dirname, 'publish_test'), {
    silent: true
  });
  const publish = require('../../../lib/plugins/console/publish').bind(hexo);
  const post = hexo.post;
  const now = Date.now();
  let clock;

  before(() => {
    clock = sinon.useFakeTimers(now);

    return fs
      .mkdirs(hexo.base_dir)
      .then(() => hexo.init())
      .then(() =>
        hexo.scaffold.set(
          'post',
          [
            '---',
            'title: {{ title }}',
            'date: {{ date }}',
            'tags:',
            '---'
          ].join('\n')
        )
      )
      .then(() =>
        hexo.scaffold.set(
          'draft',
          ['---', 'title: {{ title }}', 'tags:', '---'].join('\n')
        )
      );
  });

  after(() => {
    clock.restore();
    return fs.rmdir(hexo.base_dir);
  });

  beforeEach(() =>
    post.create({
      title: 'Hello World',
      layout: 'draft'
    })
  );

  it('slug', () => {
    const draftPath = pathFn.join(hexo.source_dir, '_drafts', 'Hello-World.md');
    const path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    const date = moment(now);

    const content =
      [
        '---',
        'title: Hello World',
        'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
        'tags:',
        '---'
      ].join('\n') + '\n';

    return publish({
      _: ['Hello-World']
    })
      .then(() => Promise.all([fs.exists(draftPath), fs.readFile(path)]))
      .spread((exist, data) => {
        exist.should.be.false;
        data.should.eql(content);

        return fs.unlink(path);
      });
  });

  it('layout', () => {
    const path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    const date = moment(now);

    const content =
      [
        '---',
        'layout: photo',
        'title: Hello World',
        'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
        'tags:',
        '---'
      ].join('\n') + '\n';

    return publish({
      _: ['photo', 'Hello-World']
    })
      .then(() => fs.readFile(path))
      .then(data => {
        data.should.eql(content);
        return fs.unlink(path);
      });
  });

  it('rename if target existed', () => {
    const path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World-1.md');

    return post
      .create({
        title: 'Hello World'
      })
      .then(() =>
        publish({
          _: ['Hello-World']
        })
      )
      .then(() => fs.exists(path))
      .then(exist => {
        exist.should.be.true;

        return Promise.all([
          fs.unlink(path),
          fs.unlink(pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md'))
        ]);
      });
  });

  it('replace existing target', () => {
    const path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');

    return post
      .create({
        title: 'Hello World'
      })
      .then(() =>
        publish({
          _: ['Hello-World'],
          replace: true
        })
      )
      .then(() =>
        fs.exists(pathFn.join(hexo.source_dir, '_posts', 'Hello-World-1.md'))
      )
      .then(exist => {
        exist.should.be.false;

        return fs.unlink(path);
      });
  });
});
