'use strict';

function feedTagHelper(path, options) {
  options = options || {};

  var title = options.title || this.config.title;
  var type = options.type || 'atom';

  return '<link rel="alternate" href="' + this.url_for(path) + '" title="' + title + '" type="application/' + type + '+xml">';
}

module.exports = feedTagHelper;
