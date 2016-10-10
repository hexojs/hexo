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

  var listCategory = require('../../../lib/plugins/console/list/category').bind(hexo);

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
  it('no categories', function() {
    listCategory()
    expect( console.log.calledWith(sinon.match('Name')) ).to.be.true;
    expect( console.log.calledWith(sinon.match('Posts')) ).to.be.true;
    expect( console.log.calledWith(sinon.match('No categories.')) ).to.be.true;
  });
  it('categories', function() {
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
        return posts[i].setCategories(tags);
      });
    }).then(function() {
      hexo.locals.invalidate();
    })
    .then(function(){
      listCategory()
      expect( console.log.calledWith(sinon.match('Name')) ).to.be.true;
      expect( console.log.calledWith(sinon.match('Posts')) ).to.be.true;
      expect( console.log.calledWith(sinon.match('baz')) ).to.be.true;
      expect( console.log.calledWith(sinon.match('foo')) ).to.be.true;
    });
  });
});
