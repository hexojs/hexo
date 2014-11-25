var should = require('chai').should();

describe('Permalink', function(){
  var Permalink = require('../../../lib/util/permalink');
  var permalink;

  it('constructor', function(){
    permalink = new Permalink(':year/:month/:day/:title');

    permalink.rule.should.eql(':year/:month/:day/:title');
    permalink.regex.should.eql(/^(.+?)\/(.+?)\/(.+?)\/(.+?)$/);
    permalink.params.should.eql(['year', 'month', 'day', 'title']);

    permalink = new Permalink(':year/:month/:day/:title', {
      segments: {
        year: /(\d{4})/,
        month: /(\d{2})/,
        day: /(\d{2})/
      }
    });

    permalink.rule.should.eql(':year/:month/:day/:title');
    permalink.regex.should.eql(/^(\d{4})\/(\d{2})\/(\d{2})\/(.+?)$/);
    permalink.params.should.eql(['year', 'month', 'day', 'title']);
  });

  it('test()', function(){
    permalink.test('2014/01/31/test').should.be.true;
    permalink.test('foweirojwoier').should.be.false;
  });

  it('parse()', function(){
    permalink.parse('2014/01/31/test').should.eql({
      year: '2014',
      month: '01',
      day: '31',
      title: 'test'
    });
  });

  it('stringify()', function(){
    permalink.stringify({
      year: '2014',
      month: '01',
      day: '31',
      title: 'test'
    }).should.eql('2014/01/31/test');
  });
});