import Hexo from '../../../lib/hexo';
import { current, home, home_first_page, post, page, archive, year, month, category, tag } from '../../../lib/plugins/helper/is';

describe('is', () => {
  const hexo = new Hexo(__dirname);

  it('is_current', async () => {
    await current.call({path: 'index.html', config: hexo.config}).should.be.true;
    await current.call({path: 'tags/index.html', config: hexo.config}).should.be.false;
    await current.call({path: 'index.html', config: hexo.config}, '/').should.be.true;
    await current.call({path: 'index.html', config: hexo.config}, 'index.html').should.be.true;
    await current.call({path: 'tags/index.html', config: hexo.config}, '/').should.be.false;
    await current.call({path: 'tags/index.html', config: hexo.config}, '/index.html').should.be.false;
    await current.call({path: 'index.html', config: hexo.config}, '/', true).should.be.true;
    await current.call({path: 'index.html', config: hexo.config}, '/index.html', true).should.be.true;
    await current.call({path: 'foo/bar', config: hexo.config}, 'foo', true).should.be.false;
    await current.call({path: 'foo/bar', config: hexo.config}, 'foo').should.be.true;
    await current.call({path: 'foo/bar', config: hexo.config}, 'foo/bar').should.be.true;
    await current.call({path: 'foo/bar', config: hexo.config}, 'foo/baz').should.be.false;
  });

  it('is_home', async () => {
    await home.call({page: {__index: true}}).should.be.true;
    await home.call({page: {}}).should.be.false;
  });

  it('is_home_first_page', async () => {
    await home_first_page.call({page: {__index: true, current: 1}}).should.be.true;
    await home_first_page.call({page: {__index: true, current: 2}}).should.be.false;
    await home_first_page.call({page: {__index: true}}).should.be.false;
    await home_first_page.call({page: {}}).should.be.false;
  });

  it('is_post', async () => {
    await post.call({page: {__post: true}}).should.be.true;
    await post.call({page: {}}).should.be.false;
  });

  it('is_page', async () => {
    await page.call({page: {__page: true}}).should.be.true;
    await page.call({page: {}}).should.be.false;
  });

  it('is_archive', async () => {
    await archive.call({page: {}}).should.be.false;
    await archive.call({page: {archive: true}}).should.be.true;
    await archive.call({page: {archive: false}}).should.be.false;
  });

  it('is_year', async () => {
    await year.call({page: {}}).should.be.false;
    await year.call({page: {archive: true}}).should.be.false;
    await year.call({page: {archive: true, year: 2014}}).should.be.true;
    await year.call({page: {archive: true, year: 2014}}, 2014).should.be.true;
    await year.call({page: {archive: true, year: 2014}}, 2015).should.be.false;
    await year.call({page: {archive: true, year: 2014, month: 10}}).should.be.true;
  });

  it('is_month', async () => {
    await month.call({page: {}}).should.be.false;
    await month.call({page: {archive: true}}).should.be.false;
    await month.call({page: {archive: true, year: 2014}}).should.be.false;
    await month.call({page: {archive: true, year: 2014, month: 10}}).should.be.true;
    await month.call({page: {archive: true, year: 2014, month: 10}}, 2014, 10).should.be.true;
    await month.call({page: {archive: true, year: 2014, month: 10}}, 2015, 10).should.be.false;
    await month.call({page: {archive: true, year: 2014, month: 10}}, 2014, 12).should.be.false;
    await month.call({page: {archive: true, year: 2014, month: 10}}, 10).should.be.true;
    await month.call({page: {archive: true, year: 2014, month: 10}}, 12).should.be.false;
  });

  it('is_category', async () => {
    await category.call({page: {category: 'foo'}}).should.be.true;
    await category.call({page: {category: 'foo'}}, 'foo').should.be.true;
    await category.call({page: {category: 'foo'}}, 'bar').should.be.false;
    await category.call({page: {}}).should.be.false;
  });

  it('is_tag', async () => {
    await tag.call({page: {tag: 'foo'}}).should.be.true;
    await tag.call({page: {tag: 'foo'}}, 'foo').should.be.true;
    await tag.call({page: {tag: 'foo'}}, 'bar').should.be.false;
    await tag.call({page: {}}).should.be.false;
  });
});
