'use strict';

function markdownHelper(text, options) {
  return this.render(text, 'markdown', options);
}

export default markdownHelper;
