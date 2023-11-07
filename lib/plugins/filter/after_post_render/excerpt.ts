const rExcerpt = /<!-- ?more ?-->/i;

function excerptFilter(data): void {
  const { content } = data;

  if (typeof data.excerpt !== 'undefined') {
    data.more = content;
  } else if (rExcerpt.test(content)) {
    data.content = content.replace(rExcerpt, (match, index) => {
      data.excerpt = content.substring(0, index).trim();
      data.more = content.substring(index + match.length).trim();

      return '<span id="more"></span>';
    });
  } else {
    data.excerpt = '';
    data.more = content;
  }
}

export = excerptFilter;
