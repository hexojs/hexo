var EventEmitter = require('events').EventEmitter,
  domain = require('domain'),
  path = require('path'),
  util = require('util'),
  term = require('term'),
  Log = require('./log'),
  Router = require('./router'),
  Extend = require('./extend'),
  version = require('../package.json').version,
  env = process.env;

var Hexo = module.exports = function(baseDir, args){
  this.config = {};

  this.base_dir = baseDir;
  this.public_dir = path.join(baseDir, 'public');
  this.source_dir = path.join(baseDir, 'source');
  this.plugin_dir = path.join(baseDir, 'node_modules');
  this.script_dir = path.join(baseDir, 'scripts');

  this.__defineGetter__('theme_dir', function(){
    return path.join(baseDir, 'themes', this.config.theme);
  });

  var debug = this.debug = !!args.debug;
  this.safe = !!args.save;
  this.init = false;

  var log = this.log = new Log({hide: args.debug ? 9 : 7});
  this.route = new Router();

  if (debug){
    log.setFormat('[:level] ' + ':date[HH:mm:ss]'.blackBright + ' :message');
  } else {
    log.setFormat('[:level] :message');
  }

  log.setLevel('created', 5, 'green');
  log.setLevel('updated', 5, 'yellow');
  log.setLevel('deleted', 5, 'red');

  var extend = this.extend = new Extend();

  [
    'console',
    'deployer',
    'filter',
    'generator',
    'helper',
    'migrator',
    'processor',
    'renderer',
    'swig',
    'tag'
  ].forEach(function(item){
    extend.module(item, require('./extend/' + item));
  });
};

var proto = Hexo.prototype;

proto.__proto__ = EventEmitter.prototype;

proto.core_dir = path.dirname(__dirname);
proto.lib_dir = __dirname;
proto.env = env;
proto.version = version;
proto.util = util;

proto.call = function(name, args, callback){
  if (!callback){
    if (typeof args === 'function'){
      callback = args;
      args = {};
    } else {
      callback = function(){};
    }
  }

  var console = this.extend.console.get(name);

  if (console){
    if (domain){
      var d = domain.create();

      d.on('error', function(err){
        d.dispose();
        callback(err);
      });

      d.run(function(){
        console(args, callback);
      });
    } else {
      try {
        console(args, callback);
      } catch (err){
        callback(err);
      }
    }
  } else {
    callback(new Error('Console `' + name + '` not found'));
  }

  return this;
};