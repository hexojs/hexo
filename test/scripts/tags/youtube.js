'use strict';

const cheerio = require('cheerio');

describe('youtube', () => {
  const youtube = require('../../../lib/plugins/tag/youtube');

  it('id', () => {
    const $ = cheerio.load(youtube(['foo']));

    $('.video-container').html().should.be.ok;
    $('iframe').attr('src').should.eql('//www.youtube.com/embed/foo');
    $('iframe').attr('frameborder').should.eql('0');
    $('iframe').attr('allowfullscreen').should.eql('');
    $('iframe').attr('loading').should.eql('lazy');
  });
});
