var should = require('chai').should(); // eslint-disable-line

describe('Excerpt', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var excerpt = require('../../../lib/plugins/filter/after_post_render/excerpt').bind(hexo);

  it('without <!-- more -->', () => {
    var content = [
      'foo',
      'bar',
      'baz'
    ].join('\n');

    var data = {
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
      var template = '<!--{{lead}}more{{tail}}-->';
      // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#Special_characters_meaning_in_regular_expressions
      var spaces = ' \f\n\r\t\v\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff';
      var cases = [];
      var more,
        lead,
        tail,
        s,
        e;

      for (var i = 0; i < spaces.length; ++i) {
        lead = spaces[i];
        for (var k = 0; k < spaces.length; ++k) {
          tail = spaces[k];
          s = '';
          for (var m = 0; m < 3; ++m) {
            e = '';
            for (var n = 0; n < 3; ++n) {
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
      var content = [
        'foo',
        'bar',
        more,
        'baz'
      ].join('\n');

      var data = {
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
    var content = [
      'foo',
      '<!-- more -->',
      'bar',
      '<!-- more -->',
      'baz'
    ].join('\n');

    var data = {
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
});
