var _ = require('lodash'),
  escape = require('./escape');

var rParam = /:(\w+)/g;

/**
* Permalink parser.
*
* @class Permalink
* @param {String} rule
* @param {Object} [options]
*   @param {Object} [options.segments] Customize regular expressions for each segment in the permalink
* @namespace util
* @constructor
* @module hexo
*/
var Permalink = module.exports = function(rule, options){
  options = _.extend({
    segments: {}
  }, options);

  var segments = options.segments,
    params = [];

  var regex = escape.regex(rule)
    .replace(rParam, function(match, name){
      params.push(name);

      if (segments.hasOwnProperty(name)){
        var segment = segments[name];

        if (segment instanceof RegExp){
          return segment.source;
        } else {
          return segment;
        }
      } else {
        return '(.+?)';
      }
    });

  /**
  * Permalink rule.
  *
  * @property rule
  * @type String
  */
  this.rule = rule;

  /**
  * Regular expression of permalink.
  *
  * @property regex
  * @type RegExp
  */
  this.regex = new RegExp('^' + regex + '$');

  /**
  * Parameters of permalink.
  *
  * @property params
  * @type Array
  */
  this.params = params;
};

/**
* Tests if the string matches the permalink.
*
* @method test
* @param {String} str
* @return {Boolean}
*/
Permalink.prototype.test = function(str){
  return this.regex.test(str);
};

/**
* Parses the string and returns an object.
*
* @method parse
* @param {String} str
* @return {Object}
*/
Permalink.prototype.parse = function(str){
  var match = str.match(this.regex),
    params = this.params,
    result = {};

  if (!match) return;

  for (var i = 1, len = match.length; i < len; i++){
    result[params[i - 1]] = match[i];
  }

  return result;
};

/**
* Serializes the data to the permalink.
*
* @method stringify
* @param {Object} data
* @return {String}
*/
Permalink.prototype.stringify = function(data){
  return this.rule.replace(rParam, function(match, name){
    return data[name];
  });
};

Permalink.parse = function(rule, str){
  return new Permalink(rule).parse(str);
};

Permalink.stringify = function(rule, data){
  return new Permalink(rule).stringify(data);
};