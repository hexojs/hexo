var fs = require('graceful-fs'),
  async = require('async'),
  path = require('path'),
  sep = path.sep,
  yaml = require('yamljs'),
  EventEmitter = require('events').EventEmitter,
  _ = require('underscore'),
  cache = require('./cache'),
  i18n = require('./i18n'),
  util = require('./util'),
  file = util.file;

module.exports = function(root, options, callback){
  async.parallel([
    function(next){
      cache.init(root, next);
    },
    function(next){
      fs.exists(root + '/_config.yml', function(exist){
        if (!exist) return next();

        file.read(root + '/_config.yml', function(err, content){
          if (err) throw new Error('Failed to read file: ' + root + '/_config.yml');
          next(null, yaml.parse(content));
        });
      });
    }
  ], function(err, result){
    if (err) throw new Error('Initialize Error');

    var version = require('../package.json').version,
      config = result[1],
      env = process.env,
      newConfig = config ? {} : null,
      safe = options.safe ? true : false,
      debug = options.debug ? true : false,
      baseDir = root + sep,
      themeDir = config ? baseDir + 'themes' + sep + config.theme + sep : null;

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
    hexo.__defineGetter__('env', function(){return env});
    hexo.__defineGetter__('safe', function(){return safe});
    hexo.__defineGetter__('debug', function(){return debug});
    hexo.__defineGetter__('config', function(){return newConfig});
    hexo.__defineGetter__('extend', function(){return require('./extend')});
    hexo.__defineGetter__('util', function(){return require('./util')});
    hexo.__defineGetter__('render', function(){return require('./render')});
    hexo.__defineGetter__('i18n', function(){return i18n.i18n});
    hexo.__defineGetter__('route', function(){return require('./route')});
    hexo.__defineGetter__('cache', function(){return cache});
    hexo.__defineGetter__('process', function(){return process});

    if (config){
      _.each(config, function(val, key){
        newConfig.__defineGetter__(key, function(){
          return val;
        });
      });

      Object.freeze(newConfig);

      require('./filter');
      require('./renderer');
      require('./tag');
      require('./deployer');
      require('./processor');
      require('./helper');
      require('./generator');
    }

    require('./cli');

    //i18n.core.load(__dirname + '/../languages', callback);
    callback();
  });
};