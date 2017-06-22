var should = require('chai').should(); // eslint-disable-line
var sinon = require('sinon');
var Promise = require('bluebird');

describe('Tag', () => {
  var Tag = require('../../../lib/extend/tag');
  var tag = new Tag();

  it('register()', () => {
    var tag = new Tag();

    tag.register('test', (args, content) => args.join(' '));

    return tag.render('{% test foo.bar | abcdef > fn(a, b, c) < fn() %}').then(result => {
      result.should.eql('foo.bar | abcdef > fn(a, b, c) < fn()');
    });
  });

  it('register() - async', () => {
    var tag = new Tag();

    tag.register('test', (args, content) => Promise.resolve(args.join(' ')), {async: true});

    return tag.render('{% test foo bar %}').then(result => {
      result.should.eql('foo bar');
    });
  });

  it('register() - block', () => {
    var tag = new Tag();

    tag.register('test', (args, content) => args.join(' ') + ' ' + content, true);

    var str = [
      '{% test foo bar %}',
      'test content',
      '{% endtest %}'
    ].join('\n');

    return tag.render(str).then(result => {
      result.should.eql('foo bar test content');
    });
  });

  it('register() - async block', () => {
    var tag = new Tag();

    tag.register('test', (args, content) => Promise.resolve(args.join(' ') + ' ' + content), {ends: true, async: true});

    var str = [
      '{% test foo bar %}',
      'test content',
      '{% endtest %}'
    ].join('\n');

    return tag.render(str).then(result => {
      result.should.eql('foo bar test content');
    });
  });

  it('register() - nested test', () => {
    var tag = new Tag();

    tag.register('test', (args, content) => content, true);

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

    return tag.render(str).then(result => {
      result.replace(/\s/g, '').should.eql('123456rawtest789012');
    });
  });

  it('register() - nested async / async test', () => {
    var tag = new Tag();

    tag.register('test', (args, content) => content, {ends: true, async: true});
    tag.register('async', (args, content) => {
      return Promise.resolve(args.join(' ') + ' ' + content);
    }, {ends: true, async: true});

    var str = [
      '{% test %}',
      '123456',
      '  {% async %}',
      '  async',
      '  {% endasync %}',
      '789012',
      '{% endtest %}'
    ].join('\n');

    return tag.render(str).then(result => {
      result.replace(/\s/g, '').should.eql('123456async789012');
    });
  });

  it('register() - strip indention', () => {
    var tag = new Tag();

    tag.register('test', (args, content) => content, true);

    var str = [
      '{% test %}',
      '  test content',
      '{% endtest %}'
    ].join('\n');

    return tag.render(str).then(result => {
      result.should.eql('test content');
    });
  });

  it('register() - async callback', () => {
    var tag = new Tag();

    tag.register('test', (args, content, callback) => {
      callback(null, args.join(' '));
    }, {async: true});

    return tag.render('{% test foo bar %}').then(result => {
      result.should.eql('foo bar');
    });
  });

  it('register() - name is required', () => {
    var errorCallback = sinon.spy(err => {
      err.should.have.property('message', 'name is required');
    });

    try {
      tag.register();
    } catch (err) {
      errorCallback(err);
    }

    errorCallback.calledOnce.should.be.true;
  });

  it('register() - fn must be a function', () => {
    var errorCallback = sinon.spy(err => {
      err.should.have.property('message', 'fn must be a function');
    });

    try {
      tag.register('test');
    } catch (err) {
      errorCallback(err);
    }

    errorCallback.calledOnce.should.be.true;
  });

  it('render() - context', () => {
    var tag = new Tag();

    tag.register('test', function() {
      return this.foo;
    });

    return tag.render('{% test %}', {foo: 'bar'}).then(result => {
      result.should.eql('bar');
    });
  });
});
