'use strict';

describe('is', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(__dirname);
  const is = require('../../../dist/plugins/helper/is');

  it('is_current', async () => {
    await is.current.call({path: 'index.html', config: hexo.config}).should.be.true;
    await is.current.call({path: 'tags/index.html', config: hexo.config}).should.be.false;
    await is.current.call({path: 'index.html', config: hexo.config}, '/').should.be.true;
    await is.current.call({path: 'index.html', config: hexo.config}, 'index.html').should.be.true;
    await is.current.call({path: 'tags/index.html', config: hexo.config}, '/').should.be.false;
    await is.current.call({path: 'tags/index.html', config: hexo.config}, '/index.html').should.be.false;
    await is.current.call({path: 'index.html', config: hexo.config}, '/', true).should.be.true;
    await is.current.call({path: 'index.html', config: hexo.config}, '/index.html', true).should.be.true;
    await is.current.call({path: 'foo/bar', config: hexo.config}, 'foo', true).should.be.false;
    await is.current.call({path: 'foo/bar', config: hexo.config}, 'foo').should.be.true;
    await is.current.call({path: 'foo/bar', config: hexo.config}, 'foo/bar').should.be.true;
    await is.current.call({path: 'foo/bar', config: hexo.config}, 'foo/baz').should.be.false;
  });

  it('is_home', async () => {
    await is.home.call({page: {__index: true}}).should.be.true;
    await is.home.call({page: {}}).should.be.false;
  });

  it('is_home_first_page', async () => {
    await is.home_first_page.call({page: {__index: true, current: 1}}).should.be.true;
    await is.home_first_page.call({page: {__index: true, current: 2}}).should.be.false;
    await is.home_first_page.call({page: {__index: true}}).should.be.false;
    await is.home_first_page.call({page: {}}).should.be.false;
  });

  it('is_post', async () => {
    await is.post.call({page: {__post: true}}).should.be.true;
    await is.post.call({page: {}}).should.be.false;
  });

  it('is_page', async () => {
    await is.page.call({page: {__page: true}}).should.be.true;
    await is.page.call({page: {}}).should.be.false;
  });

  it('is_archive', async () => {
    await is.archive.call({page: {}}).should.be.false;
    await is.archive.call({page: {archive: true}}).should.be.true;
    await is.archive.call({page: {archive: false}}).should.be.false;
  });

  it('is_year', async () => {
    await is.year.call({page: {}}).should.be.false;
    await is.year.call({page: {archive: true}}).should.be.false;
    await is.year.call({page: {archive: true, year: 2014}}).should.be.true;
    await is.year.call({page: {archive: true, year: 2014}}, 2014).should.be.true;
    await is.year.call({page: {archive: true, year: 2014}}, 2015).should.be.false;
    await is.year.call({page: {archive: true, year: 2014, month: 10}}).should.be.true;
  });

  it('is_month', async () => {
    await is.month.call({page: {}}).should.be.false;
    await is.month.call({page: {archive: true}}).should.be.false;
    await is.month.call({page: {archive: true, year: 2014}}).should.be.false;
    await is.month.call({page: {archive: true, year: 2014, month: 10}}).should.be.true;
    await is.month.call({page: {archive: true, year: 2014, month: 10}}, 2014, 10).should.be.true;
    await is.month.call({page: {archive: true, year: 2014, month: 10}}, 2015, 10).should.be.false;
    await is.month.call({page: {archive: true, year: 2014, month: 10}}, 2014, 12).should.be.false;
    await is.month.call({page: {archive: true, year: 2014, month: 10}}, 10).should.be.true;
    await is.month.call({page: {archive: true, year: 2014, month: 10}}, 12).should.be.false;
  });

  it('is_category', async () => {
    await is.category.call({page: {category: 'foo'}}).should.be.true;
    await is.category.call({page: {category: 'foo'}}, 'foo').should.be.true;
    await is.category.call({page: {category: 'foo'}}, 'bar').should.be.false;
    await is.category.call({page: {}}).should.be.false;
  });

  it('is_tag', async () => {
    await is.tag.call({page: {tag: 'foo'}}).should.be.true;
    await is.tag.call({page: {tag: 'foo'}}, 'foo').should.be.true;
    await is.tag.call({page: {tag: 'foo'}}, 'bar').should.be.false;
    await is.tag.call({page: {}}).should.be.false;
  });
});
