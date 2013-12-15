/**
* This class is used to manage all plugins used in Hexo.
*
* There're 10 types of plugins:
*
* - {% crosslink Hexo.Extend.Console Console %}
* - {% crosslink Hexo.Extend.Deployer Deployer %}
* - {% crosslink Hexo.Extend.Filter Filter %}
* - {% crosslink Hexo.Extend.Generator Generator %}
* - {% crosslink Hexo.Extend.Helper Helper %}
* - {% crosslink Hexo.Extend.Migrator Migrator %}
* - {% crosslink Hexo.Extend.Processor Processor %}
* - {% crosslink Hexo.Extend.Renderer Renderer %}
* - {% crosslink Hexo.Extend.Swig Swig %}
* - {% crosslink Hexo.Extend.Tag Tag %}
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