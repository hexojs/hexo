'use strict';

var should = require('chai').should();

describe('Tag', function(){
  var Tag = require('../../../lib/extend/tag');
  var tag = new Tag();

  it('register()', function(){
    tag.register('test', function(args, content){
      return args.join(' ');
    });

    tag.swig.render([
      '{% test foo.bar | abcdef > fn(a, b, c) < fn() %}'
    ].join('\n'), {}).should.eql('foo.bar | abcdef > fn(a, b, c) < fn()');
  });

  it('register() - ends', function(){
    tag.register('test', function(args, content){
      return content;
    }, true);

    tag.swig.render([
      '{% test %}',
      '123456',
      '  {% raw %}',
      '  raw',
      '  {% endraw %}',
      '  {% test %}',
      '  test',
      '  {% endtest %}',
      '789012',
      '{% endtest %}'
    ].join('\n'), {}).replace(/\s/g, '').should.eql('123456rawtest789012');
  });

  it('register() - name is required', function(){
    try {
      tag.register();
    } catch (err){
      err.should.have.property('message', 'name is required');
    }
  });

  it('register() - fn must be a function', function(){
    try {
      tag.register('test');
    } catch (err){
      err.should.have.property('message', 'fn must be a function');
    }
  });
});