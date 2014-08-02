var should = require('chai').should(),
  fs = require('graceful-fs'),
  async = require('async'),
  pathFn = require('path'),
  file = require('../../../lib/util/file2');

var check = function(args, results, callback){
  args.push(function(err, path, content){
    if (err) return callback(err);

    async.parallel([
      // Check the content of post
      function(next){
        fs.readFile(results.path, 'utf8', function(err, post){
          if (err) return next(err);

          post.should.eql(content);
          next();
        });
      },
      // Check whether the draft was deleted
      function(next){
        fs.exists(path, function(exist){
          exist.should.be.false;
          next();
        });
      }
    ], function(err){
      callback(err, {
        path: path,
        content: content
      });
    });
  });

  hexo.post.publish.apply(hexo, args);
};

describe('publish', function(){
  var posts = [];

  beforeEach(function(done){
    hexo.post.create({
      title: 'Draft Test',
      slug: 'draft-test',
      layout: 'draft'
    }, done);
  });

  it('normal', function(done){
    var data = {
      slug: 'draft-test'
    };

    var results = {
      path: pathFn.join(hexo.source_dir, '_posts', 'draft-test.md')
    };

    posts.push(results.path);
    check([data], results, done);
  });

  it('custom layout', function(done){
    var data = {
      slug: 'draft-test',
      layout: 'photo'
    };

    var results = {
      path: pathFn.join(hexo.source_dir, '_posts', 'draft-test.md')
    };

    posts.push(results.path);
    check([data], results, function(err, data){
      if (err) return done(err);

      hexo.util.yfm(data.content).layout.should.eql('photo');
      done();
    });
  });

  it('rename duplicated files', function(done){
    async.series([
      function(next){
        hexo.post.create({slug: 'draft-test'}, function(err, path, content){
          if (err) return next(err);

          posts.push(path);
          next();
        });
      },
      function(next){
        var data = {
          slug: 'draft-test'
        };

        var results = {
          path: pathFn.join(hexo.source_dir, '_posts', 'draft-test-1.md')
        };

        posts.push(results.path);
        check([data], results, next);
      }
    ], done);
  });

  it('replace duplicated files', function(done){
    async.series([
      function(next){
        hexo.post.create({slug: 'draft-test'}, function(err, path, content){
          if (err) return next(err);

          posts.push(path);
          next();
        });
      },
      function(next){
        var data = {
          slug: 'draft-test'
        };

        var results = {
          path: pathFn.join(hexo.source_dir, '_posts', 'draft-test.md')
        };

        check([data, true], results, next);
      }
    ], done);
  });

  it('asset folder', function(done){
    hexo.config.post_asset_folder = true;

    var fixtureDir = pathFn.join(__dirname, 'assets'),
      fixtureList = [];

    async.series([
      function(next){
        file.list(fixtureDir, function(err, files){
          if (err) return next(err);

          var assetDir = pathFn.join(hexo.source_dir, '_drafts', 'draft-test');
          fixtureList = files;

          async.each(files, function(item, next){
            file.copyFile(pathFn.join(fixtureDir, item), pathFn.join(assetDir, item), next);
          }, next);
        });
      },
      // Publish the draft
      function(next){
        var data = {
          slug: 'draft-test'
        };

        var results = {
          path: pathFn.join(hexo.source_dir, '_posts', 'draft-test.md')
        };

        posts.push(results.path);
        check([data], results, next);
      },
      // Check assets
      function(next){
        var assetDir = pathFn.join(hexo.source_dir, '_posts', 'draft-test');
        hexo.config.post_asset_folder = false;

        async.each(fixtureList, function(item, next){
          async.map([
            pathFn.join(fixtureDir, item),
            pathFn.join(assetDir, item)
          ], fs.readFile, function(err, results){
            if (err) return next(err);

            results[0].should.eql(results[1]);
            posts.push(pathFn.join(assetDir, item));
            next();
          });
        }, next);
      }
    ], done);
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