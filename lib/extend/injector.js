'use strict';

const { Cache } = require('hexo-util');

class Injector {
  constructor() {
    this.store = {
      head_begin: {},
      head_end: {},
      body_begin: {},
      body_end: {}
    };

    this.cache = new Cache();
  }

  list() {
    return this.store;
  }

  get(entry, to = 'default') {
    return Array.from(this.store[entry][to] || []);
  }

  getText(entry, to = 'default') {
    const arr = this.get(entry, to);
    if (!arr || !arr.length) return '';
    return arr.join('');
  }

  register(entry, value, to = 'default') {
    if (!entry) throw new TypeError('entry is required');
    if (typeof value === 'function') value = value();

    const entryMap = this.store[entry] || this.store.head_end;
    const valueSet = entryMap[to] || new Set();
    valueSet.add(value);
    entryMap[to] = valueSet;
  }

  exec(data, locals = { page: {} }) {
    let currentType = 'default';
    const { page } = locals;

    if (page.__index) currentType = 'home';
    if (page.__post) currentType = 'post';
    if (page.__page) currentType = 'page';
    if (page.archive) currentType = 'archive';
    if (page.category) currentType = 'category';
    if (page.tag) currentType = 'tag';
    if (page.layout) currentType = page.layout;

    const injector = (data, pattern, flag, isBegin = true) => {
      if (data.includes(`hexo injector ${flag}`)) return data;

      const code = this.cache.apply(`${flag}-${currentType}-code`, () => {
        const content = currentType === 'default' ? this.getText(flag, 'default') : this.getText(flag, currentType) + this.getText(flag, 'default');

        if (!content.length) return '';
        return '<!-- hexo injector ' + flag + ' start -->' + content + '<!-- hexo injector ' + flag + ' end -->';
      });

      // avoid unnecessary replace() for better performance
      if (!code.length) return data;
      return data.replace(pattern, str => { return isBegin ? str + code : code + str; });
    };

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
}

module.exports = Injector;
