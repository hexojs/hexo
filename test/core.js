var spawn = require('child_process').spawn,
  async = require('async'),
  util = require('../lib/util'),
  file = util.file,
  coreDir = __dirname + '/../';

var regex = {
  post: /---\nlayout: post\ntitle: (.*?)\ndate: \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\ncomments: (true|false)\ntags:(.*)?\n---\n[\s\S]+/,
  page: /---\nlayout: post\ntitle: (.*?)\ndate: \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\ncomments: (true|false)\n---\n[\s\S]+/
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
});