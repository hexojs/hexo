'use strict';

var should = require('chai').should();

describe('relative_url', function(){
  var relativeURL = require('../../../lib/plugins/helper/relative_url');

  it('from root', function(){
    relativeURL('', 'css/style.css').should.eql('css/style.css');
    relativeURL('index.html', 'css/style.css').should.eql('css/style.css');
  });

  it('from same root', function(){
    relativeURL('foo/', 'foo/style.css').should.eql('style.css');
    relativeURL('foo/index.html', 'foo/style.css').should.eql('style.css');
    relativeURL('foo/bar/', 'foo/bar/style.css').should.eql('style.css');
    relativeURL('foo/bar/index.html', 'foo/bar/style.css').should.eql('style.css');
  });

  it('from different root', function(){
    relativeURL('foo/', 'css/style.css').should.eql('../css/style.css');
    relativeURL('foo/index.html', 'css/style.css').should.eql('../css/style.css');
    relativeURL('foo/bar/', 'css/style.css').should.eql('../../css/style.css');
    relativeURL('foo/bar/index.html', 'css/style.css').should.eql('../../css/style.css');
  });

  it('to root', function(){
    relativeURL('index.html', '/').should.eql('index.html');
    relativeURL('foo/', '/').should.eql('../index.html');
    relativeURL('foo/index.html', '/').should.eql('../index.html');
  });
});