'use strict';

describe('search_form', () => {
  const searchForm = require('../../../dist/plugins/helper/search_form').bind({
    config: {url: 'https://hexo.io'}
  });

  it('default', () => {
    searchForm().should.eql('<form action="//google.com/search" method="get" accept-charset="UTF-8" class="search-form">'
      + '<input type="search" name="q" class="search-form-input" placeholder="Search">'
      + '<input type="hidden" name="sitesearch" value="https://hexo.io">'
      + '</form>');
  });

  it('class', () => {
    searchForm({class: 'foo'}).should.eql('<form action="//google.com/search" method="get" accept-charset="UTF-8" class="foo">'
      + '<input type="search" name="q" class="foo-input" placeholder="Search">'
      + '<input type="hidden" name="sitesearch" value="https://hexo.io">'
      + '</form>');
  });

  it('text', () => {
    searchForm({text: 'Find'}).should.eql('<form action="//google.com/search" method="get" accept-charset="UTF-8" class="search-form">'
      + '<input type="search" name="q" class="search-form-input" placeholder="Find">'
      + '<input type="hidden" name="sitesearch" value="https://hexo.io">'
      + '</form>');
  });

  it('text - null', () => {
    searchForm({text: null}).should.eql('<form action="//google.com/search" method="get" accept-charset="UTF-8" class="search-form">'
      + '<input type="search" name="q" class="search-form-input">'
      + '<input type="hidden" name="sitesearch" value="https://hexo.io">'
      + '</form>');
  });

  it('button - true', () => {
    searchForm({button: true, text: 'Find'}).should.eql('<form action="//google.com/search" method="get" accept-charset="UTF-8" class="search-form">'
      + '<input type="search" name="q" class="search-form-input" placeholder="Find">'
      + '<button type="submit" class="search-form-submit">Find</button>'
      + '<input type="hidden" name="sitesearch" value="https://hexo.io">'
      + '</form>');
  });

  it('button - string', () => {
    searchForm({button: 'Go', text: 'Find'}).should.eql('<form action="//google.com/search" method="get" accept-charset="UTF-8" class="search-form">'
      + '<input type="search" name="q" class="search-form-input" placeholder="Find">'
      + '<button type="submit" class="search-form-submit">Go</button>'
      + '<input type="hidden" name="sitesearch" value="https://hexo.io">'
      + '</form>');
  });

  it('button - ignore incorrect type', () => {
    searchForm({button: {}, text: 'Find'}).should.eql('<form action="//google.com/search" method="get" accept-charset="UTF-8" class="search-form">'
      + '<input type="search" name="q" class="search-form-input" placeholder="Find">'
      + '<button type="submit" class="search-form-submit">Find</button>'
      + '<input type="hidden" name="sitesearch" value="https://hexo.io">'
      + '</form>');
  });
});
