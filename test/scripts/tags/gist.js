'use strict';

var cheerio = require('cheerio');
var should = require('chai').should(); // eslint-disable-line

describe('gist', () => {
  var gist = require('../../../lib/plugins/tag/gist');

  it('id', () => {
    var $ = cheerio.load(gist(['foo']));
    $('script').attr('src').should.eql('//gist.github.com/foo.js');
  });

  it('file', () => {
    var $ = cheerio.load(gist(['foo', 'bar']));
    $('script').attr('src').should.eql('//gist.github.com/foo.js?file=bar');
  });
});
