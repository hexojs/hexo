var _ = require('lodash'),
  ExtendError = require('../error').ExtendError;

/**
* This class is used to manage all console plugins in Hexo.
*
* @class Console
* @constructor
* @namespace Extend
* @module hexo
*/

var Console = module.exports = function(){
  /**
  * @property store
  * @type Object
  */

  this.store = {};

  /**
  * @property alias
  * @type Object
  */

  this.alias = {};
};

/**
* Gets the console plugin.
*
* @method get
* @param {String} name You can use either full name or alias of the console plugin.
* @return {Object}
*/

Console.prototype.get = function(name){
  name = name.toLowerCase();

  return this.store[name] || this.alias[name];
};

/**
* Returns a list of console plugins.
*
* @method list
* @return {Object}
*/

Console.prototype.list = function(){
  return this.store;
};

/**
* Registers a console plugin.
*
* @method register
* @param {String} name Name
* @param {String} [desc] Description
* @param {Object} [options]
*   @param {Boolean} [options.init=false] Determines whether the plugin is available even Hexo not initalized yet
*   @param {String} [options.desc] The detailed description
*   @param {Object} [options.options] Descriptions of each option used in the plugin
*   @param {Object} [options.arguments] Descriptions of each argument used in the plugin
*   @param {String} [options.alias] The alias for the plugin
* @param {Function} fn
*/

Console.prototype.register = function(name, desc, options, fn){
  if (!name) throw new ExtendError('name is required');

  if (!fn){
    if (options){
      if (typeof options === 'function'){
        fn = options;

        if (_.isObject(desc)){ // name, options, fn
          options = desc;
          desc = '';
        } else { // name, desc, fn
          options = {};
        }
      } else {
        throw new ExtendError('fn is required');
      }
    } else {
      // name, fn
      if (typeof desc === 'function'){
        fn = desc;
        options = {};
        desc = '';
      } else {
        throw new ExtendError('fn is required');
      }
    }
  }

  var console = this.store[name.toLowerCase()] = fn;
  console.desc = desc;
  console.options = options;

  if (options.alias) this.alias[options.alias] = console;
};