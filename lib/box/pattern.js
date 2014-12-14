var util = require('../util');
var escape = util.escape;

var rParam = /([:\*])([\w\?]*)?/g;

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
function Pattern(rule){
  if (rule instanceof Pattern){
    return rule;
  } else if (typeof rule === 'function'){
    this.match = rule;
  } else if (rule instanceof RegExp){
    this.match = regexFilter(rule);
  } else if (typeof rule === 'string'){
    this.match = stringFilter(rule);
  } else {
    throw new TypeError('rule must be a function, a string or a regular expression.');
  }
}

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
Pattern.prototype.match;

function regexFilter(rule){
  return function(str){
    return str.match(rule);
  };
}

function stringFilter(rule){
  var params = [];

  var regex = escape.regex(rule)
    .replace(/\\([\*\?])/g, '$1')
    .replace(rParam, function(match, operator, name){
      var str = '';
      var optional = false;

      if (operator === '*'){
        str = '(.*)?';
      } else {
        str = '([^\\/]+)';
      }

      if (name){
        if (name[name.length - 1] === '?'){
          name = name.slice(0, name.length - 1);
          optional = true;
          str += '?';
        }

        params.push(name);
      }

      return str;
    });

  return function(str){
    var match = str.match(regex);
    if (!match) return;

    var result = {};
    var name;

    for (var i = 0, len = match.length; i < len; i++){
      name = params[i - 1];
      result[i] = match[i];
      if (name) result[name] = match[i];
    }

    return result;
  };
}

module.exports = Pattern;