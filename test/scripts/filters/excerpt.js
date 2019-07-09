'use strict';

describe('Excerpt', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo();
  const excerpt = require('../../../lib/plugins/filter/after_post_render/excerpt').bind(hexo);

  it('without <!-- more -->', () => {
    const content = [
      'foo',
      'bar',
      'baz'
    ].join('\n');

    const data = {
      content
    };

    excerpt(data);
    data.content.should.eql(content);
    data.excerpt.should.eql('');
    data.more.should.eql(content);
  });

  it('with <!-- more -->', () => {

    _moreCases().forEach(_test);

    function _moreCases() {
      const template = '<!--{{lead}}more{{tail}}-->';
      // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#Special_characters_meaning_in_regular_expressions
      const spaces = ' \f\n\r\t\v\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff';
      const cases = [];
      let more, lead, tail, s, e;

      for (let i = 0; i < spaces.length; ++i) {
        lead = spaces[i];
        for (let k = 0; k < spaces.length; ++k) {
          tail = spaces[k];
          s = '';
          for (let m = 0; m < 3; ++m) {
            e = '';
            for (let n = 0; n < 3; ++n) {
              more = template.replace('{{lead}}', s).replace('{{tail}}', e);
              cases.push(more);
              e += tail;
            }

            s += lead;
          }
        }
      }

      return cases;
    }

    function _test(more) {
      const content = [
        'foo',
        'bar',
        more,
        'baz'
      ].join('\n');

      const data = {
        content
      };

      excerpt(data);

      data.content.should.eql([
        'foo',
        'bar',
        '<a id="more"></a>',
        'baz'
      ].join('\n'));

      data.excerpt.should.eql([
        'foo',
        'bar'
      ].join('\n'));

      data.more.should.eql([
        'baz'
      ].join('\n'));
    }
  });

  it('multiple <!-- more -->', () => {
    const content = [
      'foo',
      '<!-- more -->',
      'bar',
      '<!-- more -->',
      'baz'
    ].join('\n');

    const data = {
      content
    };

    excerpt(data);

    data.content.should.eql([
      'foo',
      '<a id="more"></a>',
      'bar',
      '<!-- more -->',
      'baz'
    ].join('\n'));

    data.excerpt.should.eql([
      'foo'
    ].join('\n'));

    data.more.should.eql([
      'bar',
      '<!-- more -->',
      'baz'
    ].join('\n'));
  });

  it('skip processing if post/page.excerpt is present in the front-matter', () => {
    const content = [
      'foo',
      '<!-- more -->',
      'bar'
    ].join('\n');

    const data = {
      content,
      excerpt: 'baz'
    };

    excerpt(data);

    data.content.should.eql([
      'foo',
      '<!-- more -->',
      'bar'
    ].join('\n'));

    data.excerpt.should.eql([
      'baz'
    ].join('\n'));

    data.more.should.eql([
      'foo',
      '<!-- more -->',
      'bar'
    ].join('\n'));
  });
});
