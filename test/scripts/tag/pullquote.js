var cheerio = require('cheerio'),
  should = require('chai').should();

describe('pullquote', function(){
  var pullquote = require('../../../lib/plugins/tag/pullquote');

  var raw = '123456 **bold** and *italic*';

  it('content', function(){
    var $ = cheerio.load(pullquote([], raw));

    $('blockquote').attr('class').should.eql('pullquote');
  });

  it('class', function(){
    var $ = cheerio.load(pullquote(['foo'], raw));

    $('blockquote').attr('class').should.eql('pullquote foo');

     var $ = cheerio.load(pullquote(['foo', 'bar'], raw));

    $('blockquote').attr('class').should.eql('pullquote foo bar');
  });
});