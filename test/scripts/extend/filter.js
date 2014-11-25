var should = require('chai').should();

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

  it('list()', function(){
    var f = new Filter();

    f.register('test', function(){});
    f.list('test')[0].should.exist;
    f.list('foo').length.should.eql(0);
  });

  it('exec()', function(){
    var f = new Filter();

    f.register('test', function(data){
      data.should.eql('');
      return data + 'foo';
    });

    f.register('test', function(data){
      data.should.eql('foo');
      return data + 'bar';
    });

    f.exec('test', '').then(function(data){
      data.should.eql('foobar');
    });
  });

  it('exec() - pointer', function(){
    var f = new Filter();

    f.register('test', function(data){
      data.should.eql({});
      data.foo = 1;
    });

    f.register('test', function(data){
      data.should.eql({foo: 1});
      data.bar = 2;
    });

    f.exec('test', {}).then(function(data){
      data.should.eql({foo: 1, bar: 2});
    });
  });

  it('exec() - args', function(){
    var f = new Filter();

    f.register('test', function(data, arg1, arg2){
      arg1.should.eql(1);
      arg2.should.eql(2);
    });

    f.register('test', function(data, arg1, arg2){
      arg1.should.eql(1);
      arg2.should.eql(2);
    });

    f.exec('test', {}, {
      args: [1, 2]
    });
  });

  it('exec() - context', function(){
    var f = new Filter();
    var ctx = {foo: 1, bar: 2};

    f.register('test', function(data){
      this.should.eql(ctx);
    });

    f.register('test', function(data){
      this.should.eql(ctx);
    });

    f.exec('test', {}, {context: ctx});
  });

  it('execSync()', function(){
    var f = new Filter();

    f.register('test', function(data){
      data.should.eql('');
      return data + 'foo';
    });

    f.register('test', function(data){
      data.should.eql('foo');
      return data + 'bar';
    });

    f.execSync('test', '').should.eql('foobar');
  });

  it('execSync() - pointer', function(){
    var f = new Filter();

    f.register('test', function(data){
      data.should.eql({});
      data.foo = 1;
    });

    f.register('test', function(data){
      data.should.eql({foo: 1});
      data.bar = 2;
    });

    f.execSync('test', {}).should.eql({foo: 1, bar: 2});
  });

  it('execSync() - args', function(){
    var f = new Filter();

    f.register('test', function(data, arg1, arg2){
      arg1.should.eql(1);
      arg2.should.eql(2);
    });

    f.register('test', function(data, arg1, arg2){
      arg1.should.eql(1);
      arg2.should.eql(2);
    });

    f.execSync('test', {}, {
      args: [1, 2]
    });
  });

  it('execSync() - context', function(){
    var f = new Filter();
    var ctx = {foo: 1, bar: 2};

    f.register('test', function(data){
      this.should.eql(ctx);
    });

    f.register('test', function(data){
      this.should.eql(ctx);
    });

    f.execSync('test', {}, {context: ctx});
  });
});