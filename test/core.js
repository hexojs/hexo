var spawn = require('child_process').spawn,
  async = require('async'),
  util = require('../lib/util'),
  file = util.file,
  coreDir = __dirname + '/../';

var regex = {
  post: /---\ntitle: (.*?)\ndate: \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\ntags:(.*)?\n---\n[\s\S]*/,
  page: /---\ntitle: (.*?)\ndate: \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\n---\n[\s\S]*/,
  normal: /---\nlayout: (.*?)\ntitle: (.*?)\ndate: \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\ntags:(.*)?\n---\n[\s\S]*/,
};

describe('Core', function(){
  describe('Initialize', function(){
    it('init', function(done){
      spawn('./bin/hexo', ['init', 'tmp']).on('exit', function(){
        done();
      });
    });

    it('check', function(done){
      async.parallel([
        // .gitignore
        function(next){
          file.read(coreDir + 'files/init/.gitignore', next);
        },
        function(next){
          file.read(coreDir + 'tmp/.gitignore', next);
        },
        // _config.yml
        function(next){
          file.read(coreDir + 'files/init/_config.yml', next);
        },
        function(next){
          file.read(coreDir + 'tmp/_config.yml', next);
        },
        // package.json
        function(next){
          file.read(coreDir + 'files/init/package.json', next);
        },
        function(next){
          file.read(coreDir + 'tmp/package.json', next);
        },
        // hello-world.md
        function(next){
          file.read(coreDir + 'tmp/source/_posts/hello-world.md', next);
        }
      ], function(err, results){
        if (err) throw err;
        results[0].should.equal(results[1]);
        results[2].should.equal(results[3]);
        results[4].should.equal(results[5]);
        results[6].should.match(regex.post);
        done();
      });
    });
  });

  describe('Create', function(){
    it('post', function(done){
      spawn('../bin/hexo', ['new', 'Test Post'], {cwd: coreDir + 'tmp'}).on('exit', function(){
        file.read(coreDir + 'tmp/source/_posts/test-post.md', function(err, content){
          if (err) throw err;
          content.should.match(regex.post);
          done();
        });
      });
    });

    it('page', function(done){
      spawn('../bin/hexo', ['new', 'page', 'Test Page'], {cwd: coreDir + 'tmp'}).on('exit', function(){
        file.read(coreDir + 'tmp/source/test-page/index.md', function(err, content){
          if (err) throw err;
          content.should.match(regex.page);
          done();
        });
      });
    });

    it('draft', function(done){
      spawn('../bin/hexo', ['new', 'draft', 'Test Draft'], {cwd: coreDir + 'tmp'}).on('exit', function(){
        file.read(coreDir + 'tmp/source/_drafts/test-draft.md', function(err, content){
          if (err) throw err;
          content.should.match(regex.post);
          done();
        });
      });
    });

    it('custom', function(done){
      spawn('../bin/hexo', ['new', 'custom', 'Test Post'], {cwd: coreDir + 'tmp'}).on('exit', function(){
        file.read(coreDir + 'tmp/source/_posts/test-post-1.md', function(err, content){
          if (err) throw err;
          content.should.match(regex.normal);
          done();
        });
      });
    });
  });
});