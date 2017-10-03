var should = require('chai').should(); // eslint-disable-line

describe('is', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var is = require('../../../lib/plugins/helper/is');

  it('is_current', () => {
    is.current.call({path: 'index.html', config: hexo.config}).should.be.true;
    is.current.call({path: 'tags/index.html', config: hexo.config}).should.be.false;
    is.current.call({path: 'index.html', config: hexo.config}, '/').should.be.true;
    is.current.call({path: 'index.html', config: hexo.config}, 'index.html').should.be.true;
    is.current.call({path: 'tags/index.html', config: hexo.config}, '/').should.be.false;
    is.current.call({path: 'tags/index.html', config: hexo.config}, '/index.html').should.be.false;
    is.current.call({path: 'index.html', config: hexo.config}, '/', true).should.be.true;
    is.current.call({path: 'index.html', config: hexo.config}, '/index.html', true).should.be.true;
    is.current.call({path: 'foo/bar', config: hexo.config}, 'foo', true).should.be.false;
    is.current.call({path: 'foo/bar', config: hexo.config}, 'foo').should.be.true;
    is.current.call({path: 'foo/bar', config: hexo.config}, 'foo/bar').should.be.true;
    is.current.call({path: 'foo/bar', config: hexo.config}, 'foo/baz').should.be.false;
  });

  it('is_home', () => {
    is.home.call({page: {__index: true}}).should.be.true;
    is.home.call({page: {}}).should.be.false;
  });

  it('is_post', () => {
    is.post.call({page: {__post: true}}).should.be.true;
    is.post.call({page: {}}).should.be.false;
  });

  it('is_page', () => {
    is.page.call({page: {__page: true}}).should.be.true;
    is.page.call({page: {}}).should.be.false;
  });

  it('is_archive', () => {
    is.archive.call({page: {}}).should.be.false;
    is.archive.call({page: {archive: true}}).should.be.true;
    is.archive.call({page: {archive: false}}).should.be.false;
  });

  it('is_year', () => {
    is.year.call({page: {}}).should.be.false;
    is.year.call({page: {archive: true}}).should.be.false;
    is.year.call({page: {archive: true, year: 2014}}).should.be.true;
    is.year.call({page: {archive: true, year: 2014}}, 2014).should.be.true;
    is.year.call({page: {archive: true, year: 2014}}, 2015).should.be.false;
    is.year.call({page: {archive: true, year: 2014, month: 10}}).should.be.true;
  });

  it('is_month', () => {
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

  it('is_category', () => {
    is.category.call({page: {category: 'foo'}}).should.be.true;
    is.category.call({page: {category: 'foo'}}, 'foo').should.be.true;
    is.category.call({page: {category: 'foo'}}, 'bar').should.be.false;
    is.category.call({page: {}}).should.be.false;
  });

  it('is_tag', () => {
    is.tag.call({page: {tag: 'foo'}}).should.be.true;
    is.tag.call({page: {tag: 'foo'}}, 'foo').should.be.true;
    is.tag.call({page: {tag: 'foo'}}, 'bar').should.be.false;
    is.tag.call({page: {}}).should.be.false;
  });
});
