var should = require('chai').should(); // eslint-disable-line

describe('Helper', () => {
  var Helper = require('../../../lib/extend/helper');

  it('register()', () => {
    var h = new Helper();

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
    var h = new Helper();

    h.register('test', () => {});

    h.list().should.have.keys(['test']);
  });

  it('get()', () => {
    var h = new Helper();

    h.register('test', () => {});

    h.get('test').should.exist;
  });
});
