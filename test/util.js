var util = require('../lib/util'),
  file = util.file,
  highlight = util.highlight,
  titlecase = util.titlecase,
  yfm = util.yfm;

describe('Utilities', function(){
  describe('titlecase()', function(){
    it('All upper case', function(){
      titlecase('TODAY IS A BEATUIFUL DAY').should.equal('Today Is a Beatuiful Day');
    });

    it('All lower case', function(){
      titlecase('today is a beatuiful day').should.equal('Today Is a Beatuiful Day');
    });

    it('Normal sentence', function(){
      titlecase('Today is a beatuiful day').should.equal('Today Is a Beatuiful Day');
    });
  });

  it('yfm()', function(){
    var content = [
      '---',
      'layout: post',
      'title: Today is a beatuiful day',
      'date: 2013-01-08 22:37:49',
      'comments: true',
      'tags:',
      '- Foo',
      '- Bar',
      'categories:',
      '  foo: 1',
      '  bar: 2',
      '---',
      'content'
    ].join('\n');

    JSON.stringify(yfm(content)).should.equal(JSON.stringify({
      layout: 'post',
      title: 'Today is a beatuiful day',
      date: new Date(2013, 0, 8, 22, 37, 49),
      comments: true,
      tags: ['Foo', 'Bar'],
      categories: {foo: 1, bar: 2},
      _content: 'content'
    }));
  });
});