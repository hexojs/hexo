'use strict';

describe('relative_url', () => {
  const relativeURL = require('../../../dist/plugins/helper/relative_url');

  it('from root', () => {
    relativeURL('', 'css/style.css').should.eql('css/style.css');
    relativeURL('index.html', 'css/style.css').should.eql('css/style.css');
  });

  it('from same root', () => {
    relativeURL('foo/', 'foo/style.css').should.eql('style.css');
    relativeURL('foo/index.html', 'foo/style.css').should.eql('style.css');
    relativeURL('foo/bar/', 'foo/bar/style.css').should.eql('style.css');
    relativeURL('foo/bar/index.html', 'foo/bar/style.css').should.eql('style.css');
  });

  it('from different root', () => {
    relativeURL('foo/', 'css/style.css').should.eql('../css/style.css');
    relativeURL('foo/index.html', 'css/style.css').should.eql('../css/style.css');
    relativeURL('foo/bar/', 'css/style.css').should.eql('../../css/style.css');
    relativeURL('foo/bar/index.html', 'css/style.css').should.eql('../../css/style.css');
  });

  it('to root', () => {
    relativeURL('index.html', '/').should.eql('index.html');
    relativeURL('foo/', '/').should.eql('../index.html');
    relativeURL('foo/index.html', '/').should.eql('../index.html');
  });

  it('should encode path', () => {
    relativeURL('foo/', 'css/fôo.css').should.eql('../css/f%C3%B4o.css');
  });
});
