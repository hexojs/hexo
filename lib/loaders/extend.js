var Extend = require('../extend'),
  HexoError = require('../error');

module.exports = function(callback){
  /**
  * The extend instance.
  *
  * @property extend
  * @type Extend
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
    'tag'
  ].forEach(function(item){
    extend.module(item, require('../extend/' + item));

    try {
      require('../plugins/' + item);
    } catch (e){}
  });

  callback();
};