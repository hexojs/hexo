'use strict';

const { Cache } = require('hexo-util');
const cache = new Cache();

function injectFilter(data, locals = { page: {} }) {
  const Injector = this.extend.injector;

  const current = () => {
    const { page } = locals;

    if (page.__index) return 'home';
    if (page.__post) return 'post';
    if (page.__page) return 'page';
    if (page.archive) return 'archive';
    if (page.category) return 'category';
    if (page.tag) return 'tag';
    if (page.layout) return page.layout;
    return 'default';
  };

  function injector(data, pattern, flag, isBegin = true) {
    if (data.includes(`hexo injector ${flag}`)) return data;

    const currentType = current();
    const code = cache.apply(`${flag}-${currentType}-code`, () => {
      const content = currentType === 'default' ? Injector.getText(flag, 'default') : Injector.getText(flag, currentType) + Injector.getText(flag, 'default');

      if (!content.length) return '';

      return '<!-- hexo injector ' + flag + ' start -->' + content + '<!-- hexo injector ' + flag + ' end -->';
    });

    // avoid unnesscary replace() for better performance
    if (!code.length) return data;

    return data.replace(pattern, str => { return isBegin ? str + code : code + str; });
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
