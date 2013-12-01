/**
* See {{#crossLink "Hexo.util.yfm/parse"}}{{/crossLink}} method of {{#crossLink "Hexo.util.yfm"}}{{/crossLink}}.
*
* @method yfm
* @param {String} source
* @return {Object}
* @for Hexo.util
* @static
*/

/**
* YAML front-matter parser.
*
* @class yfm
* @namespace Hexo.util
* @module hexo
* @static
*/

var _ = require('lodash'),
  yaml = require('yamljs'),
  escape = require('./escape').yaml;

var yfm = module.exports = function(source){
  var content = source.replace(/^-{3}/, '').split('---');

  if (content.length === 1){
    var result = {_content: content[0]};
  } else {
    var result = yaml.parse(escape(content.shift()));
    result._content = content.join('---').replace(/^\n*/, '');
  }

  return result;
};

/**
* Parses YAML front-matter.
*
* @method parse
* @param {String} source
* @return {Object}
* @static
*/

yfm.parse = function(source){
  return yfm(source);
};

/**
* Converts the object to YAML front-matter string.
*
* @method stringify
* @param {Object} data
* @return {String}
* @static
*/

yfm.stringify = function(obj){
  return yaml.stringify(_.omit(obj, '_content')) + '\n---\n' + obj._content;
};