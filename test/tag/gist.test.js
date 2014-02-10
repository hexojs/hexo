var cheerio = require('cheerio'),
  should = require('chai').should();

describe('Tag - gist', function(){
  var gist = require('../../lib/plugins/tag/gist');

  it('id', function(){
    var $ = cheerio.load(gist(['foo']));

    $('script').attr('src').should.eql('https://gist.github.com/foo.js');
  });

  it('file', function(){
    var $ = cheerio.load(gist(['foo', 'bar']));

    $('script').attr('src').should.eql('https://gist.github.com/foo.js?file=bar');
  })
});