var should = require('should'),
  Extend = require('../lib/extend');

describe('Extend', function(){
  var extend = new Extend();

  describe('console', function(){
    var Console = require('../lib/extend/console');

    before(function(){
      extend.module('console', Console);
      extend.console.should.be.instanceof(Console);
    });

    it('register', function(){
      // name, desc, options, fn
      extend.console.register('foo', 'foo desc', {}, function(){});
      should.exist(extend.console.store.foo);
      extend.console.store.foo.desc.should.eql('foo desc');
      extend.console.store.foo.options.should.eql({});

      // name, desc, fn
      extend.console.register('bar', 'bar desc', function(){});
      should.exist(extend.console.store.bar);
      extend.console.store.bar.desc.should.eql('bar desc');
      extend.console.store.bar.options.should.eql({});

      // name, options, fn
      extend.console.register('abc', {}, function(){});
      should.exist(extend.console.store.abc);
      extend.console.store.abc.desc.should.eql('');
      extend.console.store.abc.options.should.eql({});

      // name, fn
      extend.console.register('baz', function(){});
      should.exist(extend.console.store.baz);
      extend.console.store.baz.desc.should.eql('');
      extend.console.store.baz.options.should.eql({});
    });

    it('register error', function(){
      // name, desc, options
      (function(){
        extend.console.register('foo', 'foo desc', {});
      }).should.throw('Console function is not defined');

      // name, desc
      (function(){
        extend.console.register('foo', 'foo desc');
      }).should.throw('Console function is not defined');

      // name, options
      (function(){
        extend.console.register('foo', {});
      }).should.throw('Console function is not defined');
    });

    it('alias', function(){
      extend.console.register('version', {alias: 'v'}, function(){});
      extend.console.alias.v.should.eql(extend.console.store.version);
    });

    it('list', function(){
      extend.console.list().should.eql(extend.console.store);
    });

    it('get', function(){
      // normal
      should.exist(extend.console.get('foo'));

      // alias
      should.exist(extend.console.get('v'));

      // upper case
      should.exist(extend.console.get('BAR'));

      // not exist
      should.not.exist(extend.console.get('what'));
    });
  });

  describe('deployer', function(){
    var Deployer = require('../lib/extend/deployer');

    before(function(){
      extend.module('deployer', Deployer);
      extend.deployer.should.be.instanceof(Deployer);
    });

    it('register', function(){
      extend.deployer.register('foo', function(){});
      should.exist(extend.deployer.store.foo);
    });

    it('register error', function(){
      (function(){
        extend.deployer.register('bar');
      }).should.throw('Deployer function is not defined');
    });

    it('list', function(){
      extend.deployer.list().should.eql(extend.deployer.store);
    });
  });

  describe('filter', function(){
    var Filter = require('../lib/extend/filter');

    before(function(){
      extend.module('filter', Filter);
      extend.filter.should.be.instanceof(Filter);
    });

    it('register', function(){
      extend.filter.register(function(){});
      should.exist(extend.filter.store.post[0]);
    });

    it('register pre', function(){
      extend.filter.register('pre', function(){});
      should.exist(extend.filter.store.pre[0]);
    });

    it('register post', function(){
      extend.filter.register('post', function(){});
      should.exist(extend.filter.store.post[1]);
    });

    it('register error', function(){
      (function(){
        extend.filter.register();
      }).should.throw('Filter function is not defined');

      (function(){
        extend.filter.register('foo', function(){});
      }).should.throw('Filter type must be either pre or post');
    });

    it('list', function(){
      extend.filter.list().should.eql(extend.filter.store);
    });
  });

  describe('generator', function(){
    var Generator = require('../lib/extend/generator');

    before(function(){
      extend.module('generator', Generator);
      extend.generator.should.be.instanceof(Generator);
    });

    it('register', function(){
      extend.generator.register(function(){});
      should.exist(extend.generator.store[0]);
    });

    it('register error', function(){
      (function(){
        extend.generator.register();
      }).should.throw('Generator function is not defined');
    });

    it('list', function(){
      extend.generator.list().should.eql(extend.generator.store);
    });
  });

  describe('helper', function(){
    var Helper = require('../lib/extend/helper');

    before(function(){
      extend.module('helper', Helper);
      extend.helper.should.be.instanceof(Helper);
    });

    it('register', function(){
      extend.helper.register('foo', function(){});
      should.exist(extend.helper.store.foo);
    });

    it('register error', function(){
      (function(){
        extend.helper.register('bar');
      }).should.throw('Helper function is not defined');
    });

    it('list', function(){
      extend.helper.list().should.eql(extend.helper.store);
    });
  });

  describe('migrator', function(){
    var Migrator = require('../lib/extend/migrator');

    before(function(){
      extend.module('migrator', Migrator);
      extend.migrator.should.be.instanceof(Migrator);
    });

    it('register', function(){
      extend.migrator.register('foo', function(){});
      should.exist(extend.migrator.store.foo);
    });

    it('register error', function(){
      (function(){
        extend.migrator.register('bar');
      }).should.throw('Migrator function is not defined');
    });

    it('list', function(){
      extend.migrator.list().should.eql(extend.migrator.store);
    });
  });

  describe('processor', function(){
    var Processor = require('../lib/extend/processor');

    before(function(){
      extend.module('processor', Processor);
      extend.processor.should.be.instanceof(Processor);
    });

    it('register', function(){
      // rule, fn
      extend.processor.register(/posts\/(.*)/, function(){});
      should.exist(extend.processor.store[0]);
      extend.processor.store[0].pattern.should.eql(/posts\/(.*)/);
      extend.processor.store[0].params.should.eql([]);
      should.exist(extend.processor.store[0].fn);

      // fn
      extend.processor.register(function(){});
      should.exist(extend.processor.store[1]);
      extend.processor.store[1].pattern.should.eql(/(.*)/);
      extend.processor.store[1].params.should.eql([]);
      should.exist(extend.processor.store[1].fn);
    });

    it('register error', function(){
      (function(){
        extend.processor.register('foo');
      }).should.throw('Processor function is not defined');
    });

    it('list', function(){
      extend.processor.list().should.eql(extend.processor.store);
    });

    it('format', function(){
      // posts/:id
      var obj = extend.processor.format('posts/:id');
      obj.pattern.should.eql(/^posts\/([^\/]+)$/);
      obj.params.should.eql(['id']);

      var match = 'posts/123'.match(obj.pattern);
      match[1].should.eql('123');

      // users/:user_id/posts/:post_id
      var obj = extend.processor.format('users/:user_id/posts/:post_id');
      obj.pattern.should.eql(/^users\/([^\/]+)\/posts\/([^\/]+)$/);
      obj.params.should.eql(['user_id', 'post_id']);

      var match = 'users/foo/posts/bar'.match(obj.pattern);
      match[1].should.eql('foo');
      match[2].should.eql('bar');

      // files/*path
      var obj = extend.processor.format('files/*path');
      obj.pattern.should.eql(/^files\/(.*?)$/);
      obj.params.should.eql(['path']);

      var match = 'files/assets/test.jpg'.match(obj.pattern);
      match[1].should.eql('assets/test.jpg');
    });
  });

  describe('renderer', function(){
    var Renderer = require('../lib/extend/renderer');

    before(function(){
      extend.module('renderer', Renderer);
      extend.renderer.should.be.instanceof(Renderer);
    });

    it('register', function(){
      extend.renderer.register('foo', 'bar', function(){});
      should.exist(extend.renderer.store.foo);
      extend.renderer.store.foo.output.should.eql('bar');
    });

    it('register sync', function(){
      extend.renderer.register('baz', 'foo', function(){}, true);
      should.exist(extend.renderer.store.baz);
      should.exist(extend.renderer.storeSync.baz);
      extend.renderer.store.baz.output.should.eql('foo');
      extend.renderer.storeSync.baz.output.should.eql('foo');
    });

    it('register error', function(){
      (function(){
        extend.renderer.register('123', '456');
      }).should.throw('Renderer function is not defined');
    });

    it('list', function(){
      extend.renderer.list().should.eql(extend.renderer.store);
    });

    it('list sync', function(){
      extend.renderer.list(true).should.eql(extend.renderer.storeSync);
    });
  });

  describe('swig', function(){
    var Swig = require('../lib/extend/swig');

    before(function(){
      extend.module('swig', Swig);
      extend.swig.should.be.instanceof(Swig);
    });

    it('register', function(){
      extend.swig.register('foo', function(){});
      should.exist(extend.swig.store.foo);

      extend.swig.register('baz', function(){}, true);
      should.exist(extend.swig.store.baz);
      extend.swig.store.baz.ends.should.be.true;
    });

    it('register error', function(){
      (function(){
        extend.swig.register('bar');
      }).should.throw('Swig function is not defined');
    });

    it('list', function(){
      extend.swig.list().should.eql(extend.swig.store);
    });
  });

  describe('tag', function(){
    var Tag = require('../lib/extend/tag');

    before(function(){
      extend.module('tag', Tag);
      extend.tag.should.be.instanceof(Tag);
    });

    it('register', function(){
      extend.tag.register('foo', function(){});
      should.exist(extend.tag.store.foo);

      extend.tag.register('baz', function(){}, true);
      should.exist(extend.tag.store.baz);
      extend.tag.store.baz.ends.should.be.true;
    });

    it('register error', function(){
      (function(){
        extend.tag.register('bar');
      }).should.throw('Tag function is not defined');
    });

    it('list', function(){
      extend.tag.list().should.eql(extend.tag.store);
    });
  });
});