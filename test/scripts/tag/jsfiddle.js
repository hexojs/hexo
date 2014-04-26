var cheerio = require('cheerio'),
  should = require('chai').should();

describe('Tag - jsfiddle', function(){
  var jsfiddle = require('../../../lib/plugins/tag/jsfiddle');

  it('id', function(){
    var $ = cheerio.load(jsfiddle(['foo']));

    $('iframe').attr('src').should.eql('http://jsfiddle.net/foo/embedded/js,resources,html,css,result/light');
  });

  it('tabs', function(){
    var $ = cheerio.load(jsfiddle(['foo', 'default']));

    $('iframe').attr('src').should.eql('http://jsfiddle.net/foo/embedded/js,resources,html,css,result/light');

    var $ = cheerio.load(jsfiddle(['foo', 'html,css']));

    $('iframe').attr('src').should.eql('http://jsfiddle.net/foo/embedded/html,css/light');
  });

  it('skin', function(){
    var $ = cheerio.load(jsfiddle(['foo', 'default', 'default']));

    $('iframe').attr('src').should.eql('http://jsfiddle.net/foo/embedded/js,resources,html,css,result/light');

    var $ = cheerio.load(jsfiddle(['foo', 'default', 'dark']));

    $('iframe').attr('src').should.eql('http://jsfiddle.net/foo/embedded/js,resources,html,css,result/dark');
  });

  it('width', function(){
    var $ = cheerio.load(jsfiddle(['foo', 'default', 'default', 'default']));

    $('iframe').attr('width').should.eql('100%');

    var $ = cheerio.load(jsfiddle(['foo', 'default', 'default', '500']));

    $('iframe').attr('width').should.eql('500');
  });

  it('height', function(){
    var $ = cheerio.load(jsfiddle(['foo', 'default', 'default', 'default', 'default']));

    $('iframe').attr('height').should.eql('300');

    var $ = cheerio.load(jsfiddle(['foo', 'default', 'default', 'default', '500']));

    $('iframe').attr('height').should.eql('500');
  });
});