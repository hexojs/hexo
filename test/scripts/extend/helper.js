'use strict';

describe('Helper', () => {
  const Helper = require('../../../lib/extend/helper');
  let h;

  beforeEach(() => {
    h = new Helper();
  });

  it('register()', () => {
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
    h.register('test', () => {});

    h.list().should.have.keys(['test']);
  });

  it('get()', () => {
    h.register('test', () => {});

    h.get('test').should.exist;
  });

  it('setProp()', () => {
    // name prop
    h.setProp('foo', 'bar');

    h.prop.foo.should.eql('bar');

    // no name
    try {
      h.setProp();
    } catch (err) {
      err.should.be
        .instanceOf(TypeError)
        .property('message', 'name is required');
    }

    // no prop
    try {
      h.setProp('test');
    } catch (err) {
      err.should.be
        .instanceOf(TypeError)
        .property('message', 'prop is required');
    }
  });

  it('getProp()', () => {
    h.setProp('foo', 'bar');

    h.getProp('foo').should.eql('bar');
  });
});
