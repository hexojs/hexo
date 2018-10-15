const should = require('chai').should(); // eslint-disable-line

describe('Generator', () => {
  const Generator = require('../../../lib/extend/generator');

  it('register()', () => {
    const g = new Generator();

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
    const g = new Generator();

    g.register('test', (locals, render, callback) => {
      callback(null, 'foo');
    });

    g.get('test')({}, {}).then(result => {
      result.should.eql('foo');
    });
  });

  it('get()', () => {
    const g = new Generator();

    g.register('test', () => {});

    g.get('test').should.exist;
  });

  it('list()', () => {
    const g = new Generator();

    g.register('test', () => {});

    g.list().should.have.keys(['test']);
  });
});
