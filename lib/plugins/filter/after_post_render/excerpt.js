'use strict';

const rExcerpt = /<!--+\s*more\s*--+>/i;

function excerptFilter(data) {
  const content = data.content;

  if (rExcerpt.test(content)) {
    data.content = content.replace(rExcerpt, (match, index) => {
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
