/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter,
  path = require('path'),
  Logger = require('./logger'),
  Router = require('./router'),
  Extend = require('./extend'),
  util = require('./util'),
  version = require('../package.json').version,
  env = process.env,
  domain;

/**
 * Loads domain module.
 */

try {
  domain = require('domain');
} catch (err){
  //
}

/**
 * Creates a new instance.
 *
 * @param {String} baseDir
 * @param {Object} args
 * @api private
 */

var Hexo = module.exports = function(baseDir, args){
  this.config = {};

  this.core_dir = path.dirname(__dirname) + path.sep;
  this.lib_dir = __dirname + path.sep;
  this.version = version;
  this.util = util;

  this.base_dir = baseDir + path.sep;
  this.public_dir = path.join(baseDir, 'public') + path.sep;
  this.source_dir = path.join(baseDir, 'source') + path.sep;
  this.plugin_dir = path.join(baseDir, 'node_modules') + path.sep;
  this.script_dir = path.join(baseDir, 'scripts') + path.sep;
  this.scaffold_dir = path.join(baseDir, 'scaffolds') + path.sep;

  this.__defineGetter__('theme_dir', function(){
    return path.join(baseDir, 'themes', this.config.theme);
  });

  this.debug = !!args.debug;
  this.safe = !!args.save;
  this.route = new Router();

  // Extend
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

  // Logger
  this.log = new Logger({
    levels: {
      create: 5,
      update: 5,
      delete: 5
    }
  });
};

Hexo.prototype.__proto__ = EventEmitter.prototype;

/**
 * Calls the specified console plugin.
 *
 * @param {String} name
 * @param {Object} args
 * @param {Function} [callback]
 * @return {Hexo}
 * @api public
 */

Hexo.prototype.call = function(name, args, callback){
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