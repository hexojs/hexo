import Migrator from '../../../lib/extend/migrator';
import chai from 'chai';
const should = chai.should();

describe('Migrator', () => {
  it('register()', () => {
    const d = new Migrator();

    // name, fn
    d.register('test', () => {});

    d.get('test').should.exist;

    // no name
    // @ts-ignore
    should.throw(() => d.register(), TypeError, 'name is required');

    // no fn
    // @ts-ignore
    should.throw(() => d.register('test'), TypeError, 'fn must be a function');
  });

  it('register() - promisify', () => {
    const d = new Migrator();

    d.register('test', (args, callback) => {
      args.should.eql({foo: 'bar'});
      callback && callback(null, 'foo');
    });

    d.get('test')({
      foo: 'bar'
    }).then(result => {
      result.should.eql('foo');
    });
  });

  it('register() - Promise.method', async () => {
    const d = new Migrator();

    d.register('test', args => {
      args.should.eql({foo: 'bar'});
      return 'foo';
    });

    const result = await d.get('test')({
      foo: 'bar'
    });

    result.should.eql('foo');
  });

  it('list()', () => {
    const d = new Migrator();

    d.register('test', () => {});

    d.list().should.have.all.keys(['test']);
  });

  it('get()', () => {
    const d = new Migrator();

    d.register('test', () => {});

    d.get('test').should.exist;
  });
});
