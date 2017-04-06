var should = require('chai').should(); // eslint-disable-line

describe('Generator', () => {
  var Generator = require('../../../lib/extend/generator');

  it('register()', () => {
    var g = new Generator();

    // name, fn
    g.register('test', () => {});

    g.get('test').should.exist;

    // fn
    g.register(() => {});

    g.get('generator-0').should.exist;

    // no fn
    try {
      g.register('test');
    } catch (err) {
      err.should.be
        .instanceOf(TypeError)
        .property('message', 'fn must be a function');
    }
  });

  it('register() - promisify', () => {
    var g = new Generator();

    g.register('test', (locals, render, callback) => {
      callback(null, 'foo');
    });

    g.get('test')({}, {}).then(result => {
      result.should.eql('foo');
    });
  });

  it('get()', () => {
    var g = new Generator();

    g.register('test', () => {});

    g.get('test').should.exist;
  });

  it('list()', () => {
    var g = new Generator();

    g.register('test', () => {});

    g.list().should.have.keys(['test']);
  });
});
