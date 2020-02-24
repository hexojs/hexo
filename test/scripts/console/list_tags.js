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
        expect(console.log.calledWith(sinon.match('Name'))).be.true;
        expect(console.log.calledWith(sinon.match('Posts'))).be.true;
        expect(console.log.calledWith(sinon.match('Path'))).be.true;
        expect(console.log.calledWith(sinon.match('baz'))).be.true;
        expect(console.log.calledWith(sinon.match('foo'))).be.true;
        expect(console.log.calledWith(sinon.match('tags/baz'))).be.true;
        expect(console.log.calledWith(sinon.match('tags/foo'))).be.true;
      });
  });
});
