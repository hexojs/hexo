var ExtendError = require('../error').ExtendError;

/**
* This class is used to manage all tag plugins in Hexo.
*
* @class Tag
* @constructor
* @namespace Hexo.Extend
* @module hexo
*/

var Tag = module.exports = function(){
  /**
  * @property store
  * @type Object
  */

  this.store = {};
};

/**
* Returns a list of tag plugins.
*
* @method list
* @return {Object}
*/

Tag.prototype.list = function(){
  return this.store;
};

/**
* Registers a tag plugin.
*
* @method register
* @param {String} name
* @param {Function} fn
* @param {Boolean} [ends=false]
*/

Tag.prototype.register = function(name, fn, ends){
  if (typeof fn !== 'function'){
    throw new ExtendError('Tag function is not defined');
  }

  var tag = this.store[name] = function(indent, parser){
    var args = this.args,
      tokenArr = this.tokens && this.tokens.length ? this.tokens : [],
      tokens = tokenArr.join(''),
      match = tokenArr.join('').match(/^\n(\t*)/),
      indent = match ? match[1].length : 0,
      raw = [];

    tokens.replace(/^\n\t*/, '').replace(/\n\t*$/, '').split('\n').forEach(function(line){
      if (indent){
        raw.push(line.replace(new RegExp('^\\t{' + indent + '}'), ''));
      } else {
        raw.push(line);
      }
    });

    var content = fn(args, raw.join('\n'));

    if (!content) return '';

    var result = content
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/"/g, '\\"');

    var out = [
      '(function(){',
        '_output += "<escape indent=\'' + indent + '\'>' + result + '</escape>";',
      '})();'
    ].join('\n');

    return out;
  };

  if (ends) tag.ends = true;
};