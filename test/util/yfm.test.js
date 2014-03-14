var yaml = require('yamljs'),
  _ = require('lodash'),
  should = require('chai').should();

describe('Util - yfm', function(){
  var yfm = require('../../lib/util/yfm');

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
    yfm('---\n' + str + '\n---\ncontent').should.eql(_.extend({_content: 'content'}, obj));
  });

  it('simplified format', function(){
    yfm(str + '\n---\ncontent').should.eql(_.extend({_content: 'content'}, obj));
  });

  it('empty content', function(){
    yfm(str + '\n---').should.eql(_.extend({_content: ''}, obj));
  });

  it('stringify', function(){
    var txt = yfm.stringify(_.extend({_content: 'content'}, obj));

    yfm(txt).should.eql(_.extend({_content: 'content'}, obj));
  });
});