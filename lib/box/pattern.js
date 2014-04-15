var util = require('../util'),
  escape = util.escape;

var rParam = /(\()?([:\*])(\w*)\)?/g;

/**
* The pattern object of the Box class.
* This module parses the string and tests if the string matches the pattern.
*
* You can use a regular expression, a function or a Backbone-like string in the `rule` param.
*
* @class Pattern
* @param {RegExp|String|Function} rule
* @constructor
* @namespace Box
* @module hexo
*/
var Pattern = module.exports = function Pattern(rule){
  if (typeof rule === 'function'){
    this.filter = rule;
  } else if (rule instanceof RegExp){
    this.rule = rule;
    this.params = [];
  } else {
    var params = [];

    var regex = escape.regex(rule)
      .replace(/\\\*/g, '*')
      .replace(rParam, function(match, optional, operator, name){
        params.push(name);

        var str = '';

        if (operator === '*'){
          str = '(.*?)';
        } else {
          str = '([^\\/]+)';
        }

        if (optional) str += '?';

        return str;
      });

    this.rule = new RegExp('^' + regex + '$');
    this.params = params;
  }
};

/**
* Tests if the string matches the pattern.
*
* @method test
* @param {String} str
* @return {Boolean}
*/
Pattern.prototype.test = function(str){
  return this.filter ? this.filter(str) : this.rule.test(str);
};

/**
* Tests if the string matches the pattern and returns the parameters in the URL. Returns `null` if the string doesn't matches the pattern.
*
* For example:
*
* ``` js
* // posts/:id
* pattern.match('posts/89')
* // {0: 'posts/89', 1: '89', id: '89'}
*
* // posts/*path
* pattern.match('posts/2013/hello-world')
* // {0: 'posts/2013/hello-world', 1: '2013/hello-world', path: '2013/hello-world'}
* ```
*
* @method match
* @param {String} str
* @return {Object}
*/
Pattern.prototype.match = function(str){
  if (this.filter) return this.filter(str);
  if (!this.test(str)) return;

  var match = str.match(this.rule),
    params = this.params,
    result = {};

  for (var i = 0, len = match.length; i < len; i++){
    var name = params[i - 1];

    result[i] = match[i];

    if (name) result[name] = match[i];
  }

  return result;
};