interface StoreFunction {
  (...args: any[]): string;
}

interface Store {
  [key: string]: StoreFunction
}


class Helper {
  public store: Store;

  constructor() {
    this.store = {};
  }

  /**
   * @returns {Store} - The plugin store
   */
  list(): Store {
    return this.store;
  }

  /**
   * Get helper plugin function by name
   * @param {String} name - The name of the helper plugin
   * @returns {StoreFunction}
   */
  get(name: string): StoreFunction {
    return this.store[name];
  }

  /**
   * Register a helper plugin
   * @param {String} name - The name of the helper plugin
   * @param {StoreFunction} fn - The helper plugin function
   */
  register(name: string, fn: StoreFunction): void {
    if (!name) throw new TypeError('name is required');
    if (typeof fn !== 'function') throw new TypeError('fn must be a function');

    this.store[name] = fn;
  }
}

export = Helper;
