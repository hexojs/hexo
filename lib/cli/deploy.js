var async = require('async'),
  util = require('../util'),
  log = util.log,
  spawn = util.spawn;

var command = function(command, callback){
  spawn(command,
    function(data){
      log.info(data);
    },
    function(data){
      log.error(data);
    },
    function(code){
      if (code == 0) callback();
      else log.error(code);
    }
  );
};

exports.deploy = function(){

};

exports.setup = function(args){
  var repo = args[0];

  if (repo === undefined) return false;

  var branch = repo.match(/\w+\.github\.com/) ? 'master' : 'gh-pages';

  async.series([
    function(next){
      command('git init', next);
    },
    function(next){
      command('git add .', next);
    },
    function(next){
      command('git commit -m "init"', next);
    },
    function(next){
      if (branch == 'gh-pages') command('git branch -m gh-pages', next);
      else next();
    },
    function(next){
      command('git remote add origin ' + repo, next);
    },
    function(next){
      var configFile = process.cwd() + '/_config.yml',
        regex = /deploy:\s*\W+/;

      file.read(configFile, function(err, content){
        if (err) throw err;

        if (content.match(regex)){
          var newContent = content.replace(regex, 'deploy: ' + branch);
        } else {
          var newContent = content + '\n' +
            '# Deploy\n' +
            'deploy: ' + branch;
        }

        file.write(configFile, newContent, next);
      });
    }
  ], function(){
    log.success('Now you can deploy to ' + repo + ' with `hexo deploy`.');
  });
};