'use strict';

const cheerio = require('cheerio');
require('chai').should();

describe('iframe', () => {
  const iframe = require('../../../lib/plugins/tag/iframe');

  it('url', () => {
    const $ = cheerio.load(iframe(['http://zespia.tw']));

    $('iframe').attr('src').should.eql('http://zespia.tw');
    $('iframe').attr('width').should.eql('100%');
    $('iframe').attr('height').should.eql('300');
    $('iframe').attr('frameborder').should.eql('0');
    $('iframe').attr('allowfullscreen').should.eql('');
  });

  it('width', () => {
    const $ = cheerio.load(iframe(['http://zespia.tw', '500']));

    $('iframe').attr('src').should.eql('http://zespia.tw');
    $('iframe').attr('width').should.eql('500');
    $('iframe').attr('height').should.eql('300');
    $('iframe').attr('frameborder').should.eql('0');
    $('iframe').attr('allowfullscreen').should.eql('');
  });

  it('height', () => {
    const $ = cheerio.load(iframe(['http://zespia.tw', '500', '600']));

    $('iframe').attr('src').should.eql('http://zespia.tw');
    $('iframe').attr('width').should.eql('500');
    $('iframe').attr('height').should.eql('600');
    $('iframe').attr('frameborder').should.eql('0');
    $('iframe').attr('allowfullscreen').should.eql('');
  });
});
