var should = require('chai').should();

describe('url_for', function(){
  var url_for = require('../../../lib/plugins/helper/url').url_for;

  it('internal url (relative off)', function(){
    var url = 'index.html';

    url_for.call({
      config: {root: '/'}
    }, url).should.eql('/' + url);

    url_for.call({
      config: {root: '/blog/'}
    }, url).should.eql('/blog/' + url);
  });

  it('internal url (relative on)', function(){
    var url = 'index.html';

    url_for.call({
      config: {root: '/', relative_link: true},
      path: ''
    }, url).should.eql(url);

    url_for.call({
      config: {root: '/', relative_link: true},
      path: 'foo/bar/'
    }, url).should.eql('../../' + url);
  });

  it('external url', function(){
    [
      'http://zespia.tw/',
      '//google.com/'
    ].forEach(function(url){
      url_for(url).should.eql(url);
    });
  });
});