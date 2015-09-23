'use strict';

var cheerio = require('cheerio');
var should = require('chai').should(); // eslint-disable-line

describe('youtube', function() {
  var youtube = require('../../../lib/plugins/tag/youtube');

  it('id', function() {
    var $ = cheerio.load(youtube(['foo']));

    $('.video-container').html().should.be.ok;
    $('iframe').attr('src').should.eql('//www.youtube.com/embed/foo');
    $('iframe').attr('frameborder').should.eql('0');
    $('iframe').attr('allowfullscreen').should.eql('');
  });
});
