'use strict';

const cheerio = require('cheerio');

describe('bili', () => {
  const bili = require('../../../lib/plugins/tag/bili');

  it('id', () => {
    const $ = cheerio.load(bili(['foo']));

    $('div').html().should.be.ok;
    $('iframe').attr('src').should.eql('//player.bilibili.com/player.html?foo');
    $('iframe').attr('frameborder').should.eql('0');
    $('iframe').attr('allowfullscreen').should.eql('');
  });
});
