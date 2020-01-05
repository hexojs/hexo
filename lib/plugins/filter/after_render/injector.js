'use strict';

function injectFilter(data, locals = { page: {} }) {
  const { injector: _Injector } = this.extend;

  const is = input => {
    let result = true;
    const { page } = locals;

    switch (input) {
      case 'home':
        result = Boolean(page.__index);
        break;

      case 'post':
        result = Boolean(page.__post);
        break;

      case 'page':
        result = Boolean(page.__page);
        break;

      case 'archive':
        result = Boolean(page.archive);
        break;

      case 'category':
        result = Boolean(page.category);
        break;

      case 'tag':
        result = Boolean(page.tag);
        break;

      default:
        result = true;
    }

    return result;
  };

  function injector(data, pattern, flag, isBegin = true) {
    return data.replace(pattern, str => {
      if (data.includes(`hexo injector ${flag}`)) return str;

      const arr = _Injector.get(flag).filter(i => is(i.to)).map(i => i.value);

      if (arr.length) {
        const code = arr.reduce((a, c) => a + c, '');

        if (isBegin) {
          return str
            + '<!-- hexo injector ' + flag + ' start -->'
            + code
            + '<!-- hexo injector ' + flag + ' end -->';
        }

        return '<!-- hexo injector ' + flag + ' start -->'
          + code
          + '<!-- hexo injector ' + flag + ' end -->'
          + str;
      }

      return str;
    });
  }

  // Inject head_begin
  data = injector(data, /<head.*?>/, 'head_begin', true);
  // Inject head_end
  data = injector(data, '</head>', 'head_end', false);
  // Inject body_begin
  data = injector(data, /<body.*?>/, 'body_begin', true);
  // Inject body_end
  data = injector(data, '</body>', 'body_end', false);

  return data;
}

module.exports = injectFilter;
