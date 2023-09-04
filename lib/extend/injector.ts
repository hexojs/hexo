import { Cache } from 'hexo-util';

type Entry = 'head_begin' | 'head_end' | 'body_begin' | 'body_end';

type Store = {
  [key in Entry]: {
    [key: string]: Set<unknown>;
  };
};

class Injector {
  public store: Store;
  public cache: any;
  public page: any;

  constructor() {
    this.store = {
      head_begin: {},
      head_end: {},
      body_begin: {},
      body_end: {}
    };

    this.cache = new Cache();
  }

  list(): Store {
    return this.store;
  }

  get(entry: Entry, to = 'default'): any[] {
    return Array.from(this.store[entry][to] || []);
  }

  getText(entry: Entry, to = 'default'): string {
    const arr = this.get(entry, to);
    if (!arr || !arr.length) return '';
    return arr.join('');
  }

  getSize(entry: Entry) {
    return this.cache.apply(`${entry}-size`, Object.keys(this.store[entry]).length);
  }

  register(entry: Entry, value: string | (() => string), to = 'default'): void {
    if (!entry) throw new TypeError('entry is required');
    if (typeof value === 'function') value = value();

    const entryMap = this.store[entry] || this.store.head_end;
    const valueSet = entryMap[to] || new Set();
    valueSet.add(value);
    entryMap[to] = valueSet;
  }

  _getPageType(pageLocals): string {
    let currentType = 'default';
    if (pageLocals.__index) currentType = 'home';
    if (pageLocals.__post) currentType = 'post';
    if (pageLocals.__page) currentType = 'page';
    if (pageLocals.archive) currentType = 'archive';
    if (pageLocals.category) currentType = 'category';
    if (pageLocals.tag) currentType = 'tag';
    if (pageLocals.layout) currentType = pageLocals.layout;

    return currentType;
  }

  _injector(input: string, pattern: string | RegExp, flag: Entry, isBegin = true, currentType: string): string {
    if (input.includes(`hexo injector ${flag}`)) return input;

    const code = this.cache.apply(`${flag}-${currentType}-code`, () => {
      const content = currentType === 'default' ? this.getText(flag, 'default') : this.getText(flag, currentType) + this.getText(flag, 'default');

      if (!content.length) return '';
      return '<!-- hexo injector ' + flag + ' start -->' + content + '<!-- hexo injector ' + flag + ' end -->';
    });

    // avoid unnecessary replace() for better performance
    if (!code.length) return input;

    return input.replace(pattern, str => { return isBegin ? str + code : code + str; });
  }

  exec(data: string, locals = { page: {} }): string {
    const { page } = locals;
    const currentType = this._getPageType(page);

    if (this.getSize('head_begin') !== 0) {
      // Inject head_begin
      data = this._injector(data, /<head.*?>/, 'head_begin', true, currentType);
    }

    if (this.getSize('head_end') !== 0) {
      // Inject head_end
      data = this._injector(data, '</head>', 'head_end', false, currentType);
    }

    if (this.getSize('body_begin') !== 0) {
      // Inject body_begin
      data = this._injector(data, /<body.*?>/, 'body_begin', true, currentType);
    }

    if (this.getSize('body_end') !== 0) {
      // Inject body_end
      data = this._injector(data, '</body>', 'body_end', false, currentType);
    }

    return data;
  }
}

export = Injector;
