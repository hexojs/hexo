/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter,
  path = require('path'),
  util = require('../util'),
  Router = require('./router'),
  version = require('../../package.json').version,
  domain;

/**
 * Loads domain module.
 */

try {
  domain = require('domain');
} catch (err){}

/**
 * Creates a new instance.
 *
 * @param {String} baseDir
 * @param {Object} args
 */

var Hexo = module.exports = function Hexo(){};

Hexo.prototype.__proto__ = EventEmitter.prototype;

Hexo.prototype.constant = function(name, value){
  if (typeof value !== 'function'){
    var getter = function(){
      return value;
    }
  } else {
    var getter = value;
  }

  this.__defineGetter__(name, getter);

  return this;
};

Hexo.prototype.bootstrap = function(baseDir, args){
  this.constant('core_dir', path.dirname(path.dirname(__dirname)) + path.sep)
      .constant('lib_dir', path.dirname(__dirname) + path.sep)
      .constant('version', version)
      .constant('base_dir', baseDir + path.sep);

  this.env = {
    debug: !!args.debug,
    safe: !!args.safe,
    slient: !!args.slient,
    env: process.env.NODE_ENV || 'development',
    version: version
  };

  this.util = util;
  this.file = util.file2;

  this.route = new Router();
  this.render = require('./render');
  this.scaffold = require('./scaffold');
  this.theme = require('./theme');
  this.post = require('../post');
  this.source = require('./source');

  return this;
};

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