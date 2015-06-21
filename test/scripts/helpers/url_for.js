'use strict';

var should = require('chai').should();

describe('url_for', function(){
  var ctx = {
    config: {},
    relative_url: require('../../../lib/plugins/helper/relative_url')
  };

  var urlFor = require('../../../lib/plugins/helper/url_for').bind(ctx);

  it('internal url (relative off)', function(){
    ctx.config.root = '/';
    urlFor('index.html').should.eql('/index.html');
    urlFor('/').should.eql('/');

    ctx.config.root = '/blog/';
    urlFor('index.html').should.eql('/blog/index.html');
    urlFor('/').should.eql('/blog/');
  });

  it('internal url (relative on)', function(){
    ctx.config.relative_link = true;
    ctx.config.root = '/';

    ctx.path = '';
    urlFor('index.html').should.eql('index.html');

    ctx.path = 'foo/bar/';
    urlFor('index.html').should.eql('../../index.html');

    ctx.config.relative_link = false;
  });

  it('internal url (options.relative)', function(){
    ctx.path = '';
    urlFor('index.html', {relative: true}).should.eql('index.html');

    ctx.config.relative_link = true;
    urlFor('index.html', {relative: false}).should.eql('/index.html');
    ctx.config.relative_link = false;
  });

  it('external url', function(){
    [
      'http://hexo.io/',
      '//google.com/'
    ].forEach(function(url){
      urlFor(url).should.eql(url);
    });
  });
});
