var cheerio = require('cheerio'),
  should = require('chai').should();

describe('Tag - blockquote', function(){
  var blockquote = require('../../../lib/plugins/tag/blockquote');

  var bq = function(args){
    var result = blockquote(args.split(' '), '123456 **bold** and *italic*');

    return result.replace(/<escape>(.*?)<\/escape>/g, '$1');
  };

  it('author', function(){
    var $ = cheerio.load(bq('John Doe'));

    $('blockquote footer strong').html().should.eql('John Doe');
  });

  it('author + source', function(){
    var $ = cheerio.load(bq('John Doe, A book'));

    $('blockquote footer strong').html().should.eql('John Doe');
    $('blockquote footer cite').html().should.eql('A book');
  });

  it('author + link', function(){
    var $ = cheerio.load(bq('John Doe http://zespia.tw'));

    $('blockquote footer strong').html().should.eql('John Doe');
    $('blockquote footer cite').html().should.eql('<a href="http://zespia.tw">zespia.tw/</a>');

    var $ = cheerio.load(bq('John Doe http://zespia.tw/this/is/a/fucking/long/url'));

    $('blockquote footer strong').html().should.eql('John Doe');
    $('blockquote footer cite').html().should.eql('<a href="http://zespia.tw/this/is/a/fucking/long/url">zespia.tw/this/is/a/fucking/&hellip;</a>');
  });

  it('author + link + title', function(){
    var $ = cheerio.load(bq('John Doe http://zespia.tw My Blog'));

    $('blockquote footer strong').html().should.eql('John Doe');
    $('blockquote footer cite').html().should.eql('<a href="http://zespia.tw">My Blog</a>')
  });
});