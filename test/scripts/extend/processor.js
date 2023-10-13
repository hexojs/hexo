'use strict';

describe('Processor', () => {
  const Processor = require('../../../dist/extend/processor');

  it('register()', () => {
    const p = new Processor();

    // pattern, fn
    p.register('test', () => {});

    p.list()[0].should.exist;

    // fn
    p.register(() => {});

    p.list()[1].should.exist;

    // more than one arg
    p.register((a, b) => {});

    p.list()[1].should.exist;

    // no fn
    should.throw(() => p.register(), TypeError, 'fn must be a function');
  });

  it('list()', () => {
    const p = new Processor();

    p.register('test', () => {});

    p.list().should.have.lengthOf(1);
  });
});
