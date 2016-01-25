'use strict';

function feedTagHelper(path, options) {
  options = options || {};

  var title = options.title || this.config.title;
  var type = options.type || 'atom'; // eslint-disable-line no-unused-vars

  return '<link rel="alternate" href="' + this.url_for(path) + '" title="' + title + '">';
}

module.exports = feedTagHelper;
