'use strict';

var rExcerpt = /<!--+\s*more\s*--+>/i;

function excerptFilter(data) {
  var content = data.content;

  if (rExcerpt.test(content)) {
    data.content = content.replace(rExcerpt, function(match, index) {
      data.excerpt = content.substring(0, index).trim();
      data.more = content.substring(index + match.length).trim();

      return '<a id="more"></a>';
    });
  } else {
    data.excerpt = '';
    data.more = content;
  }
}

module.exports = excerptFilter;
