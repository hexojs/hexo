/**
* This is the main module of hexo.
*
* @module hexo
* @main hexo
*/

var EventEmitter = require('events').EventEmitter,
  path = require('path'),
  util = require('../util'),
  Router = require('./router'),
  Box = require('../box'),
  version = require('../../package.json').version,
  HexoError = require('../error');
  domain = require('domain');

/**
* All Hexo methods and functions are defined inside of this namespace.
*
* @class Hexo
* @constructor
* @extends EventEmitter
* @module hexo
*/

var Hexo = module.exports = function Hexo(){};

Hexo.prototype.__proto__ = EventEmitter.prototype;

Hexo.Box = Box;
Hexo.Error = HexoError;

/**
* Defines a constant.
*
* @method constant
* @param {String} name
* @param {Any} value
* @chainable
*/

Hexo.prototype.constant = function(name, value){
  var getter;

  if (typeof value !== 'function'){
    getter = function(){
      return value;
    };
  } else {
    getter = value;
  }

  this.__defineGetter__(name, getter);

  return this;
};

/**
* Bootstraps Hexo environment.
*
* @method bootstrap
* @param {String} baseDir
* @param {Object} args
* @chainable
* @since 2.4.0
*/

Hexo.prototype.bootstrap = function(baseDir, args){
  /**
  * The path of core directory of Hexo.
  *
  * @property core_dir
  * @type String
  * @final
  */

  this.constant('core_dir', path.dirname(path.dirname(__dirname)) + path.sep);

  /**
  * The path of library directory of Hexo.
  *
  * @property lib_dir
  * @type String
  * @final
  */

  this.constant('lib_dir', path.dirname(__dirname) + path.sep);

  /**
  * Hexo version number.
  *
  * @property version
  * @type String
  * @final
  */

  this.constant('version', version);

  /**
  * The path of base directory, equals to the current working directory (CWD).
  *
  * @property base_dir
  * @type String
  * @final
  */

  this.constant('base_dir', baseDir + path.sep);

  /**
  * Environment variables.
  *
  * This object contains the following attributes:
  *
  *   - debug: Determines whether debug mode is on.
  *   - safe: Determines whether safe mode is on.
  *   - silent: Determines whether silent mode is on.
  *   - env: Node.js environment variable. Default to `development`.
  *   - version: Hexo version number.
  *   - init: Determines whether Hexo has been initalized.
  *
  * @property env
  * @type Object
  * @final
  */

  this.env = {
    args: args,
    debug: !!args.debug,
    safe: !!args.safe,
    silent: !!args.silent,
    env: process.env.NODE_ENV || 'development',
    version: version,
    init: false
  };

  /**
  * See {% crosslink util %}.
  *
  * @property util
  * @type util
  */

  this.util = util;

  /**
  * See {% crosslink util.file2 %}.
  *
  * @property file
  * @type util.file2
  */

  this.file = util.file2;

  /**
  * See {% crosslink Router %}.
  *
  * @property route
  * @type Router
  */

  this.route = new Router();

  /**
  * See {% crosslink Locals %}.
  *
  * @property locals
  * @type Function
  */

  this.locals = require('./locals');

  /**
  * See {% crosslink render %}.
  *
  * @property render
  * @type render
  */

  this.render = require('./render');

  /**
  * See {% crosslink post %}.
  *
  * @property post
  * @type post
  */

  this.post = require('../post');

  return this;
};

/**
* Calls a console plugin.
*
* @method call
* @param {String} name
* @param {Object} [args]
* @param {Function} [callback]
* @chainable
* @async
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
    var d = domain.create(),
      called = false;

    d.on('error', function(err){
      !called && callback(err);
    });

    d.add(console);

    d.run(function(){
      console(args, function(){
        !called && callback.apply(this, arguments);
        called = true;
      });
    });
  } else {
    callback(new Error('Console `' + name + '` not found'));
  }

  return this;
};