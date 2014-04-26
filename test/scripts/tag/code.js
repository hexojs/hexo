var cheerio = require('cheerio'),
  should = require('chai').should(),
  highlight = require('../../../lib/util/highlight');

describe('Tag - code', function(){
  var code = require('../../../lib/plugins/tag/code');

  var dummy = [
    'var dummy = function(){',
    '  alert("dummy");',
    '});'
  ].join('\n');

  var content = cheerio.load(highlight(dummy))('table').html();

  it('content', function(){
    var $ = cheerio.load(code([], dummy));

    $('figure').attr('class').should.eql('highlight');
    $('figure table').html().should.eql(content);
  });

  it('lang', function(){
    var $ = cheerio.load(code('lang:js'.split(' '), ''));

    $('figure').attr('class').should.eql('highlight js');
  });

  it('title', function(){
    var $ = cheerio.load(code('Code block test'.split(' '), ''));

    $('figcaption span').html().should.eql('Code block test');
  });

  it('title + url', function(){
    var $ = cheerio.load(code('Code block test http://zespia.tw'.split(' '), ''));

    $('figcaption span').html().should.eql('Code block test');
    $('figcaption a').attr('href').should.eql('http://zespia.tw');
    $('figcaption a').html().should.eql('link');
  });

  it('title + url + link', function(){
    var $ = cheerio.load(code('Code block test http://zespia.tw My blog'.split(' '), ''));

    $('figcaption span').html().should.eql('Code block test');
    $('figcaption a').attr('href').should.eql('http://zespia.tw');
    $('figcaption a').html().should.eql('My blog');
  });
});