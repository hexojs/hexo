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
  * See {{#crossLink "Hexo.util.file"}}{{/crossLink}}
  *
  * @property file
  * @type Hexo.util.file
  * @deprecated Use hexo.util.file2 or hexo.file instead.
  */

  file: require('./file'),

  /**
  * See {{#crossLink "Hexo.util.yfm"}}{{/crossLink}}
  *
  * @property yfm
  * @type Hexo.util.yfm
  */

  yfm: require('./yfm'),
  spawn: require('./spawn'),
  exec: require('./exec'),
  highlight: require('./highlight'),

  /**
  * See {{#crossLink "Hexo.util.file2"}}{{/crossLink}}
  *
  * @property file2
  * @type Hexo.util.file2
  */

  file2: require('./file2'),

  /**
  * See {{#crossLink "Hexo.util.escape"}}{{/crossLink}}
  *
  * @property escape
  * @type Hexo.util.escape
  */

  escape: require('./escape'),

  /**
  * See {{#crossLink "Hexo.util.Pool"}}{{/crossLink}}
  *
  * @property pool
  * @type Hexo.util.Pool
  */

  pool: require('./pool'),
  html_tag: require('./html_tag'),

  /**
  * See {{#crossLink "Hexo.util.inflector"}}{{/crossLink}}
  *
  * @property inflector
  * @type Hexo.util.inflector
  */

  inflector: require('./inflector'),

  /**
  * See {{#crossLink "Hexo.util.inflector/titleize"}}{{/crossLink}} method of {{#crossLink "Hexo.util.inflector"}}{{/crossLink}}.
  *
  * @method titlecase
  * @param {String} str
  * @return {String}
  */

  titlecase: require('./inflector').titlecase
};