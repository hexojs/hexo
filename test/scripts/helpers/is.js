'use strict';

describe('is', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(__dirname);
  const is = require('../../../lib/plugins/helper/is');

  it('is_current', async() => {
    await is.current.call({path: 'index.html', config: hexo.config}).should.eql(true);
    await is.current.call({path: 'tags/index.html', config: hexo.config}).should.eql(false);
    await is.current.call({path: 'index.html', config: hexo.config}, '/').should.eql(true);
    await is.current.call({path: 'index.html', config: hexo.config}, 'index.html').should.eql(true);
    await is.current.call({path: 'tags/index.html', config: hexo.config}, '/').should.eql(false);
    await is.current.call({path: 'tags/index.html', config: hexo.config}, '/index.html').should.eql(false);
    await is.current.call({path: 'index.html', config: hexo.config}, '/', true).should.eql(true);
    await is.current.call({path: 'index.html', config: hexo.config}, '/index.html', true).should.eql(true);
    await is.current.call({path: 'foo/bar', config: hexo.config}, 'foo', true).should.eql(false);
    await is.current.call({path: 'foo/bar', config: hexo.config}, 'foo').should.eql(true);
    await is.current.call({path: 'foo/bar', config: hexo.config}, 'foo/bar').should.eql(true);
    await is.current.call({path: 'foo/bar', config: hexo.config}, 'foo/baz').should.eql(false);
  });

  it('is_home', async() => {
    await is.home.call({page: {__index: true}}).should.eql(true);
    await is.home.call({page: {}}).should.eql(false);
  });

  it('is_post', async() => {
    await is.post.call({page: {__post: true}}).should.eql(true);
    await is.post.call({page: {}}).should.eql(false);
  });

  it('is_page', async() => {
    await is.page.call({page: {__page: true}}).should.eql(true);
    await is.page.call({page: {}}).should.eql(false);
  });

  it('is_archive', async() => {
    await is.archive.call({page: {}}).should.eql(false);
    await is.archive.call({page: {archive: true}}).should.eql(true);
    await is.archive.call({page: {archive: false}}).should.eql(false);
  });

  it('is_year', async() => {
    await is.year.call({page: {}}).should.eql(false);
    await is.year.call({page: {archive: true}}).should.eql(false);
    await is.year.call({page: {archive: true, year: 2014}}).should.eql(true);
    await is.year.call({page: {archive: true, year: 2014}}, 2014).should.eql(true);
    await is.year.call({page: {archive: true, year: 2014}}, 2015).should.eql(false);
    await is.year.call({page: {archive: true, year: 2014, month: 10}}).should.eql(true);
  });

  it('is_month', async() => {
    await is.month.call({page: {}}).should.eql(false);
    await is.month.call({page: {archive: true}}).should.eql(false);
    await is.month.call({page: {archive: true, year: 2014}}).should.eql(false);
    await is.month.call({page: {archive: true, year: 2014, month: 10}}).should.eql(true);
    await is.month.call({page: {archive: true, year: 2014, month: 10}}, 2014, 10).should.eql(true);
    await is.month.call({page: {archive: true, year: 2014, month: 10}}, 2015, 10).should.eql(false);
    await is.month.call({page: {archive: true, year: 2014, month: 10}}, 2014, 12).should.eql(false);
    await is.month.call({page: {archive: true, year: 2014, month: 10}}, 10).should.eql(true);
    await is.month.call({page: {archive: true, year: 2014, month: 10}}, 12).should.eql(false);
  });

  it('is_category', async() => {
    await is.category.call({page: {category: 'foo'}}).should.eql(true);
    await is.category.call({page: {category: 'foo'}}, 'foo').should.eql(true);
    await is.category.call({page: {category: 'foo'}}, 'bar').should.eql(false);
    await is.category.call({page: {}}).should.eql(false);
  });

  it('is_tag', async() => {
    await is.tag.call({page: {tag: 'foo'}}).should.eql(true);
    await is.tag.call({page: {tag: 'foo'}}, 'foo').should.eql(true);
    await is.tag.call({page: {tag: 'foo'}}, 'bar').should.eql(false);
    await is.tag.call({page: {}}).should.eql(false);
  });
});
