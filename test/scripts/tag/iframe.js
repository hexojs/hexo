var cheerio = require('cheerio'),
  should = require('chai').should();

describe('Tag - iframe', function(){
  var iframe = require('../../../lib/plugins/tag/iframe');

  it('url', function(){
    var $ = cheerio.load(iframe(['http://zespia.tw']));

    $('iframe').attr('src').should.eql('http://zespia.tw');
    $('iframe').attr('width').should.eql('100%');
    $('iframe').attr('height').should.eql('300');
    $('iframe').attr('frameborder').should.eql('0');
    $('iframe').attr('allowfullscreen').should.eql('');
  });

  it('width', function(){
    var $ = cheerio.load(iframe(['http://zespia.tw', '500']));

    $('iframe').attr('src').should.eql('http://zespia.tw');
    $('iframe').attr('width').should.eql('500');
    $('iframe').attr('height').should.eql('300');
    $('iframe').attr('frameborder').should.eql('0');
    $('iframe').attr('allowfullscreen').should.eql('');
  });

  it('height', function(){
    var $ = cheerio.load(iframe(['http://zespia.tw', '500', '600']));

    $('iframe').attr('src').should.eql('http://zespia.tw');
    $('iframe').attr('width').should.eql('500');
    $('iframe').attr('height').should.eql('600');
    $('iframe').attr('frameborder').should.eql('0');
    $('iframe').attr('allowfullscreen').should.eql('');
  });
});