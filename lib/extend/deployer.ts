import Promise from 'bluebird';

interface StoreFunction {
  (deployArg: {
    type: string;
    [key: string]: any
  }) : any;
}
interface Store {
  [key: string]: StoreFunction
}

class Deployer {
  public store: Store;

  constructor() {
    this.store = {};
  }

  list(): Store {
    return this.store;
  }

  get(name: string): StoreFunction {
    return this.store[name];
  }

  register(name: string, fn: StoreFunction): void {
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

export = Deployer;
