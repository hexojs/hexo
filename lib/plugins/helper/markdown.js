'use strict';

function markdownHelper(text, options) {
  return this.render(text, 'markdown', options);
}

module.exports = markdownHelper;
