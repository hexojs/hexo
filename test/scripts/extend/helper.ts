import Helper from '../../../lib/extend/helper';
import chai from 'chai';
const should = chai.should();

describe('Helper', () => {
  it('register()', () => {
    const h = new Helper();

    // name, fn
    h.register('test', () => '');

    h.get('test').should.exist;

    // no fn
    // @ts-ignore
    should.throw(() => h.register('test'), TypeError, 'fn must be a function');

    // no name
    // @ts-ignore
    should.throw(() => h.register(), TypeError, 'name is required');
  });

  it('list()', () => {
    const h = new Helper();

    h.register('test', () => '');

    h.list().should.have.all.keys(['test']);
  });

  it('get()', () => {
    const h = new Helper();

    h.register('test', () => '');

    h.get('test').should.exist;
  });
});
