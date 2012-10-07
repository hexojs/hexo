var async = require('async'),
  clc = require('cli-color'),
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

  if (args[1]){
    var branch = args[1];
  } else {
    if (repo.match(/^(https?:\/\/|git(@|:\/\/))([^\/]+)/)[3].match(/github\.com/)){
      var branch = repo.match(/\/\w+\.github\.com/) ? 'master' : 'gh-pages';
    } else {
      var branch = 'master';
    }
  }

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
    log.success('Now you can deploy to ' + repo + ' with `%s`.', clc.bold('hexo deploy'));
  });
};