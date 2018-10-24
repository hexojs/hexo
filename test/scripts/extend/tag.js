'use strict';

const sinon = require('sinon');
const Promise = require('bluebird');

describe('Tag', () => {
  const Tag = require('../../../lib/extend/tag');
  const tag = new Tag();

  it('register()', () => {
    const tag = new Tag();

    tag.register('test', (args, content) => args.join(' '));

    return tag.render('{% test foo.bar | abcdef > fn(a, b, c) < fn() %}').then(result => {
      result.should.eql('foo.bar | abcdef > fn(a, b, c) < fn()');
    });
  });

  it('register() - async', () => {
    const tag = new Tag();

    tag.register('test', (args, content) => Promise.resolve(args.join(' ')), {async: true});

    return tag.render('{% test foo bar %}').then(result => {
      result.should.eql('foo bar');
    });
  });

  it('register() - block', () => {
    const tag = new Tag();

    tag.register('test', (args, content) => args.join(' ') + ' ' + content, true);

    const str = [
      '{% test foo bar %}',
      'test content',
      '{% endtest %}'
    ].join('\n');

    return tag.render(str).then(result => {
      result.should.eql('foo bar test content');
    });
  });

  it('register() - async block', () => {
    const tag = new Tag();

    tag.register('test', (args, content) => Promise.resolve(args.join(' ') + ' ' + content), {ends: true, async: true});

    const str = [
      '{% test foo bar %}',
      'test content',
      '{% endtest %}'
    ].join('\n');

    return tag.render(str).then(result => {
      result.should.eql('foo bar test content');
    });
  });

  it('register() - nested test', () => {
    const tag = new Tag();

    tag.register('test', (args, content) => content, true);

    const str = [
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
    const tag = new Tag();

    tag.register('test', (args, content) => content, {ends: true, async: true});
    tag.register('async', (args, content) => {
      return Promise.resolve(args.join(' ') + ' ' + content);
    }, {ends: true, async: true});

    const str = [
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
    const tag = new Tag();

    tag.register('test', (args, content) => content, true);

    const str = [
      '{% test %}',
      '  test content',
      '{% endtest %}'
    ].join('\n');

    return tag.render(str).then(result => {
      result.should.eql('test content');
    });
  });

  it('register() - async callback', () => {
    const tag = new Tag();

    tag.register('test', (args, content, callback) => {
      callback(null, args.join(' '));
    }, {async: true});

    return tag.render('{% test foo bar %}').then(result => {
      result.should.eql('foo bar');
    });
  });

  it('register() - name is required', () => {
    const errorCallback = sinon.spy(err => {
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
    const errorCallback = sinon.spy(err => {
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
    const tag = new Tag();

    tag.register('test', function() {
      return this.foo;
    });

    return tag.render('{% test %}', {foo: 'bar'}).then(result => {
      result.should.eql('bar');
    });
  });
});
