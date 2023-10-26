'use strict';

const { join } = require('path');
const { deepMerge, full_url_for } = require('hexo-util');

describe('Page', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo();
  const Page = hexo.model('Page');
  const defaults = require('../../../dist/hexo/default_config');

  beforeEach(() => { hexo.config = deepMerge({}, defaults); });

  it('default values', async () => {
    const now = Date.now();

    const data = await Page.insert({
      source: 'foo',
      path: 'bar'
    });

    data.title.should.eql('');
    data.date.valueOf().should.gte(now);
    data.comments.should.be.true;
    data.layout.should.eql('page');
    data._content.should.eql('');
    data.raw.should.eql('');
    should.not.exist(data.updated);
    should.not.exist(data.content);
    should.not.exist(data.excerpt);
    should.not.exist(data.more);

    Page.removeById(data._id);
  });

  it('source - required', async () => {
    try {
      await Page.insert({});
    } catch (err) {
      err.message.should.eql('`source` is required!');
    }
  });

  it('path - required', async () => {
    try {
      await Page.insert({
        source: 'foo'
      });
    } catch (err) {
      err.message.should.eql('`path` is required!');
    }
  });

  it('permalink - virtual', async () => {
    const data = await Page.insert({
      source: 'foo',
      path: 'bar'
    });
    data.permalink.should.eql(hexo.config.url + '/' + data.path);

    Page.removeById(data._id);
  });

  it('permalink - trailing_index', async () => {
    hexo.config.pretty_urls.trailing_index = false;
    const data = await Page.insert({
      source: 'foo.md',
      path: 'bar/index.html'
    });
    data.permalink.should.eql(hexo.config.url + '/' + data.path.replace(/index\.html$/, ''));

    Page.removeById(data._id);
  });

  it('permalink - trailing_html', async () => {
    hexo.config.pretty_urls.trailing_html = false;
    const data = await Page.insert({
      source: 'foo.md',
      path: 'bar/foo.html'
    });
    data.permalink.should.eql(hexo.config.url + '/' + data.path.replace(/\.html$/, ''));

    Page.removeById(data._id);
  });

  it('permalink - trailing_html - index.html', async () => {
    hexo.config.pretty_urls.trailing_html = false;

    const data = await Page.insert({
      source: 'foo.md',
      path: 'bar/foo/index.html'
    });
    data.permalink.should.eql(hexo.config.url + '/' + data.path);

    Page.removeById(data._id);
  });

  it('permalink - should be encoded', async () => {
    hexo.config.url = 'http://fôo.com';
    const path = 'bár';
    const data = await Page.insert({
      source: 'foo',
      path
    });
    data.permalink.should.eql(full_url_for.call(hexo, data.path));

    Page.removeById(data._id);
  });

  it('full_source - virtual', async () => {
    const data = await Page.insert({
      source: 'foo',
      path: 'bar'
    });
    data.full_source.should.eql(join(hexo.source_dir, data.source));

    Page.removeById(data._id);
  });
});
