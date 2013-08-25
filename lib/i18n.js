/**
 * Module dependencies.
 */

var fs = require('graceful-fs'),
  async = require('async'),
  pathFn = require('path'),
  vsprintf = require('sprintf-js').vsprintf;

/**
 * Creates a new instance.
 *
 * @api private
 */

var i18n = module.exports = function(){
  this.store = {};
};

/**
 * Gets the specified property in an object.
 *
 * @param {Object} obj
 * @param {String} key
 * @return {Any}
 * @api private
 */

var _getProperty = function(obj, key){
  var keys = key.replace(/\[(\w+)\]/g, '.$1').split('.'),
    cursor = obj;

  for (var i = 0, len = keys.length; i < len; i++){
    cursor = cursor[keys[i]];
  }

  return cursor;
};

/**
 * Gets the available language code.
 *
 * @param {String} lang
 * @return {String}
 * @api private
 */

i18n.prototype._getCode = function(lang){
  var lang = lang.toLowerCase().replace(/_/g, '-'),
    store = this.store,
    keys = Object.keys(store),
    code = 'default';

  if (keys.indexOf(lang) > -1){
    code = lang;
  } else {
    lang = lang.split('-')[0];

    for (var i = 0, len = keys.length; i < len; i++){
      var key = keys[i];

      if (key.split('-')[0] === lang){
        code = key;
        break;
      }
    }
  }

  return code;
};

/**
 * Returns a function to get language resource.
 *
 * @param {String} lang
 * @return {Function}
 * @api public
 */

i18n.prototype.get = function(lang){
  var code = lang ? this._getCode(lang) : 'default',
    store = this.store[code];

  return function(){
    var args = Array.prototype.slice.call(arguments);

    return vsprintf(_getProperty(store, args.shift()), args);
  }
};

/**
 * Returns a function to get language resource.
 * 
 * @param {String} lang
 * @return {Function}
 * @api public
 */

i18n.prototype.plural = function(lang){
  var code = lang ? this._getCode(lang) : 'default',
    store = this.store[code];

  return function(singular, plural, number){
    var args = Array.prototype.slice.call(arguments);

    if (number > 1 || number == 0){
      var key = plural;
    } else {
      var key = singular;
    }

    args = args.slice(2);

    return vsprintf(_getProperty(store, key), args);
  }
};

/**
 * Loads language files from the specified folder.
 *
 * @param {String} path
 * @param {Function} [callback]
 * @api public
 */

i18n.prototype.load = function(path, callback){
  if (typeof callback !== 'function') callback = function(){};

  var render = hexo.render,
    self = this;

  fs.exists(path, function(exist){
    if (!exist) return callback();

    fs.readdir(path, function(err, files){
      if (err) return callback(err);

      async.forEach(files, function(item, next){
        var extname = pathFn.extname(item),
          name = pathFn.basename(item, extname).toLowerCase().replace(/_/g, '-');

        // Only accepts YAML files
        if (extname !== '.yml' && extname !== '.yaml') return next();

        render.render({path: pathFn.join(path, item)}, function(err, content){
          if (err) return callback(err);

          self.store[name] = content;

          next();
        });
      }, callback);
    });
  });
};