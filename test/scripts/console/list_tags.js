'use strict';

const Promise = require('bluebird');
const { stub, assert: sinonAssert } = require('sinon');

describe('Console list', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(__dirname);
  const Post = hexo.model('Post');

  const listTags = require('../../../dist/plugins/console/list/tag').bind(hexo);

  hexo.config.permalink = ':title/';

  let logStub;

  before(() => { logStub = stub(console, 'log'); });

  afterEach(() => { logStub.reset(); });

  after(() => { logStub.restore(); });

  it('no tags', () => {
    listTags();
    sinonAssert.calledWithMatch(logStub, 'Name');
    sinonAssert.calledWithMatch(logStub, 'Posts');
    sinonAssert.calledWithMatch(logStub, 'Path');
    sinonAssert.calledWithMatch(logStub, 'No tags.');
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
    sinonAssert.calledWithMatch(logStub, 'Name');
    sinonAssert.calledWithMatch(logStub, 'Posts');
    sinonAssert.calledWithMatch(logStub, 'Path');
    sinonAssert.calledWithMatch(logStub, 'baz');
    sinonAssert.calledWithMatch(logStub, 'foo');
    sinonAssert.calledWithMatch(logStub, 'tags/baz');
    sinonAssert.calledWithMatch(logStub, 'tags/foo');
  });
});
