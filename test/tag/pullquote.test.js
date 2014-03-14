var cheerio = require('cheerio'),
  marked = require('marked'),
  should = require('chai').should();

describe('pullquote', function(){
  var pullquote = require('../../lib/plugins/tag/pullquote');

  var raw = '123456 **bold** and *italic*',
    parsed = marked(raw);

  it('content', function(){
    var $ = cheerio.load(pullquote([], raw));

    $('blockquote').attr('class').should.eql('pullquote');
    $('blockquote').html().should.eql(parsed);
  });

  it('class', function(){
    var $ = cheerio.load(pullquote(['foo'], raw));

    $('blockquote').attr('class').should.eql('pullquote foo');

     var $ = cheerio.load(pullquote(['foo', 'bar'], raw));

    $('blockquote').attr('class').should.eql('pullquote foo bar');
  });
});