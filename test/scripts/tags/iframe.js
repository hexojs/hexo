'use strict';

const cheerio = require('cheerio');

describe('iframe', () => {
  const iframe = require('../../../dist/plugins/tag/iframe');

  it('url', () => {
    const $ = cheerio.load(iframe(['https://zespia.tw']));

    $('iframe').attr('src').should.eql('https://zespia.tw/');
    $('iframe').attr('width').should.eql('100%');
    $('iframe').attr('height').should.eql('300');
    $('iframe').attr('frameborder').should.eql('0');
    $('iframe').attr('allowfullscreen').should.eql('');
    $('iframe').attr('loading').should.eql('lazy');
  });

  it('width', () => {
    const $ = cheerio.load(iframe(['https://zespia.tw', '500']));

    $('iframe').attr('src').should.eql('https://zespia.tw/');
    $('iframe').attr('width').should.eql('500');
    $('iframe').attr('height').should.eql('300');
    $('iframe').attr('frameborder').should.eql('0');
    $('iframe').attr('allowfullscreen').should.eql('');
    $('iframe').attr('loading').should.eql('lazy');
  });

  it('height', () => {
    const $ = cheerio.load(iframe(['https://zespia.tw', '500', '600']));

    $('iframe').attr('src').should.eql('https://zespia.tw/');
    $('iframe').attr('width').should.eql('500');
    $('iframe').attr('height').should.eql('600');
    $('iframe').attr('frameborder').should.eql('0');
    $('iframe').attr('allowfullscreen').should.eql('');
    $('iframe').attr('loading').should.eql('lazy');
  });
});
