const should = require('chai').should(); // eslint-disable-line

describe('Processor', () => {
  const Processor = require('../../../lib/extend/processor');

  it('register()', () => {
    const p = new Processor();

    // pattern, fn
    p.register('test', () => {});

    p.list()[0].should.exist;

    // fn
    p.register(() => {});

    p.list()[1].should.exist;

    // no fn
    try {
      p.register();
    } catch (err) {
      err.should.be
        .instanceOf(TypeError)
        .property('message', 'fn must be a function');
    }
  });

  it('list()', () => {
    const p = new Processor();

    p.register('test', () => {});

    p.list().length.should.eql(1);
  });
});
