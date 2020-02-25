'use strict';

const Promise = require('bluebird');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('Console list', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(__dirname);
  const Post = hexo.model('Post');

  const listCategories = require('../../../lib/plugins/console/list/category').bind(hexo);

  let stub;

  before(() => { stub = sinon.stub(console, 'log'); });

  afterEach(() => { stub.reset(); });

  after(() => { stub.restore(); });

  it('no categories', () => {
    listCategories();
    expect(stub.calledWith(sinon.match('Name'))).be.true;
    expect(stub.calledWith(sinon.match('Posts'))).be.true;
    expect(stub.calledWith(sinon.match('No categories.'))).be.true;
  });

  it('categories', () => {
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
      ], (tags, i) => posts[i].setCategories(tags))).then(() => {
        hexo.locals.invalidate();
      }).then(() => {
        listCategories();
        expect(stub.calledWith(sinon.match('Name'))).be.true;
        expect(stub.calledWith(sinon.match('Posts'))).be.true;
        expect(stub.calledWith(sinon.match('baz'))).be.true;
        expect(stub.calledWith(sinon.match('foo'))).be.true;
      });
  });
});
