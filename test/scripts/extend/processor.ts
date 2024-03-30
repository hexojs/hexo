import Processor from '../../../lib/extend/processor';
import chai from 'chai';
const should = chai.should();

describe('Processor', () => {
  it('register()', () => {
    const p = new Processor();

    // pattern, fn
    p.register('test', () => {});

    p.list()[0].should.exist;

    // fn
    p.register(() => {});

    p.list()[1].should.exist;

    // more than one arg
    // @ts-ignore
    p.register((a, b) => {});

    p.list()[1].should.exist;

    // no fn
    // @ts-ignore
    should.throw(() => p.register(), TypeError, 'fn must be a function');
  });

  it('list()', () => {
    const p = new Processor();

    p.register('test', () => {});

    p.list().should.have.lengthOf(1);
  });
});
