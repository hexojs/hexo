var EventEmitter = require('events').EventEmitter,
  path = require('path'),
  util = require('../util'),
  Router = require('./router'),
  version = require('../../package.json').version,
  domain;

try {
  domain = require('domain');
} catch (err){}

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

/**
* Defines a constant.
*
* @method constant
* @param {String} name
* @param {Any} value
* @chainable
*/

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
    debug: !!args.debug,
    safe: !!args.safe,
    silent: !!args.silent,
    env: process.env.NODE_ENV || 'development',
    version: version,
    init: false
  };

  /**
  * See {{#crossLink "Hexo.util"}}{{/crossLink}}
  *
  * @property util
  * @type Hexo.util
  */

  this.util = util;

  /**
  * See {{#crossLink "Hexo.util.file2"}}{{/crossLink}}
  *
  * @property file
  * @type Hexo.util.file2
  */

  this.file = util.file2;

  /**
  * See {{#crossLink "Hexo.Router"}}{{/crossLink}}
  *
  * @property route
  * @type Hexo.Router
  */

  this.route = new Router();

  /**
  * See {{#crossLink "Hexo.render"}}{{/crossLink}}
  *
  * @property render
  * @type Hexo.render
  */

  this.render = require('./render');

  /**
  * See {{#crossLink "Hexo.scaffold"}}{{/crossLink}}
  *
  * @property scaffold
  * @type Hexo.scaffold
  */

  this.scaffold = require('./scaffold');

  /**
  * See {{#crossLink "Hexo.theme"}}{{/crossLink}}
  *
  * @property theme
  * @type Hexo.theme
  */

  this.theme = require('./theme');

  /**
  * See {{#crossLink "Hexo.post"}}{{/crossLink}}
  *
  * @property post
  * @type Hexo.post
  */

  this.post = require('../post');

  /**
  * See {{#crossLink "Hexo.source"}}{{/crossLink}}
  *
  * @property source
  * @type Hexo.source
  */

  this.source = require('./source');

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