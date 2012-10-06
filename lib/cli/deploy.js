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
    }
  ], function(){
    log.success('Now you can deploy to ' + repo + ' with `hexo deploy`.');
  });
};