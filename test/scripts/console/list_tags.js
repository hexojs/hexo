'use strict';

const Promise = require('bluebird');
const { stub, match } = require('sinon');
const { expect } = require('chai');

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
    expect(logStub.calledWith(match('Name'))).be.true;
    expect(logStub.calledWith(match('Posts'))).be.true;
    expect(logStub.calledWith(match('Path'))).be.true;
    expect(logStub.calledWith(match('No tags.'))).be.true;
  });

  it('tags', () => {
    const posts = [
      {source: 'foo', slug: 'foo', title: 'Its', date: 1e8},
      {source: 'bar', slug: 'bar', title: 'Math', date: 1e8 + 1},
      {source: 'baz', slug: 'baz', title: 'Dude', date: 1e8 - 1}
    ];
    return hexo.init()
      .then(() => Post.insert(posts)).then(posts => Promise.each([
        ['foo'],
        ['baz'],
        ['baz']
      ], (tags, i) => posts[i].setTags(tags))).then(() => {
        hexo.locals.invalidate();
      })
      .then(() => {
        listTags();
        expect(logStub.calledWith(match('Name'))).be.true;
        expect(logStub.calledWith(match('Posts'))).be.true;
        expect(logStub.calledWith(match('Path'))).be.true;
        expect(logStub.calledWith(match('baz'))).be.true;
        expect(logStub.calledWith(match('foo'))).be.true;
        expect(logStub.calledWith(match('tags/baz'))).be.true;
        expect(logStub.calledWith(match('tags/foo'))).be.true;
      });
  });
});
