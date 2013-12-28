var ExtendError = require('../error').ExtendError,
  types = require('swig/lib/lexer').types;

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

  this.store = [];
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

  var tag = {
    name: name,
    ends: ends
  };

  tag.parse = function(str, line, parser, types, options){
    // Hack: Don't let Swig parse tokens
    parser.on('*', function(token){
      if (token.type === types.WHITESPACE){
        this.out.push(' ');
      }

      token.type = types.STRING;

      return true;
    });

    return true;
  };

  tag.compile = function(compiler, args, content, parents, options, blockName){
    var tokens = content.join(''),
      match = tokens.match(/^\n(\t*)/),
      indent = match ? match[1].length : 0,
      raw = [];

    tokens.replace(/^\n\t/, '').replace(/\n\t*$/, '').split('\n').forEach(function(line){
      if (indent){
        raw.push(line.replace(new RegExp('^\\t{' + indent + '}'), ''));
      } else {
        raw.push(line);
      }
    });

    var result = fn(args.join('').split(' '), raw.join('\n'));

    if (!result) return '';

    result = result
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/"/g, '\\"');

    var out = [
      '(function(){',
        '_output += "<escape indent=\'' + indent + '\'>' + result + '</escape>";',
        'return _output;',
      '})();'
    ].join('\n');

    return out;
  };

  this.store.push(tag);
};