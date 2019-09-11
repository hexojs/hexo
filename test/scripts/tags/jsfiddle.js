'use strict';

const cheerio = require('cheerio');

describe('jsfiddle', () => {
  const jsfiddle = require('../../../lib/plugins/tag/jsfiddle');

  it('id', () => {
    const $ = cheerio.load(jsfiddle(['foo']));

    $('iframe')
      .attr('src')
      .should.eql(
        '//jsfiddle.net/foo/embedded/js,resources,html,css,result/light'
      );
  });

  it('tabs', () => {
    let $ = cheerio.load(jsfiddle(['foo', 'default']));

    $('iframe')
      .attr('src')
      .should.eql(
        '//jsfiddle.net/foo/embedded/js,resources,html,css,result/light'
      );

    $ = cheerio.load(jsfiddle(['foo', 'html,css']));

    $('iframe')
      .attr('src')
      .should.eql('//jsfiddle.net/foo/embedded/html,css/light');
  });

  it('skin', () => {
    let $ = cheerio.load(jsfiddle(['foo', 'default', 'default']));

    $('iframe')
      .attr('src')
      .should.eql(
        '//jsfiddle.net/foo/embedded/js,resources,html,css,result/light'
      );

    $ = cheerio.load(jsfiddle(['foo', 'default', 'dark']));

    $('iframe')
      .attr('src')
      .should.eql(
        '//jsfiddle.net/foo/embedded/js,resources,html,css,result/dark'
      );
  });

  it('width', () => {
    let $ = cheerio.load(jsfiddle(['foo', 'default', 'default', 'default']));

    $('iframe')
      .attr('width')
      .should.eql('100%');

    $ = cheerio.load(jsfiddle(['foo', 'default', 'default', '500']));

    $('iframe')
      .attr('width')
      .should.eql('500');
  });

  it('height', () => {
    let $ = cheerio.load(
      jsfiddle(['foo', 'default', 'default', 'default', 'default'])
    );

    $('iframe')
      .attr('height')
      .should.eql('300');

    $ = cheerio.load(jsfiddle(['foo', 'default', 'default', 'default', '500']));

    $('iframe')
      .attr('height')
      .should.eql('500');
  });
});
