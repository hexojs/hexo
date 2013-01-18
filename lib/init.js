var async = require('async'),
  colors = require('colors'),
  yaml = require('yamljs'),
  fs = require('graceful-fs'),
  path = require('path'),
  sep = path.sep,
  EventEmitter = require('events').EventEmitter,
  _ = require('underscore'),
  i18n = require('./i18n'),
  db = require('./db'),
  util = require('./util'),
  route = require('./route'),
  render = require('./render'),
  extend = require('./extend');

module.exports = function(args){
  var baseDir = process.cwd() + sep,
    config = {},
    init = true;

  // Load config
  try {
    config = require(baseDir + '_config.yml');
  } catch (e){
    init = false;
  }

  var version = require('../package.json').version,
    safe = args.safe ? true : false,
    debug = args.debug ? true : false,
    newConfig = init ? {} : null,
    themeDir = init ? baseDir + 'themes' + sep + config.theme + sep : null,
    database = init ? new db(baseDir + 'db.json') : null;

  // Set namespace
  var hexo = global.hexo = new EventEmitter();

  hexo.__defineGetter__('base_dir', function(){return baseDir});
  hexo.__defineGetter__('public_dir', function(){return baseDir + 'public' + sep});
  hexo.__defineGetter__('source_dir', function(){return baseDir + 'source' + sep});
  hexo.__defineGetter__('theme_dir', function(){return themeDir});
  hexo.__defineGetter__('plugin_dir', function(){return baseDir + 'node_modules' + sep});
  hexo.__defineGetter__('script_dir', function(){return baseDir + 'scripts' + sep});
  hexo.__defineGetter__('scaffold_dir', function(){return baseDir + 'scaffolds' + sep});
  hexo.__defineGetter__('core_dir', function(){return path.dirname(__dirname) + sep});
  hexo.__defineGetter__('lib_dir', function(){return __dirname + sep});
  hexo.__defineGetter__('version', function(){return version});
  hexo.__defineGetter__('env', function(){return process.env});
  hexo.__defineGetter__('safe', function(){return safe});
  hexo.__defineGetter__('debug', function(){return debug});
  hexo.__defineGetter__('config', function(){return newConfig});
  hexo.__defineGetter__('extend', function(){return extend});
  hexo.__defineGetter__('util', function(){return util});
  hexo.__defineGetter__('render', function(){return render});
  hexo.__defineGetter__('i18n', function(){return i18n.i18n});
  hexo.__defineGetter__('route', function(){return route});
  hexo.__defineGetter__('process', function(){return process});
  hexo.__defineGetter__('db', function(){return database});

  process.on('exit', function(){
    hexo.emit('exit');
  });

  if (init){
    // Make config readonly
    _.each(config, function(val, key){
      newConfig.__defineGetter__(key, function(){
        return val;
      });
    });

    Object.freeze(newConfig);

    // Load built-in plugins
    require('./plugins/filter');
    require('./plugins/renderer');
    require('./plugins/tag');
    require('./plugins/deployer');
    require('./plugins/processor');
    require('./plugins/helper');
    require('./plugins/generator');
  }

  require('./plugins/console');

  async.parallel([
    // Load plugins
    function(next){
      if (!init) return next();

      var pluginDir = baseDir + 'node_modules/';

      fs.exists(pluginDir, function(exist){
        if (!exist) return next();

        fs.readdir(pluginDir, function(err, files){
          if (err) throw new Error('Failed to load plugins.');

          var plugins = _.filter(files, function(item){
            return item.substring(0, 1) !== '.';
          });

          plugins.forEach(function(item){
            try {
              require(pluginDir + item);
            } catch(e){
              console.log('Failed to load plugin: %s'.red, item.bold);
            }
          });

          next();
        });
      });
    },
    // Load scripts
    function(next){
      if (!init) return next();

      var scriptDir = baseDir + 'scripts/';

      fs.exists(scriptDir, function(exist){
        if (!exist) return next();

        fs.readdir(scriptDir, function(err, files){
          if (err) throw new Error('Failed to load scripts.');

          var scripts = _.filter(files, function(item){
            var first = item.substring(0, 1);
            return first !== '.' && first !== '_';
          });

          scripts.forEach(function(item){
            try {
              require(scriptDir + item);
            } catch(e){
              console.log('Failed to load script: %s'.red, item.bold);
            }
          });

          next();
        });
      });
    }
  ], function(){
    var list = extend.console.list();

    _.each(list, function(val, key){
      var options = val.options;
      if ((!init && !options.init) || (!debug && options.debug)){
        delete list[key];
      }
    });

    var keys = Object.keys(list),
      command = args._[0] ? args._.shift().toLowerCase() : '';

    if (keys.indexOf(command) === -1){
      var maxLen = 0,
        result = '\nUsage: hexo <command>\n\nCommands:\n';

      var helps = [
        ['help', 'Display help']
      ];

      _.each(list, function(val, key){
        helps.push([key, val.description]);
      });

      helps = helps.sort(function(a, b){
        var orderA = a[0],
          orderB = b[0];

        if (orderA.length >= orderB.length && maxLen < orderA.length) maxLen = orderA.length;
        else if (maxLen < orderB.length) maxLen = orderB.length;

        if (orderA < orderB) return -1;
        else if (orderA > orderB) return 1;
        else return 0;
      });

      helps.forEach(function(item){
        result += '  ' + item[0].bold;

        for (var i=0; i<maxLen + 3 - item[0].length; i++){
          result += ' ';
        }

        result += item[1] + '\n';
      });

      console.log(result);
    } else {
      hexo.emit('ready');
      list[command](args);
    }
  });
};