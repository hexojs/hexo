'use strict';

var pathFn = require('path');
var cheerio = require('cheerio');
var should = require('chai').should(); // eslint-disable-line

describe('img', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'img_test'));
  var img = require('../../../lib/plugins/tag/img')(hexo);

  before(() => hexo.init());

  it('src', () => {
    var $ = cheerio.load(img(['http://placekitten.com/200/300']));

    $('img').attr('src').should.eql('http://placekitten.com/200/300');
  });

  it('src //', () => {
    var $ = cheerio.load(img(['//placekitten.com/200/300']));

    $('img').attr('src').should.eql('//placekitten.com/200/300');
  });

  it('internal src', () => {
    hexo.config.root = '/';
    var $ = cheerio.load(img(['/images/test.jpg']));
    $('img').attr('src').should.eql('/images/test.jpg');

    hexo.config.url = 'http://yoursite.com/root';
    hexo.config.root = '/root/';
    $ = cheerio.load(img(['/images/test.jpg']));
    $('img').attr('src').should.eql('/root/images/test.jpg');
  });

  it('class + src', () => {
    var $ = cheerio.load(img('left http://placekitten.com/200/300'.split(' ')));

    $('img').attr('src').should.eql('http://placekitten.com/200/300');
    $('img').attr('class').should.eql('left');
  });

  it('class + internal src', () => {
    hexo.config.root = '/';
    var $ = cheerio.load(img('left /images/test.jpg'.split(' ')));
    $('img').attr('src').should.eql('/images/test.jpg');
    $('img').attr('class').should.eql('left');

    hexo.config.url = 'http://yoursite.com/root';
    hexo.config.root = '/root/';
    $ = cheerio.load(img('left /images/test.jpg'.split(' ')));
    $('img').attr('src').should.eql('/root/images/test.jpg');
    $('img').attr('class').should.eql('left');
  });

  it('multiple classes + src', () => {
    var $ = cheerio.load(img('left top http://placekitten.com/200/300'.split(' ')));

    $('img').attr('src').should.eql('http://placekitten.com/200/300');
    $('img').attr('class').should.eql('left top');
  });

  it('multiple classes + internal src', () => {
    hexo.config.root = '/';
    var $ = cheerio.load(img('left top /images/test.jpg'.split(' ')));
    $('img').attr('src').should.eql('/images/test.jpg');
    $('img').attr('class').should.eql('left top');

    hexo.config.url = 'http://yoursite.com/root';
    hexo.config.root = '/root/';
    $ = cheerio.load(img('left top /images/test.jpg'.split(' ')));
    $('img').attr('src').should.eql('/root/images/test.jpg');
    $('img').attr('class').should.eql('left top');
  });

  it('class + src + width', () => {
    var $ = cheerio.load(img('left http://placekitten.com/200/300 200'.split(' ')));

    $('img').attr('src').should.eql('http://placekitten.com/200/300');
    $('img').attr('class').should.eql('left');
    $('img').attr('width').should.eql('200');
  });

  it('class + src + width + height', () => {
    var $ = cheerio.load(img('left http://placekitten.com/200/300 200 300'.split(' ')));

    $('img').attr('src').should.eql('http://placekitten.com/200/300');
    $('img').attr('class').should.eql('left');
    $('img').attr('width').should.eql('200');
    $('img').attr('height').should.eql('300');
  });

  it('class + src + title', () => {
    var $ = cheerio.load(img('left http://placekitten.com/200/300 Place Kitten'.split(' ')));

    $('img').attr('src').should.eql('http://placekitten.com/200/300');
    $('img').attr('class').should.eql('left');
    $('img').attr('title').should.eql('Place Kitten');
  });

  it('class + src + width + title', () => {
    var $ = cheerio.load(img('left http://placekitten.com/200/300 200 Place Kitten'.split(' ')));

    $('img').attr('src').should.eql('http://placekitten.com/200/300');
    $('img').attr('class').should.eql('left');
    $('img').attr('width').should.eql('200');
    $('img').attr('title').should.eql('Place Kitten');
  });

  it('class + src + width + height + title', () => {
    var $ = cheerio.load(img('left http://placekitten.com/200/300 200 300 Place Kitten'.split(' ')));

    $('img').attr('src').should.eql('http://placekitten.com/200/300');
    $('img').attr('class').should.eql('left');
    $('img').attr('width').should.eql('200');
    $('img').attr('height').should.eql('300');
    $('img').attr('title').should.eql('Place Kitten');
  });

  it('class + src + width + height + title + alt', () => {
    var $ = cheerio.load(img('left http://placekitten.com/200/300 200 300 "Place Kitten" "A cute kitten"'.split(' ')));

    $('img').attr('src').should.eql('http://placekitten.com/200/300');
    $('img').attr('class').should.eql('left');
    $('img').attr('width').should.eql('200');
    $('img').attr('height').should.eql('300');
    $('img').attr('title').should.eql('Place Kitten');
    $('img').attr('alt').should.eql('A cute kitten');
  });
});
