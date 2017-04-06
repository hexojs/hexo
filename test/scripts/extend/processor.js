var should = require('chai').should(); // eslint-disable-line

describe('Processor', () => {
  var Processor = require('../../../lib/extend/processor');

  it('register()', () => {
    var p = new Processor();

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
    var p = new Processor();

    p.register('test', () => {});

    p.list().length.should.eql(1);
  });
});
