var fs = require('graceful-fs'),
  async = require('async'),
  path = require('path'),
  sep = path.sep,
  yaml = require('yamljs'),
  EventEmitter = require('events').EventEmitter,
  _ = require('underscore'),
  i18n = require('./i18n'),
  util = require('./util'),
  file = util.file;

module.exports = function(root, options, callback){
  async.parallel([
    function(next){
      file.read(__dirname + '/../package.json', next);
    },
    function(next){
      fs.exists(root + '/_config.yml', function(exist){
        if (exist){
          file.read(root + '/_config.yml', next);
        } else {
          next(null, '');
        }
      });
    }
  ], function(err, result){
    if (err) throw new Error('Initialize Error');

    var version = JSON.parse(result[0]).version,
      config = yaml.parse(result[1]),
      env = process.env,
      themeDir = config ? root + sep + 'themes' + sep + config.theme + sep : null,
      newConfig = {};

    var hexo = global.hexo = new EventEmitter();

    hexo.__defineGetter__('base_dir', function(){return root + sep});
    hexo.__defineGetter__('public_dir', function(){return root + sep + 'public' + sep});
    hexo.__defineGetter__('source_dir', function(){return root + sep + 'source' + sep});
    if (themeDir) hexo.__defineGetter__('theme_dir', function(){return themeDir});
    hexo.__defineGetter__('plugin_dir', function(){return root + sep + 'node_modules' + sep});
    hexo.__defineGetter__('script_dir', function(){return root + sep + 'scripts' + sep});
    hexo.__defineGetter__('core_dir', function(){return path.dirname(__dirname) + sep});
    hexo.__defineGetter__('lib_dir', function(){return __dirname + sep});
    hexo.__defineGetter__('version', function(){return version});
    hexo.__defineGetter__('env', function(){return env});
    hexo.__defineGetter__('safe', function(){return options.safe});
    hexo.__defineGetter__('debug', function(){return options.debug});
    hexo.__defineGetter__('config', function(){return newConfig});
    hexo.__defineGetter__('extend', function(){return require('./extend')});
    hexo.__defineGetter__('util', function(){return require('./util')});
    hexo.__defineGetter__('render', function(){return require('./render')});
    hexo.__defineGetter__('i18n', function(){return i18n.i18n});
    hexo.__defineGetter__('route', function(){return require('./route')});
    hexo.cache = {};

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

    //i18n.core.load(__dirname + '/../languages', callback);
    callback();
  });
};