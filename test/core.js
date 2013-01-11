var child_process = require('child_process'),
  spawn = child_process.spawn,
  async = require('async'),
  fs = require('fs'),
  util = require('../lib/util'),
  file = util.file,
  coreDir = __dirname + '/../',
  tmpDir = coreDir + 'tmp/';

var regex = {
  post: /---\ntitle: (.*?)\ndate: \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\ntags:(.*)?\n---/,
  page: /---\ntitle: (.*?)\ndate: \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\n---/,
  normal: /---\nlayout: (.*?)\ntitle: (.*?)\ndate: \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\ntags:(.*)?\n---/,
};

var command = function(comm, args, options, callback){
  var command = spawn(comm, args, options).on('exit', function(code){
    if (code === 0) callback();
  });

  command.stderr.setEncoding('utf8');
  command.stderr.on('data', function(data){
    console.log(data);
  });
};

describe('Core', function(){
  describe('Initialize', function(){
    it('init', function(done){
      command('./bin/hexo', ['init', 'tmp'], {}, done);
    });

    it('check', function(done){
      async.parallel([
        // .gitignore
        function(next){
          file.read(coreDir + 'files/init/.gitignore', next);
        },
        function(next){
          file.read(tmpDir + '.gitignore', next);
        },
        // _config.yml
        function(next){
          file.read(coreDir + 'files/init/_config.yml', next);
        },
        function(next){
          file.read(tmpDir + '_config.yml', next);
        },
        // package.json
        function(next){
          file.read(coreDir + 'files/init/package.json', next);
        },
        function(next){
          file.read(tmpDir + 'package.json', next);
        },
        // hello-world.md
        function(next){
          file.read(tmpDir + 'source/_posts/hello-world.md', next);
        },
        // source
        function(next){
          fs.exists(tmpDir + 'source', function(exist){
            next(null, exist);
          });
        },
        // source/_posts
        function(next){
          fs.exists(tmpDir + 'source/_posts', function(exist){
            next(null, exist);
          });
        },
        // source/_drafts
        function(next){
          fs.exists(tmpDir + 'source/_drafts', function(exist){
            next(null, exist);
          });
        },
        // scripts
        function(next){
          fs.exists(tmpDir + 'scripts', function(exist){
            next(null, exist);
          });
        },
        // public
        function(next){
          fs.exists(tmpDir + 'public', function(exist){
            next(null, exist);
          });
        },
        // scaffolds
        function(next){
          fs.exists(tmpDir + 'scaffolds', function(exist){
            next(null, exist);
          });
        },
        // themes
        function(next){
          fs.exists(coreDir + 'tmp/themes', function(exist){
            next(null, exist);
          });
        }
      ], function(err, results){
        if (err) throw err;
        results[0].should.equal(results[1]);
        results[2].should.equal(results[3]);
        results[4].should.equal(results[5]);
        results[6].should.match(regex.post);
        results[7].should.be.true;
        results[8].should.be.true;
        results[9].should.be.true;
        results[10].should.be.true;
        results[11].should.be.true;
        results[12].should.be.true;
        results[13].should.be.true;
        done();
      });
    });
  });

  describe('Config', function(){
    it('config', function(done){
      command('../bin/hexo', ['config'], {cwd: tmpDir}, done);
    });
  });

  describe('Create', function(){
    it('post', function(done){
      command('../bin/hexo', ['new', 'Test Post'], {cwd: tmpDir}, function(){
        file.read(tmpDir + 'source/_posts/test-post.md', function(err, content){
          if (err) throw err;
          content.should.match(regex.post);
          done();
        });
      });
    });

    it('page', function(done){
      command('../bin/hexo', ['new', 'page', 'Test Page'], {cwd: tmpDir}, function(){
        file.read(tmpDir + 'source/test-page/index.md', function(err, content){
          if (err) throw err;
          content.should.match(regex.page);
          done();
        });
      });
    });

    it('draft', function(done){
      command('../bin/hexo', ['new', 'draft', 'Test Draft'], {cwd: tmpDir}, function(){
        file.read(tmpDir + 'source/_drafts/test-draft.md', function(err, content){
          if (err) throw err;
          content.should.match(regex.post);
          done();
        });
      });
    });

    it('custom', function(done){
      command('../bin/hexo', ['new', 'custom', 'Test Post'], {cwd: tmpDir}, function(){
        file.read(tmpDir + 'source/_posts/test-post-1.md', function(err, content){
          if (err) throw err;
          content.should.match(regex.normal);
          done();
        });
      });
    });
  });

  describe('Generate', function(){
    it('generate', function(done){
      command('../bin/hexo', ['generate'], {cwd: tmpDir}, done);
    });
  });

  describe('Routes', function(){
    it('routes', function(done){
      command('../bin/hexo', ['routes'], {cwd: tmpDir}, done);
    });
  });

  after(function(){
    command('rm', ['-rf', 'tmp'], {});
  });
});