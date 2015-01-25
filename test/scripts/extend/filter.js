var should = require('chai').should();
var sinon = require('sinon');

describe('Filter', function(){
  var Filter = require('../../../lib/extend/filter');

  it('register()', function(){
    var f = new Filter();

    // type, fn
    f.register('test', function(){});
    f.list('test')[0].should.exist;
    f.list('test')[0].priority.should.eql(10);

    // type, fn, priority
    f.register('test2', function(){}, 50);
    f.list('test2')[0].priority.should.eql(50);

    // fn
    f.register(function(){});
    f.list('after_post_render')[0].should.exist;
    f.list('after_post_render')[0].priority.should.eql(10);

    // fn, priority
    f.register(function(){}, 50);
    f.list('after_post_render')[1].priority.should.eql(50);

    // no fn
    try {
      f.register();
    } catch (err){
      err.should.be
        .instanceOf(TypeError)
        .property('message', 'fn must be a function');
    }
  });

  it('register() - type alias', function(){
    var f = new Filter();

    // pre
    f.register('pre', function(){});
    f.list('before_post_render')[0].should.exist;

    // post
    f.register('post', function(){});
    f.list('after_post_render')[0].should.exist;
  });

  it('register() - priority', function(){
    var f = new Filter();

    f.register('test', function(){});
    f.register('test', function(){}, 5);
    f.register('test', function(){}, 15);

    f.list('test').map(function(item){
      return item.priority;
    }).should.eql([5, 10, 15]);
  });

  it('unregister()', function(){
    var f = new Filter();
    var filter = sinon.spy();

    f.register('test', filter);
    f.unregister('test', filter);

    return f.exec('test').then(function(){
      filter.called.should.be.false;
    });
  });

  it('unregister() - type is required', function(){
    var f = new Filter();

    try {
      f.unregister();
    } catch (err){
      err.should.have.property('message', 'type is required');
    }
  });

  it('unregister() - fn must be a function', function(){
    var f = new Filter();

    try {
      f.unregister('test');
    } catch (err){
      err.should.have.property('message', 'fn must be a function');
    }
  });

  it('list()', function(){
    var f = new Filter();

    f.register('test', function(){});
    f.list('test')[0].should.exist;
    f.list('foo').length.should.eql(0);
  });

  it('exec()', function(){
    var f = new Filter();

    var filter1 = sinon.spy(function(data){
      data.should.eql('');
      return data + 'foo';
    });

    var filter2 = sinon.spy(function(data){
      filter1.calledOnce.should.be.true;
      data.should.eql('foo');
      return data + 'bar';
    });

    f.register('test', filter1);
    f.register('test', filter2);

    return f.exec('test', '').then(function(data){
      filter1.calledOnce.should.be.true;
      filter2.calledOnce.should.be.true;
      data.should.eql('foobar');
    });
  });

  it('exec() - pointer', function(){
    var f = new Filter();

    var filter1 = sinon.spy(function(data){
      data.should.eql({});
      data.foo = 1;
    });

    var filter2 = sinon.spy(function(data){
      filter1.calledOnce.should.be.true;
      data.should.eql({foo: 1});
      data.bar = 2;
    });

    f.register('test', filter1);
    f.register('test', filter2);

    return f.exec('test', {}).then(function(data){
      filter1.calledOnce.should.be.true;
      filter2.calledOnce.should.be.true;
      data.should.eql({foo: 1, bar: 2});
    });
  });

  it('exec() - args', function(){
    var f = new Filter();

    var filter1 = sinon.spy(function(data, arg1, arg2){
      arg1.should.eql(1);
      arg2.should.eql(2);
    });

    var filter2 = sinon.spy(function(data, arg1, arg2){
      arg1.should.eql(1);
      arg2.should.eql(2);
    });

    f.register('test', filter1);
    f.register('test', filter2);

    return f.exec('test', {}, {
      args: [1, 2]
    }).then(function(){
      filter1.calledOnce.should.be.true;
      filter2.calledOnce.should.be.true;
    });
  });

  it('exec() - context', function(){
    var f = new Filter();
    var ctx = {foo: 1, bar: 2};

    var filter1 = sinon.spy(function(data){
      this.should.eql(ctx);
    });

    var filter2 = sinon.spy(function(data){
      this.should.eql(ctx);
    });

    f.register('test', filter1);
    f.register('test', filter2);

    return f.exec('test', {}, {context: ctx}).then(function(){
      filter1.calledOnce.should.be.true;
      filter2.calledOnce.should.be.true;
    });
  });

  it('execSync()', function(){
    var f = new Filter();

    var filter1 = sinon.spy(function(data){
      data.should.eql('');
      return data + 'foo';
    });

    var filter2 = sinon.spy(function(data){
      filter1.calledOnce.should.be.true;
      data.should.eql('foo');
      return data + 'bar';
    });

    f.register('test', filter1);
    f.register('test', filter2);

    f.execSync('test', '').should.eql('foobar');
    filter1.calledOnce.should.be.true;
    filter2.calledOnce.should.be.true;
  });

  it('execSync() - pointer', function(){
    var f = new Filter();

    var filter1 = sinon.spy(function(data){
      data.should.eql({});
      data.foo = 1;
    });

    var filter2 = sinon.spy(function(data){
      filter1.calledOnce.should.be.true;
      data.should.eql({foo: 1});
      data.bar = 2;
    });

    f.register('test', filter1);
    f.register('test', filter2);

    f.execSync('test', {}).should.eql({foo: 1, bar: 2});
    filter1.calledOnce.should.be.true;
    filter2.calledOnce.should.be.true;
  });

  it('execSync() - args', function(){
    var f = new Filter();

    var filter1 = sinon.spy(function(data, arg1, arg2){
      arg1.should.eql(1);
      arg2.should.eql(2);
    });

    var filter2 = sinon.spy(function(data, arg1, arg2){
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

  it('execSync() - context', function(){
    var f = new Filter();
    var ctx = {foo: 1, bar: 2};

    var filter1 = sinon.spy(function(data){
      this.should.eql(ctx);
    });

    var filter2 = sinon.spy(function(data){
      this.should.eql(ctx);
    });

    f.register('test', filter1);
    f.register('test', filter2);

    f.execSync('test', {}, {context: ctx});
    filter1.calledOnce.should.be.true;
    filter2.calledOnce.should.be.true;
  });
});