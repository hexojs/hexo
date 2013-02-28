var util = require('../lib/util'),
  titlecase = util.titlecase,
  yfm = util.yfm;

describe('Utilities', function(){
  describe('titlecase()', function(){
    it('All upper case', function(){
      titlecase('TODAY IS A BEATUIFUL DAY').should.eql('Today Is a Beatuiful Day');
    });

    it('All lower case', function(){
      titlecase('today is a beatuiful day').should.eql('Today Is a Beatuiful Day');
    });

    it('Normal sentence', function(){
      titlecase('Today is a beatuiful day').should.eql('Today Is a Beatuiful Day');
    });
  });

  describe('yfm()', function(){
    it('YAML Front Matter', function(){
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
        ' foo: 1',
        ' bar: 2',
        '---',
        'content'
      ].join('\n');

      yfm(content).should.eql({
        layout: 'post',
        title: 'Today is a beatuiful day',
        date: new Date(2013, 0, 8, 22, 37, 49),
        comments: true,
        tags: ['Foo', 'Bar'],
        categories: {foo: 1, bar: 2},
        _content: 'content'
      });
    });
  });
});