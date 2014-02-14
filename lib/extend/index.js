/**
* This class is used to manage all plugins used in Hexo.
*
* There're 9 types of plugins:
*
* - {% crosslink Extend.Console Console %}
* - {% crosslink Extend.Deployer Deployer %}
* - {% crosslink Extend.Filter Filter %}
* - {% crosslink Extend.Generator Generator %}
* - {% crosslink Extend.Helper Helper %}
* - {% crosslink Extend.Migrator Migrator %}
* - {% crosslink Extend.Processor Processor %}
* - {% crosslink Extend.Renderer Renderer %}
* - {% crosslink Extend.Tag Tag %}
*
* @class Extend
* @constructor
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