'use strict';

describe('Deployer', () => {
  const Deployer = require('../../../dist/extend/deployer');

  it('register()', () => {
    const d = new Deployer();

    // name, fn
    d.register('test', () => {});

    d.get('test').should.exist;

    // no name
    should.throw(() => d.register(), TypeError, 'name is required');

    // no fn
    should.throw(() => d.register('test'), TypeError, 'fn must be a function');
  });

  it('register() - promisify', () => {
    const d = new Deployer();

    d.register('test', (args, callback) => {
      args.should.eql({foo: 'bar'});
      callback(null, 'foo');
    });

    d.get('test')({
      foo: 'bar'
    }).then(result => {
      result.should.eql('foo');
    });
  });

  it('register() - Promise.method', () => {
    const d = new Deployer();

    d.register('test', args => {
      args.should.eql({foo: 'bar'});
      return 'foo';
    });

    d.get('test')({
      foo: 'bar'
    }).then(result => {
      result.should.eql('foo');
    });
  });

  it('list()', () => {
    const d = new Deployer();

    d.register('test', () => {});

    d.list().should.have.all.keys(['test']);
  });

  it('get()', () => {
    const d = new Deployer();

    d.register('test', () => {});

    d.get('test').should.exist;
  });
});
