/**
* This class is used to manage all plugins used in Hexo.
*
* There're 10 types of plugins:
*
* - {% crossLink Hexo.Extend.Console Console %}
* - {% crossLink Hexo.Extend.Deployer Deployer %}
* - {% crossLink Hexo.Extend.Filter Filter %}
* - {% crossLink Hexo.Extend.Generator Generator %}
* - {% crossLink Hexo.Extend.Helper Helper %}
* - {% crossLink Hexo.Extend.Migrator Migrator %}
* - {% crossLink Hexo.Extend.Processor Processor %}
* - {% crossLink Hexo.Extend.Renderer Renderer %}
* - {% crossLink Hexo.Extend.Swig Swig %}
* - {% crossLink Hexo.Extend.Tag Tag %}
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