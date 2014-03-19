var _ = require('lodash'),
  ExtendError = require('../error').ExtendError;

var placeholder = String.fromCharCode(65535),
  rPlaceholder = new RegExp(placeholder + '(\\d+)' + placeholder, 'g');

/**
* This class is used to manage all tag plugins in Hexo.
*
* @class Tag
* @constructor
* @namespace Extend
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
* ``` js
* hexo.extend.tag.register('name', function(){
*   // ...
* }, true);
* ```
*
* equals to:
*
* ``` js
* hexo.extend.tag.register('name', function(){
*   // ...
* }, {ends: true});
* ```
*
* @method register
* @param {String} name
* @param {Function} fn
* @param {Object|Boolean} [options]
*   @param {Boolean} [options.ends=false] Whether the tag have an end tag
*   @param {Boolean} [options.escape=true] Prevent contents within the tag from being rendered by markdown or other render engines.
*/

Tag.prototype.register = function(name, fn, options){
  if (typeof name === 'undefined'){
    throw new ExtendError('Tag name is not defined');
  }

  if (typeof fn !== 'function'){
    throw new ExtendError('Tag function is not defined');
  }

  if (typeof options === 'boolean'){
    options = {ends: options};
  }

  options = _.extend({
    ends: false,
    escape: true
  }, options);

  var tag = {
    name: name,
    ends: options.ends
  };

  tag.parse = function(str, line, parser, types, options){
    // Hack: Don't let Swig parse tokens
    parser.on('*', function(token){
      switch (token.type){
        case types.WHITESPACE:
          this.out.push(' ');
          break;

        case types.DOTKEY:
          this.out.push('.');
          break;

        case types.FILTER:
        case types.FILTEREMPTY:
          this.out.push('|');
          break;
      }

      token.type = types.STRING;

      return true;
    });

    return true;
  };

  tag.compile = function(compiler, args, content, parents, opts, blockName){
    var self = this,
      indent = 0,
      tmp = {};

    content = content.map(function(line, i){
      if (line.compile){
        tmp[i] = line;
        return placeholder + i + placeholder;
      } else {
        return line;
      }
    });

    var result = fn(args.join('').split(' '), content.join(''), opts);

    if (!result) return '';

    result = result
      .replace(/\\/g, '\\\\')
      .replace(/\n|\r/g, '\\n')
      .replace(/"/g, '\\"');

    var out = [
      '(function(){',
        (options.escape ? '_output += "<escape indent=\'' + indent + '\'>' + result + '</escape>";' : '_output += "' + result + '";'),
      '})();'
    ].join('\n');

    out = out.replace(rPlaceholder, function(){
      var line = tmp[arguments[1]];

      return [
        '";',
        '})();',
        line.compile(compiler, line.args, line.content, parents, opts, line.name),
        '(function(){',
        '_output += "'
      ].join('\n');
    });

    return out;
  };

  this.store.push(tag);
};