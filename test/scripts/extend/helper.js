'use strict';

describe('Helper', () => {
  const Helper = require('../../../dist/extend/helper');

  it('register()', () => {
    const h = new Helper();

    // name, fn
    h.register('test', () => {});

    h.get('test').should.exist;

    // no fn
    should.throw(() => h.register('test'), TypeError, 'fn must be a function');

    // no name
    should.throw(() => h.register(), TypeError, 'name is required');
  });

  it('list()', () => {
    const h = new Helper();

    h.register('test', () => {});

    h.list().should.have.all.keys(['test']);
  });

  it('get()', () => {
    const h = new Helper();

    h.register('test', () => {});

    h.get('test').should.exist;
  });
});
