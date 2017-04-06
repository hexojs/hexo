var should = require('chai').should(); // eslint-disable-line

describe('relative_url', () => {
  var relativeURL = require('../../../lib/plugins/helper/relative_url');

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
});
