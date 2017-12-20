'use strict';

var cheerio = require('cheerio');
var should = require('chai').should(); // eslint-disable-line

describe('iframe', () => {
  var iframe = require('../../../lib/plugins/tag/iframe');

  it('url', () => {
    var $ = cheerio.load(iframe(['http://zespia.tw']));

    $('iframe').attr('src').should.eql('http://zespia.tw');
    $('iframe').attr('width').should.eql('100%');
    $('iframe').attr('height').should.eql('300');
    $('iframe').attr('frameborder').should.eql('0');
    $('iframe').attr('allowfullscreen').should.eql('');
  });

  it('width', () => {
    var $ = cheerio.load(iframe(['http://zespia.tw', '500']));

    $('iframe').attr('src').should.eql('http://zespia.tw');
    $('iframe').attr('width').should.eql('500');
    $('iframe').attr('height').should.eql('300');
    $('iframe').attr('frameborder').should.eql('0');
    $('iframe').attr('allowfullscreen').should.eql('');
  });

  it('height', () => {
    var $ = cheerio.load(iframe(['http://zespia.tw', '500', '600']));

    $('iframe').attr('src').should.eql('http://zespia.tw');
    $('iframe').attr('width').should.eql('500');
    $('iframe').attr('height').should.eql('600');
    $('iframe').attr('frameborder').should.eql('0');
    $('iframe').attr('allowfullscreen').should.eql('');
  });
});
