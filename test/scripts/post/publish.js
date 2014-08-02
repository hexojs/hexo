var should = require('chai').should(),
  fs = require('graceful-fs'),
  async = require('async'),
  pathFn = require('path');

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
    posts.push(pathFn.join(hexo.source_dir, '_posts', 'draft-test.md'));

    hexo.post.publish({slug: 'draft-test'}, function(err, path, content){
      if (err) return done(err);

      path.should.eql(pathFn.join(hexo.source_dir, '_drafts', 'draft-test.md'));

      fs.readFile(posts[0], 'utf8', function(err, post){
        if (err) return done(err);

        post.should.eql(content);
        done();
      });
    });
  });

  it('custom layout', function(done){
    posts.push(pathFn.join(hexo.source_dir, '_posts', 'draft-test.md'));

    hexo.post.publish({
      slug: 'draft-test',
      layout: 'photo'
    }, function(err, path, content){
      if (err) return done(err);

      path.should.eql(pathFn.join(hexo.source_dir, '_drafts', 'draft-test.md'));
      hexo.util.yfm(content).layout.should.eql('photo');

      fs.readFile(posts[0], 'utf8', function(err, post){
        if (err) return done(err);

        post.should.eql(content);
        done();
      });
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
        hexo.post.publish({slug: 'draft-test'}, function(err, path, content){
          if (err) return next(err);

          path.should.eql(pathFn.join(hexo.source_dir, '_drafts', 'draft-test.md'));
          posts.push(pathFn.join(hexo.source_dir, '_posts', 'draft-test-1.md'));

          fs.readFile(posts[1], 'utf8', function(err, post){
            if (err) return done(err);

            post.should.eql(content);
            next();
          });
        });
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
        hexo.post.publish({slug: 'draft-test'}, true, function(err, path, content){
          if (err) return next(err);

          path.should.eql(pathFn.join(hexo.source_dir, '_drafts', 'draft-test.md'));

          fs.readFile(posts[0], 'utf8', function(err, post){
            if (err) return done(err);

            post.should.eql(content);
            next();
          });
        });
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