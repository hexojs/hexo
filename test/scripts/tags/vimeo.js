'use strict';

const cheerio = require('cheerio');

describe('vimeo', () => {
  const vimeo = require('../../../lib/plugins/tag/vimeo');

  it('responsive', () => {
    const $ = cheerio.load(vimeo(['foo']));

    $('.video-container').html().should.exist;
    $('.video-container').attr('style').should.eql('padding:56.25% 0 0 0;position:relative;');
    $('iframe').attr('src').should.eql('//player.vimeo.com/video/foo?title=0&byline=0&portrait=0');
    $('iframe').attr('style').should.eql('position:absolute;top:0;left:0;width:100%;height:100%;');
    $('iframe').attr('frameborder').should.eql('0');
    $('iframe').attr('allowfullscreen').should.eql('');
    $('iframe').attr('webkitallowfullscreen').should.eql('');
    $('iframe').attr('mozallowfullscreen').should.eql('');
  });

  it('non responsive', () => {
    const $ = cheerio.load(vimeo(['foo', 640, 480]));

    $('.video-container').html().should.be.ok;
    $('iframe').attr('src').should.eql('//player.vimeo.com/video/foo?title=0&byline=0&portrait=0');
    $('iframe').attr('width').should.eql('640');
    $('iframe').attr('height').should.eql('480');
    $('iframe').attr('frameborder').should.eql('0');
    $('iframe').attr('allowfullscreen').should.eql('');
    $('iframe').attr('webkitallowfullscreen').should.eql('');
    $('iframe').attr('mozallowfullscreen').should.eql('');
  });
});
