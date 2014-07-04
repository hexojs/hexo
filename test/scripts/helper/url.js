var should = require('chai').should(),
  urlHelper = require('../../../lib/plugins/helper/url'),
  relative_url = urlHelper.relative_url;

describe('relative_url', function(){
  it('from root', function(){
    relative_url('', 'foo/').should.eql('foo');
    relative_url('/', 'bar/').should.eql('bar');
  });

  it('from same root', function(){
    relative_url('foo/', 'foo/bar/').should.eql('bar');
  });

  it('from different root', function(){
    relative_url('foo/', 'bar/baz/').should.eql('../bar/baz');
  });
});

describe('url_for', function(){
  var url_for = require('../../../lib/plugins/helper/url').url_for;

  it('internal url (relative off)', function(){
    url_for.call({
      config: {root: '/'},
      relative_url: relative_url
    }, 'index.html').should.eql('/index.html');

    url_for.call({
      config: {root: '/blog/'},
      relative_url: relative_url
    }, 'index.html').should.eql('/blog/index.html');
  });

  it('internal url (relative on)', function(){
    url_for.call({
      config: {root: '/', relative_link: true},
      path: '',
      relative_url: relative_url
    }, 'index.html').should.eql('');

    url_for.call({
      config: {root: '/', relative_link: true},
      path: 'foo/bar/',
      relative_url: relative_url
    }, 'index.html').should.eql('../..');
  });

  it('external url', function(){
    [
      'http://zespia.tw/',
      '//google.com/'
    ].forEach(function(url){
      url_for.call({
        config: {},
        relative_url: relative_url
      }, url).should.eql(url);
    });
  });
});