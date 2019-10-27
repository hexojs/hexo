'use strict';

const cheerio = require('cheerio');

describe('vimeo', () => {
  const vimeo = require('../../../lib/plugins/tag/vimeo');

  it('id', () => {
    const $ = cheerio.load(vimeo(['foo']));

    $('.video-container').html().should.be.ok;
    $('iframe').attr('src').should.eql('https://player.vimeo.com/video/foo');
    $('iframe').attr('frameborder').should.eql('0');
    $('iframe').attr('allowfullscreen').should.eql('');
    $('iframe').attr('loading').should.eql('lazy');
  });
});
