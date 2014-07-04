/**
* Utilities.
*
* @class util
* @module hexo
* @static
*/

module.exports = {
  /**
  * See {% crosslink util.file %}
  *
  * @property file
  * @type util.file
  * @deprecated Use hexo.util.file2 or hexo.file instead.
  */

  file: require('./file'),

  /**
  * See [front-matter](https://github.com/hexojs/front-matter)
  *
  * @property yfm
  * @type util.yfm
  */

  yfm: require('hexo-front-matter'),
  spawn: require('./spawn'),
  exec: require('./exec'),
  highlight: require('./highlight'),

  /**
  * See {% crosslink util.file2 %}
  *
  * @property file2
  * @type util.file2
  */

  file2: require('./file2'),

  /**
  * See {% crosslink util.escape %}
  *
  * @property escape
  * @type util.escape
  */

  escape: require('./escape'),

  /**
  * See {% crosslink util.Pool %}
  *
  * @property pool
  * @type util.Pool
  */

  pool: require('./pool'),
  html_tag: require('./html_tag'),

  /**
  * See {% crosslink util.inflector %}
  *
  * @property inflector
  * @type util.inflector
  */

  inflector: require('./inflector'),

  /**
  * See {% crosslink util.inflector/titleize %}.
  *
  * @method titlecase
  * @param {String} str
  * @return {String}
  */

  titlecase: require('./inflector').titlecase,

  /**
  * See {% crosslink util.format %}.
  *
  * @property format
  * @type util.format
  */

  format: require('./format'),

  /**
  * See {% crosslink util.server %}
  *
  * @property server
  * @type util.server
  */
  server: require('./server'),

  /**
  * See {% crosslink util.Permalink %}
  *
  * @property permalink
  * @type util.Permalink
  */
  permalink: require('./permalink')
};