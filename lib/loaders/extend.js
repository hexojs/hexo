var Extend = require('../extend');

module.exports = function(callback){
  /**
  * The extend instance.
  *
  * @property extend
  * @type Hexo.Extend
  * @for Hexo
  */

  var extend = hexo.extend = new Extend();

  [
    'console',
    'deployer',
    'filter',
    'generator',
    'helper',
    'migrator',
    'processor',
    'renderer',
    'swig',
    'tag'
  ].forEach(function(item){
    extend.module(item, require('../extend/' + item));

    try {
      require('../plugins/' + item);
    } catch (e){}
  });

  callback();
};