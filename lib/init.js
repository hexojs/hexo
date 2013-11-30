var async = require('async'),
  path = require('path'),
  Hexo = require('./core'),
  Logger = require('./logger');

module.exports = function(cwd, args, callback){
  if (typeof callback !== 'function') callback = function(){};

  var hexo = global.hexo = new Hexo();

  hexo.bootstrap(cwd, args);

  async.eachSeries([
    'logger',
    'extend',
    'config',
    'update',
    'database',
    'plugins',
    'scripts'
  ], function(name, next){
    require('./loaders/' + name)(next);
  }, function(err){
    if (err) throw err;

    hexo.emit('ready');

    var command = args._.shift();

    if (command){
      var c = hexo.extend.console.get(command);

      if (!c || (!hexo.env.init && !c.options.init)){
        command = 'help';
      }
    } else {
      command = 'help';
    }

    if (hexo.env.slient && command === 'help') return callback();

    hexo.call(command, args, function(err){
      if (err) hexo.log.e(err);

      hexo.emit('exit');

      if (!err) return process.exit(0);

      var logPath = path.join(hexo.base_dir, 'debug.log'),
        FileStream = Logger.stream.File;

      async.series([
        function(next){
          FileStream.prepare(logPath, next);
        },
        function(next){
          FileStream.dump(logPath, hexo.log, next);
        }
      ], function(err){
        if (err) return log.e(err);

        process.exit(1);
      });
    });
  });
};