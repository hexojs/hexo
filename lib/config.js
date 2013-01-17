var path = require('path'),
  sep = path.sep,
  yaml = require('yamljs'),
  EventEmitter = require('events').EventEmitter,
  _ = require('underscore'),
  i18n = require('./i18n'),
  db = require('./db'),
  util = require('./util'),
  route = require('./route'),
  render = require('./render'),
  extend = require('./extend');

module.exports = function(root, options, callback){
  var baseDir = root + sep,
    config;

  try {
    config = require(baseDir + '_config.yml');
  } finally {
    var version = require('../package.json').version,
      safe = options.safe ? true : false,
      debug = options.debug ? true : false,
      newConfig = config ? {} : null,
      themeDir = config ? baseDir + 'themes' + sep + config.theme + sep : null,
      database = config ? db(baseDir + 'db.json') : null;

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

    callback();
  }
};