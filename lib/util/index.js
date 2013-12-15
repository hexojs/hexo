/**
* Utilities.
*
* @class util
* @namespace Hexo
* @module hexo
* @static
*/

module.exports = {
  /**
  * See {% crosslink Hexo.util.file %}
  *
  * @property file
  * @type Hexo.util.file
  * @deprecated Use hexo.util.file2 or hexo.file instead.
  */

  file: require('./file'),

  /**
  * See {% crosslink Hexo.util.yfm %}
  *
  * @property yfm
  * @type Hexo.util.yfm
  */

  yfm: require('./yfm'),
  spawn: require('./spawn'),
  exec: require('./exec'),
  highlight: require('./highlight'),

  /**
  * See {% crosslink Hexo.util.file2 %}
  *
  * @property file2
  * @type Hexo.util.file2
  */

  file2: require('./file2'),

  /**
  * See {% crosslink Hexo.util.escape %}
  *
  * @property escape
  * @type Hexo.util.escape
  */

  escape: require('./escape'),

  /**
  * See {% crosslink Hexo.util.Pool %}
  *
  * @property pool
  * @type Hexo.util.Pool
  */

  pool: require('./pool'),
  html_tag: require('./html_tag'),

  /**
  * See {% crosslink Hexo.util.inflector %}
  *
  * @property inflector
  * @type Hexo.util.inflector
  */

  inflector: require('./inflector'),

  /**
  * See {% crosslink Hexo.util.inflector/titleize %}.
  *
  * @method titlecase
  * @param {String} str
  * @return {String}
  */

  titlecase: require('./inflector').titlecase
};