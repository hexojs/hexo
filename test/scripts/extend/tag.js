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

  it('render() - ignore <pre><code>', function() {
    var str = '<pre><code>{{ helper.json() }}</code></pre>';

    return tag.render(str).then(function(result) {
      result.should.eql(str);
    });
  });

  it('render() - ignore <code>', function() {
    var str = '<code>{{ helper.json() }}</code>';

    return tag.render(str).then(function(result) {
      result.should.eql(str);
    });
  });

  it('render() - ignore mixed repeated <code>', function() {
    var str = `
aaa

{% test1 foo.jpg %}

<pre class=""><code>{{ helper.json1() }}</code></pre>

bbb

{% test2 foo2.jpg %}

ccc

<code>{{ helper.json2() }}</code>

{% test3 foo3.jpg %}

ddd

<code>{{ helper.json3() }}</code>

{% test4 foo4.jpg %}

<pre><code>{{ helper.json4() }}</code></pre>

eee

{% test5 foo5.jpg %}

fff
`;
    var expected = str.replace(/\{\% (test\d) (\S+) \%\}/g, '$1=$2');

    tag.register('test1', (args, content) => 'test1=' + args.join('='));
    tag.register('test2', (args, content) => 'test2=' + args.join('='));
    tag.register('test3', (args, content) => 'test3=' + args.join('='));
    tag.register('test4', (args, content) => 'test4=' + args.join('='));
    tag.register('test5', (args, content) => 'test5=' + args.join('='));

    return tag.render(str).then(function(result) {
      result.should.eql(expected);
    });
  });
});
