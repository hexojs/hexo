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

  let stub;

  before(() => { stub = sinon.stub(console, 'log'); });

  afterEach(() => { stub.reset(); });

  after(() => { stub.restore(); });

  it('no tags', () => {
    listTags();
    expect(stub.calledWith(sinon.match('Name'))).be.true;
    expect(stub.calledWith(sinon.match('Posts'))).be.true;
    expect(stub.calledWith(sinon.match('Path'))).be.true;
    expect(stub.calledWith(sinon.match('No tags.'))).be.true;
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
        expect(stub.calledWith(sinon.match('Name'))).be.true;
        expect(stub.calledWith(sinon.match('Posts'))).be.true;
        expect(stub.calledWith(sinon.match('Path'))).be.true;
        expect(stub.calledWith(sinon.match('baz'))).be.true;
        expect(stub.calledWith(sinon.match('foo'))).be.true;
        expect(stub.calledWith(sinon.match('tags/baz'))).be.true;
        expect(stub.calledWith(sinon.match('tags/foo'))).be.true;
      });
  });
});
