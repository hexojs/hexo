var cheerio = require('cheerio');
var should = require('chai').should();

describe('img', function(){
  var img = require('../../../lib/plugins/tag/img');

  it('src', function(){
    var $ = cheerio.load(img(['http://placekitten.com/200/300']));

    $('img').attr('src').should.eql('http://placekitten.com/200/300');
  });

  it('class + src', function(){
    var $ = cheerio.load(img('left http://placekitten.com/200/300'.split(' ')));

    $('img').attr('src').should.eql('http://placekitten.com/200/300');
    $('img').attr('class').should.eql('left');
  });

  it('multiple classes + src', function(){
    var $ = cheerio.load(img('left top http://placekitten.com/200/300'.split(' ')));

    $('img').attr('src').should.eql('http://placekitten.com/200/300');
    $('img').attr('class').should.eql('left top');
  });

  it('class + src + width', function(){
    var $ = cheerio.load(img('left http://placekitten.com/200/300 200'.split(' ')));

    $('img').attr('src').should.eql('http://placekitten.com/200/300');
    $('img').attr('class').should.eql('left');
    $('img').attr('width').should.eql('200');
  });

  it('class + src + width + height', function(){
    var $ = cheerio.load(img('left http://placekitten.com/200/300 200 300'.split(' ')));

    $('img').attr('src').should.eql('http://placekitten.com/200/300');
    $('img').attr('class').should.eql('left');
    $('img').attr('width').should.eql('200');
    $('img').attr('height').should.eql('300');
  });

  it('class + src + title', function(){
    var $ = cheerio.load(img('left http://placekitten.com/200/300 Place Kitten'.split(' ')));

    $('img').attr('src').should.eql('http://placekitten.com/200/300');
    $('img').attr('class').should.eql('left');
    $('img').attr('title').should.eql('Place Kitten');
  });

  it('class + src + width + title', function(){
    var $ = cheerio.load(img('left http://placekitten.com/200/300 200 Place Kitten'.split(' ')));

    $('img').attr('src').should.eql('http://placekitten.com/200/300');
    $('img').attr('class').should.eql('left');
    $('img').attr('width').should.eql('200');
    $('img').attr('title').should.eql('Place Kitten');
  });

  it('class + src + width + height + title', function(){
    var $ = cheerio.load(img('left http://placekitten.com/200/300 200 300 Place Kitten'.split(' ')));

    $('img').attr('src').should.eql('http://placekitten.com/200/300');
    $('img').attr('class').should.eql('left');
    $('img').attr('width').should.eql('200');
    $('img').attr('height').should.eql('300');
    $('img').attr('title').should.eql('Place Kitten');
  });

  it('class + src + width + height + title + alt', function(){
    var $ = cheerio.load(img('left http://placekitten.com/200/300 200 300 "Place Kitten" "A cute kitten"'.split(' ')));

    $('img').attr('src').should.eql('http://placekitten.com/200/300');
    $('img').attr('class').should.eql('left');
    $('img').attr('width').should.eql('200');
    $('img').attr('height').should.eql('300');
    $('img').attr('title').should.eql('Place Kitten');
    $('img').attr('alt').should.eql('A cute kitten');
  });
});