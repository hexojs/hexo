var async = require('async'),
  path = require('path'),
  Hexo = require('./core'),
  Logger = require('./logger');

var defaultCallback = function(err){
  process.exit(err ? 1 : 0);
};

module.exports = function(cwd, args, callback){
  if (typeof callback !== 'function') callback = defaultCallback;

  var hexo = global.hexo = new Hexo(),
    configfile = args.config || '_config.yml';

  hexo.bootstrap(cwd, args);
  hexo.configfile = path.join(hexo.base_dir, configfile);

  async.eachSeries([
    'logger',
    'extend',
    'config',
    'update',
    'database',
    'box',
    'plugins',
    'scripts'
  ], function(name, next){
    require('./loaders/' + name)(next);
  }, function(err){
    if (err){
      if (hexo.log != null){
        return hexo.log.e(err);
      } else {
        throw err;
      }
    }

    /**
    * Fired when Hexo is ready.
    *
    * @event ready
    * @for Hexo
    */

    hexo.emit('ready');

    var command = args._.shift();

    if (command){
      var c = hexo.extend.console.get(command);

      if (!c || (!hexo.env.init && !c.options.init)){
        command = 'help';
      }
    } else if (args.v || args.version){
      command = 'version';
    } else {
      command = 'help';
    }

    if (hexo.env.silent && command === 'help') return callback();

    hexo.call(command, args, function(err){
      if (err) hexo.log.e(err);

      /**
      * Fired when Hexo is about to exit.
      *
      * @event exit
      * @for Hexo
      */

      hexo.emit('exit');

      if (!err) return callback();

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
        if (err) log.e(err);
        callback(err);
      });
    });
  });

  return hexo;
};