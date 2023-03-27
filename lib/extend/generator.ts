import Promise from 'bluebird';

interface StoreFunction {
  (...args: any[]): any;
}

interface Store {
  [key: string]: StoreFunction
}

class Generator {
  public id: number;
  public store: Store;

  constructor() {
    this.id = 0;
    this.store = {};
  }

  list() {
    return this.store;
  }

  get(name: string) {
    return this.store[name];
  }

  register(fn: StoreFunction): void
  register(name: string, fn: StoreFunction): void
  register(name: string | StoreFunction, fn?: StoreFunction) {
    if (!fn) {
      if (typeof name === 'function') { // fn
        fn = name;
        name = `generator-${this.id++}`;
      } else {
        throw new TypeError('fn must be a function');
      }
    }

    if (fn.length > 1) fn = Promise.promisify(fn);
    this.store[name as string] = Promise.method(fn);
  }
}

export = Generator;
