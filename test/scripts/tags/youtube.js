'use strict';

const cheerio = require('cheerio');

describe('youtube', () => {
  const youtube = require('../../../lib/plugins/tag/youtube');

  it('id', () => {
    const $ = cheerio.load(youtube(['foo']));

    $('.video-container').html().should.be.ok;
    $('iframe').attr('src').should.eql('https://www.youtube.com/embed/foo');
    $('iframe').attr('frameborder').should.eql('0');
    $('iframe').attr('allowfullscreen').should.eql('');
    $('iframe').attr('loading').should.eql('lazy');
  });

  it('type', () => {
    const $video = cheerio.load(youtube(['foo', 'video']));
    $video('.video-container').html().should.be.ok;
    $video('iframe').attr('src').should.eql('https://www.youtube.com/embed/foo');

    const $playlist = cheerio.load(youtube(['foo', 'playlist']));
    $playlist('.video-container').html().should.be.ok;
    $playlist('iframe').attr('src').should.eql('https://www.youtube.com/embed/videoseries?list=foo');
  });

  it('cookie', () => {
    const $video1 = cheerio.load(youtube(['foo', 'video', false]));
    $video1('.video-container').html().should.be.ok;
    $video1('iframe').attr('src').should.eql('https://www.youtube-nocookie.com/embed/foo');

    // cookie as second parameter
    const $video2 = cheerio.load(youtube(['foo', false]));
    $video2('.video-container').html().should.be.ok;
    $video2('iframe').attr('src').should.eql('https://www.youtube-nocookie.com/embed/foo');
  });
});
