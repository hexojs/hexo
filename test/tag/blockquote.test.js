var cheerio = require('cheerio'),
  should = require('chai').should();

describe('Tag - blockquote', function(){
  var blockquote = require('../../lib/plugins/tag/blockquote');

  var raw = '123456 **bold** and *italic*';

  it('author', function(){
    var $ = cheerio.load(blockquote('John Doe'.split(' '), raw));

    $('blockquote footer strong').html().should.eql('John Doe');
  });

  it('author + source', function(){
    var $ = cheerio.load(blockquote('John Doe, A book'.split(' '), raw));

    $('blockquote footer strong').html().should.eql('John Doe');
    $('blockquote footer cite').html().should.eql('A book');
  });

  it('author + link', function(){
    var $ = cheerio.load(blockquote('John Doe http://zespia.tw'.split(' '), raw));

    $('blockquote footer strong').html().should.eql('John Doe');
    $('blockquote footer cite').html().should.eql('<a href="http://zespia.tw">zespia.tw/</a>');

    var $ = cheerio.load(blockquote('John Doe http://zespia.tw/this/is/a/fucking/long/url'.split(' '), raw));

    $('blockquote footer strong').html().should.eql('John Doe');
    $('blockquote footer cite').html().should.eql('<a href="http://zespia.tw/this/is/a/fucking/long/url">zespia.tw/this/is/a/fucking/&hellip;</a>');
  });

  it('author + link + title', function(){
    var $ = cheerio.load(blockquote('John Doe http://zespia.tw My Blog'.split(' '), raw));

    $('blockquote footer strong').html().should.eql('John Doe');
    $('blockquote footer cite').html().should.eql('<a href="http://zespia.tw">My Blog</a>')
  });
});