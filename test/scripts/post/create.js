var should = require('chai').should(),
  fs = require('graceful-fs'),
  async = require('async'),
  pathFn = require('path');

var check = function(args, results, callback){
  async.parallel([
    function(next){
      hexo.once('new', function(path, content){
        path.should.eql(results.path);
        next();
      });
    },
    function(next){
      args.push(function(err, path, content){
        if (err) return next(err);

        path.should.eql(results.path);

        next(null, {
          path: path,
          content: content
        });
      });

      hexo.post.create.apply(hexo, args);
    }
  ], function(err, results){
    callback(err, results[1]);
  });
};

describe('create', function(){
  var posts = [];

  it('default', function(done){
    var data = {
      title: 'Test Post'
    };

    var results = {
      path: pathFn.join(hexo.source_dir, '_posts', 'Test-Post.md')
    };

    posts.push(results.path);
    check([data], results, done);
  });

  it('slug', function(done){
    var data = {
      title: 'Test Post',
      slug: 'WTF'
    };

    var results = {
      path: pathFn.join(hexo.source_dir, '_posts', 'WTF.md')
    };

    posts.push(results.path);
    check([data], results, done);
  });

  it('path', function(done){
    var data = {
      title: 'Test Post',
      slug: 'WTF',
      path: 'mypath'
    };

    var results = {
      path: pathFn.join(hexo.source_dir, '_posts', 'mypath.md')
    };

    posts.push(results.path);
    check([data], results, done);
  });

  it('layout: post', function(done){
    var data = {
      title: 'Test Post',
      layout: 'post'
    };

    var results = {
      path: pathFn.join(hexo.source_dir, '_posts', 'Test-Post.md')
    };

    posts.push(results.path);
    check([data], results, done);
  });

  it('layout: page', function(done){
    var data = {
      title: 'Test Post',
      layout: 'page'
    };

    var results = {
      path: pathFn.join(hexo.source_dir, 'Test-Post', 'index.md')
    };

    posts.push(results.path);
    check([data], results, done);
  });

  it('layout: draft', function(done){
    var data = {
      title: 'Test Post',
      layout: 'draft'
    };

    var results = {
      path: pathFn.join(hexo.source_dir, '_drafts', 'Test-Post.md')
    };

    posts.push(results.path);
    check([data], results, done);
  });

  it('layout: photo', function(done){
    var data = {
      title: 'Test Post',
      layout: 'photo'
    };

    var results = {
      path: pathFn.join(hexo.source_dir, '_posts', 'Test-Post.md')
    };

    posts.push(results.path);
    check([data], results, function(err, data){
      if (err) return done(err);

      hexo.util.yfm(data.content).layout.should.eql('photo');
      done();
    });
  });

  it('customized default_layout', function(done){
    var data = {
      title: 'Test Post'
    };

    var results = {
      path: pathFn.join(hexo.source_dir, '_posts', 'Test-Post.md')
    };

    hexo.config.default_layout = 'hahaha';

    posts.push(results.path);
    check([data], results, function(err, data){
      if (err) return done(err);

      hexo.config.default_layout = 'post';
      hexo.util.yfm(data.content).layout.should.eql('hahaha');
      done();
    });
  });

  it('date', function(done){
    var date = new Date(2014, 7, 1);

    var data = {
      title: 'Test Post',
      date: date
    };

    var results = {
      path: pathFn.join(hexo.source_dir, '_posts', 'Test-Post.md')
    };

    posts.push(results.path);
    check([data], results, function(err, data){
      if (err) return done(err);

      hexo.util.yfm(data.content).date.should.eql(date);
      done();
    });
  });

  it('content', function(done){
    var content = 'hahaha';

    var data = {
      title: 'Test Post',
      content: content
    };

    var results = {
      path: pathFn.join(hexo.source_dir, '_posts', 'Test-Post.md')
    };

    posts.push(results.path);
    check([data], results, function(err, data){
      if (err) return done(err);

      hexo.util.yfm(data.content)._content.should.eql(content);
      done();
    });
  });

  it('rename duplicated files', function(done){
    var data = {
      title: 'Test Post'
    };

    async.series([
      function(next){
        var results = {
          path: pathFn.join(hexo.source_dir, '_posts', 'Test-Post.md')
        };

        posts.push(results.path);
        check([data], results, next);
      },
      function(next){
        var results = {
          path: pathFn.join(hexo.source_dir, '_posts', 'Test-Post-1.md')
        };

        posts.push(results.path);
        check([data], results, next);
      }
    ], done);
  });

  it('replace duplicated files', function(done){
    var data = {
      title: 'Test Post'
    };

    var results = {
      path: pathFn.join(hexo.source_dir, '_posts', 'Test-Post.md')
    };

    posts.push(results.path);

    async.series([
      function(next){
        check([data], results, next);
      },
      function(next){
        check([data, true], results, next);
      }
    ], done);
  });

  it('custom variables', function(done){
    var data = {
      title: 'Test Post',
      foo: 1,
      bar: 2
    };

    var results = {
      path: pathFn.join(hexo.source_dir, '_posts', 'Test-Post.md')
    };

    posts.push(results.path);
    check([data], results, function(err, data){
      if (err) return done(err);

      var yfm = hexo.util.yfm(data.content);
      yfm.foo.should.eql(1);
      yfm.bar.should.eql(2);

      done();
    });
  });

  it('build files based on a specified scaffold', function(done){
    var layout = 'custom',
      scaffold = '';

    async.series([
      // Read the fixture
      function(next){
        fs.readFile(pathFn.join(__dirname, 'scaffold.md'), 'utf8', function(err, content){
          if (err) return next(err);

          scaffold = content;
          next();
        });
      },
      // Create a scaffold
      function(next){
        hexo.scaffold.set(layout, scaffold, next);
      },
      // Create a post
      function(next){
        var data = {
          title: 'Test Post',
          layout: layout
        };

        var results = {
          path: pathFn.join(hexo.source_dir, '_posts', 'Test-Post.md')
        };

        posts.push(results.path);
        check([data], results, function(err, data){
          if (err) return done(err);

          var yfm = hexo.util.yfm(data.content);
          yfm.layout.should.eql('custom');
          yfm._content.should.eql('scaffold content');

          next();
        });
      },
      function(next){
        hexo.scaffold.remove(layout, next);
      }
    ], done);
  });

  it('asset folder', function(done){
    hexo.config.post_asset_folder = true;

    var data = {
      title: 'Test Post'
    };

    var results = {
      path: pathFn.join(hexo.source_dir, '_posts', 'Test-Post.md')
    };

    posts.push(results.path);
    check([data], results, function(err, data){
      if (err) return done(err);

      var assetFolder = data.path.substring(0, data.path.length - pathFn.extname(data.path).length);

      fs.exists(assetFolder, function(exist){
        hexo.config.post_asset_folder = false;
        exist.should.be.true;
        done();
      });
    });
  });

  afterEach(function(done){
    async.each(posts, function(post, next){
      fs.unlink(post, next);
    }, function(err){
      posts.length = 0;
      done(err);
    });
  });
});