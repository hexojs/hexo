var util = require('../lib/util'),
  yaml = require('yamljs'),
  _ = require('lodash');

describe('Utils', function(){
  describe('html_tag', function(){
    var html_tag = util.html_tag;

    it('tag', function(){
      html_tag('hr').should.be.eql('<hr>');
    });

    it('tag + attrs', function(){
      html_tag('img', {
        src: 'http://placekitten.com/200/300'
      }).should.be.eql('<img src="http://placekitten.com/200/300">');

      html_tag('img', {
        src: 'http://placekitten.com/200/300',
        width: 200,
        height: 300
      }).should.be.eql('<img src="http://placekitten.com/200/300" width="200" height="300">');
    });

    it('tag + attrs + text', function(){
      html_tag('a', {
        href: 'http://zespia.tw'
      }, 'My blog').should.be.eql('<a href="http://zespia.tw">My blog</a>');
    });
  });

  describe('titlecase', function(){
    var titlecase = util.titlecase;

    it('normal', function(){
      titlecase('Today is a beatuiful day').should.eql('Today Is a Beatuiful Day');
    });

    it('all upper case', function(){
      titlecase('TODAY IS A BEATUIFUL DAY').should.eql('Today Is a Beatuiful Day');
    });

    it('all lower case', function(){
      titlecase('today is a beatuiful day').should.eql('Today Is a Beatuiful Day');
    });
  });

  describe('yfm', function(){
    var yfm = util.yfm;

    var str = [
      'layout: post',
      'title: Today is a beatuiful day',
      'date: 2013-08-18 23:46:27',
      'comments: true',
      'tags:',
      '- Foo',
      '- Bar',
      'categories:',
      '  foo: 1',
      '  bar: 2'
    ].join('\n');

    var obj = yaml.parse(str);

    it('normal format', function(){
      yfm('---\n' + str + '\n---\ncontent').should.be.eql(_.extend({_content: 'content'}, obj));
    });

    it('simplified format', function(){
      yfm(str + '\n---\ncontent').should.be.eql(_.extend({_content: 'content'}, obj));
    });

    it('stringify', function(){
      var txt = yfm.stringify(_.extend({_content: 'content'}, obj));

      yfm(txt).should.be.eql(_.extend({_content: 'content'}, obj));
    });
  });
});