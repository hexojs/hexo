import Promise from 'bluebird';

const typeAlias = {
  pre: 'before_post_render',
  post: 'after_post_render',
  'after_render:html': '_after_html_render'
};

interface FilterOptions {
  context?: any;
  args?: any[];
}

interface StoreFunction {
  (data?: any, ...args: any[]): any;
  priority?: number;
}

interface Store {
  [key: string]: StoreFunction[]
}

class Filter {
  public store: Store;

  constructor() {
    this.store = {};
  }

  list(): Store;
  list(type: string): StoreFunction[];
  list(type?: string) {
    if (!type) return this.store;
    return this.store[type] || [];
  }

  register(fn: StoreFunction): void
  register(fn: StoreFunction, priority: number): void
  register(type: string, fn: StoreFunction): void
  register(type: string, fn: StoreFunction, priority: number): void
  register(type: string | StoreFunction, fn?: StoreFunction | number, priority?: number): void {
    if (!priority) {
      if (typeof type === 'function') {
        priority = fn as number;
        fn = type;
        type = 'after_post_render';
      }
    }

    if (typeof fn !== 'function') throw new TypeError('fn must be a function');

    type = typeAlias[type as string] || type;
    priority = priority == null ? 10 : priority;

    const store = this.store[type as string] || [];
    this.store[type as string] = store;

    fn.priority = priority;
    store.push(fn);

    store.sort((a, b) => a.priority - b.priority);
  }

  unregister(type: string, fn: StoreFunction): void {
    if (!type) throw new TypeError('type is required');
    if (typeof fn !== 'function') throw new TypeError('fn must be a function');

    type = typeAlias[type] || type;

    const list = this.list(type);
    if (!list || !list.length) return;

    const index = list.indexOf(fn);

    if (index !== -1) list.splice(index, 1);
  }

  exec(type: string, data: any[], options: FilterOptions = {}): Promise<any> {
    const filters = this.list(type);
    if (filters.length === 0) return Promise.resolve(data);

    const ctx = options.context;
    const args = options.args || [];

    args.unshift(data);

    return Promise.each(filters, filter => Reflect.apply(Promise.method(filter), ctx, args).then(result => {
      args[0] = result == null ? args[0] : result;
      return args[0];
    })).then(() => args[0]);
  }

  execSync(type: string, data: any[], options: FilterOptions = {}) {
    const filters = this.list(type);
    const filtersLen = filters.length;
    if (filtersLen === 0) return data;

    const ctx = options.context;
    const args = options.args || [];

    args.unshift(data);

    for (let i = 0, len = filtersLen; i < len; i++) {
      const result = Reflect.apply(filters[i], ctx, args);
      args[0] = result == null ? args[0] : result;
    }

    return args[0];
  }
}

export = Filter;
