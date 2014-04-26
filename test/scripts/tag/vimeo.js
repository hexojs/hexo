var cheerio = require('cheerio'),
  should = require('chai').should();

describe('Tag - vimeo', function(){
  var vimeo = require('../../../lib/plugins/tag/vimeo');

  it('id', function(){
    var $ = cheerio.load(vimeo(['foo']));

    $('.video-container').html().should.be.ok;
    $('iframe').attr('src').should.eql('//player.vimeo.com/video/foo');
    $('iframe').attr('frameborder').should.eql('0');
    $('iframe').attr('allowfullscreen').should.eql('');
  });
});