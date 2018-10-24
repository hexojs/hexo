'use strict';

describe('Helper', () => {
  const Helper = require('../../../lib/extend/helper');

  it('register()', () => {
    const h = new Helper();

    // name, fn
    h.register('test', () => {});

    h.get('test').should.exist;

    // no fn
    try {
      h.register('test');
    } catch (err) {
      err.should.be
        .instanceOf(TypeError)
        .property('message', 'fn must be a function');
    }

    // no name
    try {
      h.register();
    } catch (err) {
      err.should.be
        .instanceOf(TypeError)
        .property('message', 'name is required');
    }
  });

  it('list()', () => {
    const h = new Helper();

    h.register('test', () => {});

    h.list().should.have.keys(['test']);
  });

  it('get()', () => {
    const h = new Helper();

    h.register('test', () => {});

    h.get('test').should.exist;
  });
});
