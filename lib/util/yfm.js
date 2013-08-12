/**
 * Module dependencies.
 */

var _ = require('lodash'),
  yaml = require('yamljs');

/**
 * Parse YAML front-matter.
 *
 * @param {String} source
 * @return {Object}
 * @api public
 */

var yfm = module.exports = function(source){
  var content = source.replace(/^-{3}/, '').split('---');

  if (content.length === 1){
    var result = {_content: content[0]};
  } else {
    var result = yaml.parse(content.shift());
    result._content = content.join('---').replace(/^\n*/, '');
  }

  return result;
};

/**
 * Parse YAML front-matter.
 *
 * @param {String} source
 * @return {Object}
 * @api public
 */

yfm.parse = function(source){
  return yfm(source);
};

/**
 * Stringify YAML front-matter.
 *
 * @param {Object} obj
 * @return {String}
 * @api public
 */

yfm.stringify = function(obj){
  return yaml.stringify(_.omit(obj, '_content')) + '\n---\n' + obj._content;
};