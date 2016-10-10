'use strict';

var should = require('chai').should(); // eslint-disable-line
var fs = require('hexo-fs');
var moment = require('moment');
var pathFn = require('path');
var Promise = require('bluebird');
var sinon = require('sinon');
var expect = require('chai').expect;


describe('Console list', function() {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var Post = hexo.model('Post');

  var listTags = require('../../../lib/plugins/console/list/tag').bind(hexo);

  hexo.config.permalink = ':title/';
  before(function() {
    var log = console.log;
    sinon.stub(console, 'log', function() {
      return log.apply(log, arguments);
    });
  });
  after(function() {
    console.log.restore();
  });
  it('no tags', function() {
    listTags()
    expect( console.log.calledWith(sinon.match('Name')) ).to.be.true;
    expect( console.log.calledWith(sinon.match('Posts')) ).to.be.true;
    expect( console.log.calledWith(sinon.match('Path')) ).to.be.true;
    expect( console.log.calledWith(sinon.match('No tags.')) ).to.be.true;
  });
  it('tags', function() {
    var posts = [
      {source: 'foo', slug: 'foo', title: 'Its', date: 1e8},
      {source: 'bar', slug: 'bar', title: 'Math', date: 1e8 + 1},
      {source: 'baz', slug: 'baz', title: 'Dude', date: 1e8 - 1}
    ]
    return hexo.init()
    .then(function() {
      return Post.insert(posts);
    }).then(function(posts) {
      return Promise.each([
        ['foo'],
        ['baz'],
        ['baz']
      ], function(tags, i) {
        return posts[i].setTags(tags);
      });
    }).then(function() {
      hexo.locals.invalidate();
    })
    .then(function(){
      listTags()
      expect( console.log.calledWith(sinon.match('Name')) ).to.be.true;
      expect( console.log.calledWith(sinon.match('Posts')) ).to.be.true;
      expect( console.log.calledWith(sinon.match('Path')) ).to.be.true;
      expect( console.log.calledWith(sinon.match('baz')) ).to.be.true;
      expect( console.log.calledWith(sinon.match('foo')) ).to.be.true;
      expect( console.log.calledWith(sinon.match('tags/baz')) ).to.be.true;
      expect( console.log.calledWith(sinon.match('tags/foo')) ).to.be.true;
    });
  });
});
