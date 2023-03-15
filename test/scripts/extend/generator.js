'use strict';

describe('Generator', () => {
  const Generator = require('../../../dist/extend/generator');

  it('register()', () => {
    const g = new Generator();

    // name, fn
    g.register('test', () => {});

    g.get('test').should.exist;

    // fn
    g.register(() => {});

    g.get('generator-0').should.exist;

    // no fn
    should.throw(() => g.register('test'), TypeError, 'fn must be a function');
  });

  it('register() - promisify', async () => {
    const g = new Generator();

    g.register('test', (locals, render, callback) => {
      callback(null, 'foo');
    });

    const result = await g.get('test')({}, {});
    result.should.eql('foo');
  });

  it('get()', () => {
    const g = new Generator();

    g.register('test', () => {});

    g.get('test').should.exist;
  });

  it('list()', () => {
    const g = new Generator();

    g.register('test', () => {});

    g.list().should.have.all.keys(['test']);
  });
});
