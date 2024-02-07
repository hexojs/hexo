import Generator from '../../../lib/extend/generator';
import chai from 'chai';
const should = chai.should();

describe('Generator', () => {
  it('register()', () => {
    const g = new Generator();

    // name, fn
    g.register('test', () => []);

    g.get('test').should.exist;

    // fn
    g.register(() => []);

    g.get('generator-0').should.exist;

    // no fn
    // @ts-ignore
    should.throw(() => g.register('test'), TypeError, 'fn must be a function');
  });

  it('register() - promisify', async () => {
    const g = new Generator();

    g.register('test', (_locals, callback) => {
      callback && callback(null, 'foo');
      return [];
    });

    const result = await g.get('test')({});
    result.should.eql('foo');
  });

  it('get()', () => {
    const g = new Generator();

    g.register('test', () => []);

    g.get('test').should.exist;
  });

  it('list()', () => {
    const g = new Generator();

    g.register('test', () => []);

    g.list().should.have.all.keys(['test']);
  });
});
