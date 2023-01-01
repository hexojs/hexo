interface Options {
  context?: any;
  args?: any;
}

interface StoreFunction {
  (...args: any[]): any;
  priority?: number;
}

interface Store {
  [key: string]: StoreFunction
}

class SyntaxHighlight {
  public store: Store;

  constructor() {
    this.store = {};
  }

  register(name: string, fn: StoreFunction) {
    if (typeof fn !== 'function') throw new TypeError('fn must be a function');

    this.store[name] = fn;
  }

  query(name: string) {
    return name && this.store[name];
  }

  exec(name: string, options: Options) {
    const fn = this.store[name];

    if (!fn) throw new TypeError(`syntax highlighter ${name} is not registered`);
    const ctx = options.context;
    const args = options.args || [];

    return Reflect.apply(fn, ctx, args);
  }
}

export = SyntaxHighlight;
