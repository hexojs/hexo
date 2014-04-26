var yaml = require('yamljs'),
  _ = require('lodash'),
  should = require('chai').should();

describe('Util - yfm', function(){
  var yfm = require('../../../lib/util/yfm');

  describe('parse', function(){
    it('only content', function(){
      var str = [
        'foo',
        'bar'
      ].join('\n');

      var data = yfm.parse(str);
      data._content.should.eql(str);
    });

    it('only content (with ---)', function(){
      var str = [
        'foo',
        '---',
        'str'
      ].join('\n');

      var data = yfm.parse(str);
      data._content.should.eql(str);
    });

    it('new style', function(){
      var str = [
        'layout: post',
        '---',
        '123'
      ].join('\n');

      var data = yfm.parse(str);
      data.layout.should.eql('post');
      data._content.should.eql('123');
    });

    it('new style (without content)', function(){
      var str = [
        'layout: post',
        '---'
      ].join('\n');

      var data = yfm.parse(str);
      data.layout.should.eql('post');
      data._content.should.eql('');
    });

    it('new style (trim)', function(){
      var str = [
        '',
        'layout: post',
        '',
        '---',
        '',
        '',
        '',
        '123'
      ].join('\n');

      var data = yfm.parse(str);
      data.layout.should.eql('post');
      data._content.should.eql('123');
    });

    it('new style (more than 3 dashes)', function(){
      var str = [
        'layout: post',
        '------',
        '123'
      ].join('\n');

      var data = yfm.parse(str);
      data.layout.should.eql('post');
      data._content.should.eql('123');
    });

    it('old style', function(){
      var str = [
        '---',
        'layout: post',
        '---',
        '123'
      ].join('\n');

      var data = yfm.parse(str);
      data.layout.should.eql('post');
      data._content.should.eql('123');
    });

    it('old style (without content)', function(){
      var str = [
        '---',
        'layout: post',
        '---'
      ].join('\n');

      var data = yfm.parse(str);
      data.layout.should.eql('post');
      data._content.should.eql('');
    });

    it('old style (trim)', function(){
      var str = [
        '---',
        '',
        'layout: post',
        '',
        '---',
        '',
        '',
        '',
        '123'
      ].join('\n');

      var data = yfm.parse(str);
      data.layout.should.eql('post');
      data._content.should.eql('123');
    });

    it('old style (more than 3 dashes)', function(){
      var str = [
        '----',
        'layout: post',
        '------',
        '123'
      ].join('\n');

      var data = yfm.parse(str);
      data.layout.should.eql('post');
      data._content.should.eql('123');
    });
  });

  describe('stringify', function(){
    it('with data', function(){
      var data = {
        layout: 'post',
        _content: '123'
      };

      yfm.stringify(data).should.eql('layout: post\n\n---\n123');
    });

    it('without data', function(){
      var data = {
        _content: '123'
      };

      yfm.stringify(data).should.eql('123');
    });
  });
});