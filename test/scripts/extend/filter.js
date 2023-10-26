'use strict';

const { spy } = require('sinon');

describe('Filter', () => {
  const Filter = require('../../../dist/extend/filter');

  it('register()', () => {
    const f = new Filter();

    // type, fn
    f.register('test', () => {});

    f.list('test')[0].should.exist;
    f.list('test')[0].priority.should.eql(10);

    // type, fn, priority
    f.register('test2', () => {}, 50);

    f.list('test2')[0].priority.should.eql(50);

    // fn
    f.register(() => {});

    f.list('after_post_render')[0].should.exist;
    f.list('after_post_render')[0].priority.should.eql(10);

    // fn, priority
    f.register(() => {}, 50);

    f.list('after_post_render')[1].priority.should.eql(50);

    // no fn
    should.throw(() => f.register(), TypeError, 'fn must be a function');
  });

  it('register() - type alias', () => {
    const f = new Filter();

    // pre
    f.register('pre', () => {});

    f.list('before_post_render')[0].should.exist;

    // post
    f.register('post', () => {});

    f.list('after_post_render')[0].should.exist;
  });

  it('register() - priority', () => {
    const f = new Filter();

    f.register('test', () => {});

    f.register('test', () => {}, 5);

    f.register('test', () => {}, 15);

    f.list('test').map(item => item.priority).should.eql([5, 10, 15]);
  });

  it('unregister()', async () => {
    const f = new Filter();
    const filter = spy();

    f.register('test', filter);
    f.unregister('test', filter);

    await f.exec('test');
    filter.called.should.be.false;
  });

  it('unregister() - type is required', () => {
    const f = new Filter();
    should.throw(() => f.unregister(), 'type is required');
  });

  it('unregister() - fn must be a function', () => {
    const f = new Filter();
    should.throw(() => f.unregister('test'), 'fn must be a function');
  });

  it('list()', () => {
    const f = new Filter();

    f.register('test', () => {});

    f.list().test.should.exist;
    f.list('test')[0].should.exist;
    f.list('foo').should.have.lengthOf(0);
  });

  it('exec()', async () => {
    const f = new Filter();

    const filter1 = spy(data => {
      data.should.eql('');
      return data + 'foo';
    });

    const filter2 = spy(data => {
      data.should.eql('foo');
      return data + 'bar';
    });

    f.register('test', filter1);
    f.register('test', filter2);

    const data = await f.exec('test', '');
    filter1.calledOnce.should.be.true;
    filter2.calledOnce.should.be.true;
    filter2.calledAfter(filter1).should.be.true;
    data.should.eql('foobar');
  });

  it('exec() - pointer', async () => {
    const f = new Filter();

    const filter1 = spy(data => {
      data.should.eql({});
      data.foo = 1;
    });

    const filter2 = spy(data => {
      data.should.eql({foo: 1});
      data.bar = 2;
    });

    f.register('test', filter1);
    f.register('test', filter2);

    const data = await f.exec('test', {});
    filter1.calledOnce.should.be.true;
    filter2.calledOnce.should.be.true;
    filter2.calledAfter(filter1).should.be.true;
    data.should.eql({ foo: 1, bar: 2 });
  });

  it('exec() - args', async () => {
    const f = new Filter();

    const filter1 = spy((data, arg1, arg2) => {
      arg1.should.eql(1);
      arg2.should.eql(2);
    });

    const filter2 = spy((data, arg1, arg2) => {
      arg1.should.eql(1);
      arg2.should.eql(2);
    });

    f.register('test', filter1);
    f.register('test', filter2);

    await f.exec('test', {}, {
      args: [1, 2]
    });
    filter1.calledOnce.should.be.true;
    filter2.calledOnce.should.be.true;
  });

  it('exec() - context', async () => {
    const f = new Filter();
    const ctx = {foo: 1, bar: 2};

    const filter1 = spy();
    const filter2 = spy();

    f.register('test', filter1);
    f.register('test', filter2);

    await f.exec('test', {}, { context: ctx });
    filter1.alwaysCalledOn(ctx).should.be.true;
    filter2.alwaysCalledOn(ctx).should.be.true;
    filter1.calledOnce.should.be.true;
    filter2.calledOnce.should.be.true;
  });

  it('execSync()', () => {
    const f = new Filter();

    const filter1 = spy(data => {
      data.should.eql('');
      return data + 'foo';
    });

    const filter2 = spy(data => {
      data.should.eql('foo');
      return data + 'bar';
    });

    f.register('test', filter1);
    f.register('test', filter2);

    f.execSync('test', '').should.eql('foobar');
    filter1.calledOnce.should.be.true;
    filter2.calledOnce.should.be.true;
    filter2.calledAfter(filter1).should.be.true;
  });

  it('execSync() - pointer', () => {
    const f = new Filter();

    const filter1 = spy(data => {
      data.should.eql({});
      data.foo = 1;
    });

    const filter2 = spy(data => {
      data.should.eql({foo: 1});
      data.bar = 2;
    });

    f.register('test', filter1);
    f.register('test', filter2);

    f.execSync('test', {}).should.eql({foo: 1, bar: 2});
    filter1.calledOnce.should.be.true;
    filter2.calledOnce.should.be.true;
    filter2.calledAfter(filter1).should.be.true;
  });

  it('execSync() - args', () => {
    const f = new Filter();

    const filter1 = spy((data, arg1, arg2) => {
      arg1.should.eql(1);
      arg2.should.eql(2);
    });

    const filter2 = spy((data, arg1, arg2) => {
      arg1.should.eql(1);
      arg2.should.eql(2);
    });

    f.register('test', filter1);
    f.register('test', filter2);

    f.execSync('test', {}, {
      args: [1, 2]
    });

    filter1.calledOnce.should.be.true;
    filter2.calledOnce.should.be.true;
  });

  it('execSync() - context', () => {
    const f = new Filter();
    const ctx = {foo: 1, bar: 2};

    const filter1 = spy();
    const filter2 = spy();

    f.register('test', filter1);
    f.register('test', filter2);

    f.execSync('test', {}, {context: ctx});
    filter1.alwaysCalledOn(ctx).should.be.true;
    filter2.alwaysCalledOn(ctx).should.be.true;
    filter1.calledOnce.should.be.true;
    filter2.calledOnce.should.be.true;
  });
});
