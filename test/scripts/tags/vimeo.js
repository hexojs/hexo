'use strict';

var cheerio = require('cheerio');
var should = require('chai').should(); // eslint-disable-line

describe('vimeo', () => {
  var vimeo = require('../../../lib/plugins/tag/vimeo');

  it('id', () => {
    var $ = cheerio.load(vimeo(['foo']));

    $('.video-container').html().should.be.ok;
    $('iframe').attr('src').should.eql('//player.vimeo.com/video/foo');
    $('iframe').attr('frameborder').should.eql('0');
    $('iframe').attr('allowfullscreen').should.eql('');
  });
});
