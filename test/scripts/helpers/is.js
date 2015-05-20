'use strict';

var should = require('chai').should();

describe('is', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var is = require('../../../lib/plugins/helper/is');

  it('is_current', function(){
    is.current.call({path: 'foo/bar', config: hexo.config}, 'foo').should.be.true;
    is.current.call({path: 'foo/bar', config: hexo.config}, 'foo/bar').should.be.true;
    is.current.call({path: 'foo/bar', config: hexo.config}, 'foo/baz').should.be.false;
  });

  it('is_home', function(){
    is.home.call({page: {__index: true}}).should.be.true;
    is.home.call({page: {}}).should.be.false;
  });

  it('is_post', function(){
    is.post.call({page: {__post: true}}).should.be.true;
    is.post.call({page: {}}).should.be.false;
  });

  it('is_page', function(){
    is.page.call({page: {__page: true}}).should.be.true;
    is.page.call({page: {}}).should.be.false;
  });

  it('is_archive', function(){
    is.archive.call({page: {}}).should.be.false;
    is.archive.call({page: {archive: true}}).should.be.true;
    is.archive.call({page: {archive: false}}).should.be.false;
  });

  it('is_year', function(){
    is.year.call({page: {}}).should.be.false;
    is.year.call({page: {archive: true}}).should.be.false;
    is.year.call({page: {archive: true, year: 2014}}).should.be.true;
    is.year.call({page: {archive: true, year: 2014}}, 2014).should.be.true;
    is.year.call({page: {archive: true, year: 2014}}, 2015).should.be.false;
    is.year.call({page: {archive: true, year: 2014, month: 10}}).should.be.true;
  });

  it('is_month', function(){
    is.month.call({page: {}}).should.be.false;
    is.month.call({page: {archive: true}}).should.be.false;
    is.month.call({page: {archive: true, year: 2014}}).should.be.false;
    is.month.call({page: {archive: true, year: 2014, month: 10}}).should.be.true;
    is.month.call({page: {archive: true, year: 2014, month: 10}}, 2014, 10).should.be.true;
    is.month.call({page: {archive: true, year: 2014, month: 10}}, 2015, 10).should.be.false;
    is.month.call({page: {archive: true, year: 2014, month: 10}}, 2014, 12).should.be.false;
    is.month.call({page: {archive: true, year: 2014, month: 10}}, 10).should.be.true;
    is.month.call({page: {archive: true, year: 2014, month: 10}}, 12).should.be.false;
  });

  it('is_category', function(){
    is.category.call({page: {category: 'foo'}}).should.be.true;
    is.category.call({page: {}}).should.be.false;
  });

  it('is_tag', function(){
    is.tag.call({page: {tag: 'foo'}}).should.be.true;
    is.tag.call({page: {}}).should.be.false;
  });
});
