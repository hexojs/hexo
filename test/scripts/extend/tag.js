'use strict';

var should = require('chai').should(); // eslint-disable-line
var sinon = require('sinon');
var Promise = require('bluebird');

describe('Tag', function() {
  var Tag = require('../../../lib/extend/tag');
  var tag = new Tag();

  it('register()', function() {
    var tag = new Tag();

    tag.register('test', function(args, content) {
      return args.join(' ');
    });

    return tag.render('{% test foo.bar | abcdef > fn(a, b, c) < fn() %}').then(function(result) {
      result.should.eql('foo.bar | abcdef > fn(a, b, c) < fn()');
    });
  });

  it('register() - async', function() {
    var tag = new Tag();

    tag.register('test', function(args, content) {
      return Promise.resolve(args.join(' '));
    }, {async: true});

    return tag.render('{% test foo bar %}').then(function(result) {
      result.should.eql('foo bar');
    });
  });

  it('register() - block', function() {
    var tag = new Tag();

    tag.register('test', function(args, content) {
      return args.join(' ') + ' ' + content;
    }, true);

    var str = [
      '{% test foo bar %}',
      'test content',
      '{% endtest %}'
    ].join('\n');

    return tag.render(str).then(function(result) {
      result.should.eql('foo bar test content');
    });
  });

  it('register() - async block', function() {
    var tag = new Tag();

    tag.register('test', function(args, content) {
      return Promise.resolve(args.join(' ') + ' ' + content);
    }, {ends: true, async: true});

    var str = [
      '{% test foo bar %}',
      'test content',
      '{% endtest %}'
    ].join('\n');

    return tag.render(str).then(function(result) {
      result.should.eql('foo bar test content');
    });
  });

  it('register() - nested test', function() {
    var tag = new Tag();

    tag.register('test', function(args, content) {
      return content;
    }, true);

    var str = [
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
    ].join('\n');

    return tag.render(str).then(function(result) {
      result.replace(/\s/g, '').should.eql('123456rawtest789012');
    });
  });

  it('register() - strip indention', function() {
    var tag = new Tag();

    tag.register('test', function(args, content) {
      return content;
    }, true);

    var str = [
      '{% test %}',
      '  test content',
      '{% endtest %}'
    ].join('\n');

    return tag.render(str).then(function(result) {
      result.should.eql('test content');
    });
  });

  it('register() - async callback', function() {
    var tag = new Tag();

    tag.register('test', function(args, content, callback) {
      callback(null, args.join(' '));
    }, {async: true});

    return tag.render('{% test foo bar %}').then(function(result) {
      result.should.eql('foo bar');
    });
  });

  it('register() - name is required', function() {
    var errorCallback = sinon.spy(function(err) {
      err.should.have.property('message', 'name is required');
    });

    try {
      tag.register();
    } catch (err) {
      errorCallback(err);
    }

    errorCallback.calledOnce.should.be.true;
  });

  it('register() - fn must be a function', function() {
    var errorCallback = sinon.spy(function(err) {
      err.should.have.property('message', 'fn must be a function');
    });

    try {
      tag.register('test');
    } catch (err) {
      errorCallback(err);
    }

    errorCallback.calledOnce.should.be.true;
  });

  it('render() - context', function() {
    var tag = new Tag();

    tag.register('test', function() {
      return this.foo;
    });

    return tag.render('{% test %}', {foo: 'bar'}).then(function(result) {
      result.should.eql('bar');
    });
  });
});
