'use strict';

function injectFilter(data) {
  const { inject: Inject } = this.extend;

  data = data.replace(/<head.*?>(?!<\/head>).+?<\/head>/s, str => {
    // Inject head_begin
    str.replace(/<head.*?>/, headStartTag => {
      if (str.includes('hexo injector head_begin')) return headStartTag;

      let code = '';
      for (const line of Inject.get('head_begin')) {
        code += line;
      }

      return headStartTag
          + '<!-- hexo injector head_begin start -->'
          + code
          + '<!-- hexo injector head_begin end -->';
    });

    // Inject head_end
    str.replace('</head>', headEndTag => {
      if (str.includes('hexo injector head_end')) return headEndTag;

      let code = '';
      for (const line of Inject.get('head_end')) {
        code += line;
      }

      return '<!-- hexo injector head_end start -->'
          + code
          + '<!-- hexo injector head_end end -->'
          + headEndTag;
    });

    return str;
  });

  // Inject body_begin
  data = data.replace(/<body.*?>/, bodyStartTag => {
    if (data.includes('hexo injector body_begin')) return bodyStartTag;

    let code = '';
    for (const line of Inject.get('body_begin')) {
      code += line;
    }

    return bodyStartTag
      + '<!-- hexo injector body_begin start -->'
      + code
      + '<!-- hexo injector body_begin end -->';
  });

  // Inject body_end
  data = data.replace('</body>', bodyEndTag => {
    if (data.includes('hexo injector body_end')) return bodyEndTag;

    let code = '';
    for (const line of Inject.get('body_end')) {
      code += line;
    }

    return '<!-- hexo injector body_end start -->'
      + code
      + '<!-- hexo injector body_end end -->'
      + bodyEndTag;
  });

  return data;
}

module.exports = injectFilter;
