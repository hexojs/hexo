var async = require('async'),
  colors = require('colors'),
  yaml = require('yamljs'),
  fs = require('graceful-fs'),
  path = require('path'),
  sep = path.sep,
  EventEmitter = require('events').EventEmitter,
  _ = require('underscore'),
  i18n = require('./i18n'),
  Database = require('./db'),
  util = require('./util'),
  route = require('./route'),
  render = require('./render'),
  extend = require('./extend');

module.exports = function(args){
  var baseDir = process.cwd() + sep,
    database = new Database();
    config = {},
    init = true;

  // Load config
  try {
    config = require(baseDir + '_config.yml');
  } catch (e){
    init = false;
  }

  if (init){
    try {
      var data = require(baseDir + 'db.json');
      database.import(data);
    } catch (e){

    }
  }

  var version = require('../package.json').version,
    safe = args.safe ? true : false,
    debug = args.debug ? true : false,
    newConfig = init ? {} : null,
    themeDir = init ? baseDir + 'themes' + sep + config.theme + sep : null;

  // Set namespace
  var hexo = global.hexo = {
    get base_dir(){return baseDir},
    get public_dir(){return baseDir + 'public' + sep},
    get source_dir(){return baseDir + 'source' + sep},
    get theme_dir(){return themeDir},
    get plugin_dir(){return baseDir + 'node_modules' + sep},
    get script_dir(){return baseDir + 'scripts' + sep},
    get scaffold_dir(){return baseDir + 'scaffolds' + sep},
    get core_dir(){return path.dirname(__dirname) + sep},
    get lib_dir(){return __dirname + sep},
    get version(){return version},
    get env(){return process.env},
    get safe(){return safe},
    get debug(){return debug},
    get config(){return newConfig},
    get extend(){return extend},
    get util(){return util},
    get render(){return render},
    get i18n(){return i18n.i18n},
    get route(){return route},
    get process(){return process},
    get db(){return database}
  };

  hexo.site = {};
  hexo.__proto__ = EventEmitter.prototype;

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