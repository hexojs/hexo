import Promise from 'bluebird';
interface StoreFunction {
  (args: any): any
}

interface Store {
  [key: string]: StoreFunction
}

class Migrator {
  public store: Store;

  constructor() {
    this.store = {};
  }

  list() {
    return this.store;
  }

  get(name: string) {
    return this.store[name];
  }

  register(name: string, fn: StoreFunction) {
    if (!name) throw new TypeError('name is required');
    if (typeof fn !== 'function') throw new TypeError('fn must be a function');

    if (fn.length > 1) {
      fn = Promise.promisify(fn);
    } else {
      fn = Promise.method(fn);
    }

    this.store[name] = fn;
  }
}

export = Migrator;
