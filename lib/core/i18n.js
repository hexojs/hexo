var _ = require('lodash'),
  vsprintf = require('sprintf-js').vsprintf;

/**
* i18n module.
*
* @class i18n
* @param {Object} [options]
*   @param {String} [options.code=default]
* @constructor
* @module hexo
*/
var i18n = module.exports = function i18n(options){
  /**
  * Language data.
  *
  * @property data
  * @type {Object}
  */
  this.data = {};

  /**
  * Options
  *
  * @property options
  * @type {Object}
  */
  this.options = _.extend({
    code: 'default'
  }, options);

  this.options.code = _getCodeToken(this.options.code);
};

/**
* Gets language data.
*
* @method get
* @param {String} code
* @return {Object}
*/
i18n.prototype.get = function(code){
  return this.data[code];
};

/**
* Sets language data.
*
* @method set
* @param {String} code
* @param {Object} data
* @chainable
*/
i18n.prototype.set = function(code, data){
  this.data[code] = data;

  return this;
};

/**
* Removes language data.
*
* @method remove
* @param {String} code
* @chainable
*/
i18n.prototype.remove = function(code){
  this.data[code] = null;

  return this;
};

var _getProperty = function(obj, key){
  if (!obj) return;

  var keys = key.replace(/\[(\w+)\]/g, '.$1').split('.'),
    cursor = obj;

  for (var i = 0, len = keys.length; i < len; i++){
    cursor = cursor[keys[i]];
    if (cursor == null) return;
  }

  return cursor;
};

var _getCodeToken = function(code){
  var arr = [];

  if (Array.isArray(code)){
    code.forEach(function(item){
      arr = arr.concat(_getCodeToken(item));
    });
  } else if (code){
    var split = code.split('-');

    arr.push(code);

    for (var i = split.length - 1; i > 0; i--){
      arr.push(split.slice(0, i).join('-'));
    }
  }

  return arr;
};

/**
* Parses the language code.
*
* @method _parseCode
* @param {String|Array} code
* @return {Array}
*/
i18n.prototype._parseCode = function(code){
  var arr = [].concat(_getCodeToken(code), this.options.code);

  if (arr.indexOf('default') === -1){
    arr.push('default');
  }

  return _.uniq(arr);
};

/**
* Returns a function for translation.
*
* @method __
* @param {String|Array} [code]
* @return {Function}
*/
i18n.prototype.__ = function(code){
  var data = this.data,
    langs = this._parseCode(code),
    length = langs.length;

  var __ =  function(){
    var args = _.toArray(arguments),
      key = args.shift(),
      str = '';

    for (var i = 0; i < length; i++){
      str = _getProperty(data[langs[i]], key);
      if (str) break;
    }

    if (!str || typeof str !== 'string') str = key;

    return vsprintf(str, args);
  };

  __.languages = langs;

  return __;
};

/**
* Returns a function for plural translation.
*
* @method _p
* @param {String|Array} [code]
* @return {Function}
*/
i18n.prototype._p = function(code){
  var data = this.data,
    langs = this._parseCode(code),
    length = langs.length;

  var _p = function(){
    var args = _.toArray(arguments),
      key = args.shift(),
      number = parseInt(args[0], 10),
      str = '',
      plural;

    for (var i = 0; i < length; i++){
      plural = _getProperty(data[langs[i]], key);
      if (plural) break;
    }

    if (plural){
      if (number === 0 && plural.hasOwnProperty('zero')){
        str = plural.zero;
      } else if (number === 1 && plural.hasOwnProperty('one')){
        str = plural.one;
      } else if (plural.hasOwnProperty('other')){
        str = plural.other;
      }
    }

    if (!str || typeof str !== 'string') str = key;

    return vsprintf(str || key, args);
  };

  _p.languages = langs;

  return _p;
};