/**
 * Module dependencies.
 */

var format = require('util').format,
  fs = require('graceful-fs'),
  _ = require('lodash'),
  lang = 'default',
  render = require('./render').render;

/**
 * Creates a new i18n instance.
 */

var i18n = function(){
  var store = {};

  /**
   * Gets a localized string.
   *
   * @param {String}
   * @return {String}
   * @api public
   */

  this.get = function(){
    var args = _.toArray(arguments),
      str = args.shift(),
      split = str.split('.'),
      cursor = store;

    for (var i=0, len=split.length; i<len; i++){
      var item = split[i];
      cursor = cursor[item];
    }

    if (Array.isArray(cursor)){
      var number = args.shift();

      if (cursor.length === 3){
        if (number > 1) cursor = cursor[2];
        else if (number === 0) cursor = cursor[0];
        else cursor = cursor[1];
      } else {
        if (number > 1) cursor = cursor[1];
        else cursor = cursor[0];
      }

      if (/%[ds]/.test(cursor)) args.unshift(number);
    }

    args.unshift(cursor);
    return format.apply(null, args);
  };

  /**
   * Sets a localized string.
   *
   * @param {String} str
   * @param {String} val
   * @api public
   */

  this.set = function(str, val){
    var split = str.split('.'),
      cursor = store;

    for (var i=0, len=split.length - 1; i<len; i++){
      var item = split[i];
      cursor = cursor[item] = cursor[item] || {};
    }

    cursor[split[i]] = val;
  };

  /**
   * Lists/Replaces all localized string.
   *
   * @param {Object} obj
   * @return {Object}
   * @api public
   */

  this.list = function(obj){
    if (obj) store = obj;
    else return store;
  };

  /**
   * Loads language files from the given `path`.
   *
   * @param {String} path
   * @param {Function} callback
   * @api public
   */

  this.load = function(path, callback){
    if (hexo.config && hexo.config.language) lang = hexo.config.language;

    var target = path + '/' + lang + '.yml';

    fs.exists(target, function(exist){
      if (!exist) target = path + '/default.yml';

      render({path: target}, function(err, result){
        if (result) store = result;
        callback(err, result ? true : false);
      });
    });
  };
};

/**
 * Exposes i18n module.
 */

exports.i18n = i18n;