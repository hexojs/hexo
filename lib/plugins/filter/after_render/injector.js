'use strict';

function injectFilter(data) {
  const { injector: _Injector } = this.extend;

  function injector(data, pattern, flag, isBegin = true) {
    return data.replace(pattern, str => {
      if (data.includes(`hexo injector ${flag}`)) return str;

      const arr = _Injector.get(flag);

      if (arr.length) {
        let code = '';

        for (const line of arr) {
          code += line;
        }

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
