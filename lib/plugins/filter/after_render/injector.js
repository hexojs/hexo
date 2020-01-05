'use strict';

const { Cache } = require('hexo-util');
const cache = new Cache();

function injectFilter(data, locals = { page: {} }) {
  const { injector: _Injector } = this.extend;

  const current = () => {
    const { page } = locals;

    if (page.__index) return 'home';
    if (page.__post) return 'post';
    if (page.__page) return 'page';
    if (page.archive) return 'archive';
    if (page.category) return 'category';
    if (page.tag) return 'tag';
    return 'default';
  };

  function injector(data, pattern, flag, isBegin = true) {
    if (data.includes(`hexo injector ${flag}`)) return data;

    const arr = cache.apply(
      `${flag}-${current()}-arr`,
      _Injector.get(flag).filter(i => i.to === current()).map(i => i.value)
    );

    if (!arr.length) return data;

    return data.replace(pattern, str => {
      const code = cache.apply(
        `${flag}-${current()}-code`,
        () => arr.reduce((a, c) => a + c, '')
      );

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
