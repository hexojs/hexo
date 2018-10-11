'use strict';

const cheerio = require('cheerio');
const should = require('chai').should(); // eslint-disable-line

describe('gist', () => {
  const gist = require('../../../lib/plugins/tag/gist');

  it('id', () => {
    const $ = cheerio.load(gist(['foo']));
    $('script').attr('src').should.eql('//gist.github.com/foo.js');
  });

  it('file', () => {
    const $ = cheerio.load(gist(['foo', 'bar']));
    $('script').attr('src').should.eql('//gist.github.com/foo.js?file=bar');
  });
});
