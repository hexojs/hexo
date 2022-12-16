'use strict';

module.exports = ctx => {
  const { highlight } = ctx.extend;

  highlight.register('highlight.js', require('./highlight'));
  highlight.register('prismjs', require('./prism'));
};
