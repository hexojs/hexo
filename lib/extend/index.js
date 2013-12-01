/**
* This class is used to manage all plugins used in Hexo.
*
* There're 10 types of plugins:
*
* - {{#crossLink "Hexo.Extend.Console"}}Console{{/crossLink}}
* - {{#crossLink "Hexo.Extend.Deployer"}}Deployer{{/crossLink}}
* - {{#crossLink "Hexo.Extend.Filter"}}Filter{{/crossLink}}
* - {{#crossLink "Hexo.Extend.Generator"}}Generator{{/crossLink}}
* - {{#crossLink "Hexo.Extend.Helper"}}Helper{{/crossLink}}
* - {{#crossLink "Hexo.Extend.Migrator"}}Migrator{{/crossLink}}
* - {{#crossLink "Hexo.Extend.Processor"}}Processor{{/crossLink}}
* - {{#crossLink "Hexo.Extend.Renderer"}}Renderer{{/crossLink}}
* - {{#crossLink "Hexo.Extend.Swig"}}Swig{{/crossLink}}
* - {{#crossLink "Hexo.Extend.Tag"}}Tag{{/crossLink}}
*
* @class Extend
* @constructor
* @namespace Hexo
* @module hexo
*/

var Extend = module.exports = function(){
};

/**
* Registers a new module.
*
* @method module
* @param {String} name
* @param {Function} fn
*/

Extend.prototype.module = function(name, fn){
  this[name] = new fn();
};