'use strict';

const Promise = require('bluebird');
const { stub } = require('sinon');

describe('Console list', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(__dirname);
  const Post = hexo.model('Post');

  const listTags = require('../../../lib/plugins/console/list/tag').bind(hexo);

  hexo.config.permalink = ':title/';

  let logStub;

  before(() => { logStub = stub(console, 'log'); });

  afterEach(() => { logStub.reset(); });

  after(() => { logStub.restore(); });

  it('no tags', () => {
    listTags();
    logStub.calledWithMatch('Name').should.be.true;
    logStub.calledWithMatch('Posts').should.be.true;
    logStub.calledWithMatch('Path').should.be.true;
    logStub.calledWithMatch('No tags.').should.be.true;
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
    logStub.calledWithMatch('Name').should.be.true;
    logStub.calledWithMatch('Posts').should.be.true;
    logStub.calledWithMatch('Path').should.be.true;
    logStub.calledWithMatch('baz').should.be.true;
    logStub.calledWithMatch('foo').should.be.true;
    logStub.calledWithMatch('tags/baz').should.be.true;
    logStub.calledWithMatch('tags/foo').should.be.true;
  });
});
