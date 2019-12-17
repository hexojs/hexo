'use strict';

const Promise = require('bluebird');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('Console list', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(__dirname);
  const Post = hexo.model('Post');

  const listTags = require('../../../lib/plugins/console/list/tag').bind(hexo);

  hexo.config.permalink = ':title/';
  before(() => {
    const log = console.log;
    sinon.stub(console, 'log').callsFake((...args) => {
      return log.apply(log, args);
    });
  });

  after(() => {
    console.log.restore();
  });

  it('no tags', () => {
    listTags();
    expect(console.log.calledWith(sinon.match('Name'))).be.true;
    expect(console.log.calledWith(sinon.match('Posts'))).be.true;
    expect(console.log.calledWith(sinon.match('Path'))).be.true;
    expect(console.log.calledWith(sinon.match('No tags.'))).be.true;
  });

  it('tags', async () => {
    const posts = [
      {source: 'foo', slug: 'foo', title: 'Its', date: 1e8},
      {source: 'bar', slug: 'bar', title: 'Math', date: 1e8 + 1},
      {source: 'baz', slug: 'baz', title: 'Dude', date: 1e8 - 1}
    ];

    await hexo.init();
    const output = await Post.insert(posts);
    await Promise.each([
      ['foo'],
      ['baz'],
      ['baz']
    ], (tags, i) => output[i].setTags(tags));
    await hexo.locals.invalidate();

    listTags();
    expect(console.log.calledWith(sinon.match('Name'))).to.be.true;
    expect(console.log.calledWith(sinon.match('Posts'))).to.be.true;
    expect(console.log.calledWith(sinon.match('Path'))).to.be.true;
    expect(console.log.calledWith(sinon.match('baz'))).to.be.true;
    expect(console.log.calledWith(sinon.match('foo'))).to.be.true;
    expect(console.log.calledWith(sinon.match('tags/baz'))).to.be.true;
    expect(console.log.calledWith(sinon.match('tags/foo'))).to.be.true;
  });
});
