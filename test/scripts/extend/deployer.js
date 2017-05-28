var should = require('chai').should(); // eslint-disable-line

describe('Deployer', () => {
  var Deployer = require('../../../lib/extend/deployer');

  it('register()', () => {
    var d = new Deployer();

    // name, fn
    d.register('test', () => {});

    d.get('test').should.exist;

    // no name
    try {
      d.register();
    } catch (err) {
      err.should.be
        .instanceOf(TypeError)
        .property('message', 'name is required');
    }

    // no fn
    try {
      d.register('test');
    } catch (err) {
      err.should.be
        .instanceOf(TypeError)
        .property('message', 'fn must be a function');
    }
  });

  it('register() - promisify', () => {
    var d = new Deployer();

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
    var d = new Deployer();

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
    var d = new Deployer();

    d.register('test', () => {});

    d.list().should.have.keys(['test']);
  });

  it('get()', () => {
    var d = new Deployer();

    d.register('test', () => {});

    d.get('test').should.exist;
  });
});
