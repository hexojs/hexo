'use strict';

function markdownHelper(text, options){
  /* jshint validthis: true */
  return this.render(text, 'markdown', options);
}

module.exports = markdownHelper;